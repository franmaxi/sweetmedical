import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import {
  App as AntApp,
  Layout,
  Row,
  Col,
  Card,
  Button,
  Typography,
  List,
  Empty,
  Space,
  Divider,
  Pagination,
  Select
} from "antd";
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import FiltrosTurnos from "../../components/FiltrosTurnos";
import ModalReservaTurno from "../../components/ModalReservaTurno";
import { getTurnos, getSedes, getMedicos, getPracticasGenericas, getEspecialidadesGenericas, reservarTurno } from "../../api/api.js";


const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

// Como no hay login, simulamos que el usuario activo es la paciente Ana.
const PACIENTE_ACTIVO = { pacienteId: 1, usuarioId: 201 };

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const getUTC3Date = (iso) => {
  const isUTC = iso.endsWith('Z') || iso.includes('+') || (iso.lastIndexOf('-') > 10);
  const isoString = isUTC ? iso : `${iso}Z`;
  const date = new Date(isoString);
  return new Date(date.getTime() - 3 * 60 * 60 * 1000);
};

const fmtHora = (iso) => {
  const d = getUTC3Date(iso);
  return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`;
};
const mesAbrev = (iso) => MESES[getUTC3Date(iso).getUTCMonth()] ?? "";
const dia = (iso) => getUTC3Date(iso).getUTCDate().toString().padStart(2, '0');

const FILTROS_DEFAULT = {
  especialidadGenericaId: undefined,
  sedeId: undefined,
  medicoId: undefined,
  fechaDesde: undefined,
  fechaHasta: undefined,
  practicaGenericaId: undefined,
  ordenarPor: "fechaHora",
  direccion: "asc",
};

function filtrosAParams(filtros) {
  const params = {};
  if (filtros.especialidadGenericaId) params.especialidadGenericaId = filtros.especialidadGenericaId;
  if (filtros.practicaGenericaId) params.practicaGenericaId = filtros.practicaGenericaId;
  if (filtros.medicoId) params.medicoId = filtros.medicoId;
  if (filtros.sedeId) params.sedeId = filtros.sedeId;
  if (filtros.fechaDesde) params.fechaDesde = filtros.fechaDesde.format("YYYY-MM-DD");
  if (filtros.fechaHasta) params.fechaHasta = filtros.fechaHasta.format("YYYY-MM-DD");
  if (filtros.ordenarPor && filtros.ordenarPor !== "fechaHora") params.ordenarPor = filtros.ordenarPor;
  if (filtros.direccion && filtros.direccion !== "asc") params.direccion = filtros.direccion;
  return params;
}

function paramsFiltros(searchParams) {
  return {
    especialidadGenericaId: searchParams.get("especialidadGenericaId") ?? undefined,
    practicaGenericaId: searchParams.get("practicaGenericaId") ?? undefined,
    medicoId: searchParams.get("medicoId") ?? undefined,
    sedeId: searchParams.get("sedeId") ?? undefined,
    fechaDesde: searchParams.get("fechaDesde") ? dayjs(searchParams.get("fechaDesde")) : undefined,
    fechaHasta: searchParams.get("fechaHasta") ? dayjs(searchParams.get("fechaHasta")) : undefined,
    ordenarPor: searchParams.get("ordenarPor") ?? "fechaHora",
    direccion: searchParams.get("direccion") ?? "asc",
  };
}

export default function BuscarTurnos() {
  return (
    <AntApp>
      <BuscarTurnosInner />
    </AntApp>
  );
}

function BuscarTurnosInner() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const { message, modal } = AntApp.useApp();

  const [filtrosBorrador, setFiltrosBorrador] = useState(() => paramsFiltros(searchParams));
  const [filtrosAplicados, setFiltrosAplicados] = useState(() => paramsFiltros(searchParams));

  // Catálogos.
  const [especialidadesGenericas, setEspecialidadesGenericas] = useState([]);
  const [practicasGenericas, setPracticasGenericas] = useState([]);

  const [sedes, setSedes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [medicosById, setMedicosById] = useState(new Map());
  const [sedesById, setSedesById] = useState(new Map());
  const [espPersonalizadasById, setEspPersonalizadasById] = useState(new Map());
  const [practicasById, setPracticasById] = useState(new Map());
  const [especialidesById, setEspecialidadesById] = useState(new Map());

  // Resultados y modal de reserva.
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [reservando, setReservando] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [paginasTotales, setPaginasTotales] = useState(1);

  const aplicarFiltros = () => {
    const nuevosFiltros = { ...filtrosBorrador };
    setFiltrosAplicados(nuevosFiltros);
    setPaginaActual(1);
    setSearchParams(filtrosAParams(nuevosFiltros));
  };

  // Carga inicial de catálogos.
  useEffect(() => {
    Promise.all([
      getSedes(),
      getMedicos(),
      getEspecialidadesGenericas(),
      getPracticasGenericas()
    ]).then(([sedesResponse, medicosResponse, especialidadesResponse, practicasResponse]) => {

      const listaSedes = Array.isArray(sedesResponse?.data) ? sedesResponse.data : [];
      const listaMedicos = Array.isArray(medicosResponse?.data) ? medicosResponse.data : [];
      const listaEspecialidades = Array.isArray(especialidadesResponse?.data) ? especialidadesResponse.data : [];
      const listaPracticas = Array.isArray(practicasResponse?.data) ? practicasResponse.data : [];

      setSedes(listaSedes);
      setMedicos(listaMedicos);
      setEspecialidadesGenericas(listaEspecialidades);
      setPracticasGenericas(listaPracticas);

      setSedesById(new Map(listaSedes.map((s) => [s._id ?? s.id, s])));
      setMedicosById(new Map(listaMedicos.map((s) => [s._id ?? s.id, s])));
      setEspecialidadesById(new Map(listaEspecialidades.map((s) => [s._id ?? s.id, s])));
      setPracticasById(new Map(listaPracticas.map((s) => [s._id ?? s.id, s])));
    });
  }, []);

  // El useEffect escucha la página actual y los filtros aplicados
  useEffect(() => {
    setCargando(true);
    getTurnos({
      estado: "DISPONIBLE",
      page: paginaActual,
      especialidadId: filtrosAplicados.especialidadGenericaId,
      sedeId: filtrosAplicados.sedeId,
      medicoId: filtrosAplicados.medicoId,
      practicaId: filtrosAplicados.practicaGenericaId,
      desde: filtrosAplicados.fechaDesde?.format("YYYY-MM-DD"),
      hasta: filtrosAplicados.fechaHasta?.format("YYYY-MM-DD"),
      ordenarPor: filtrosAplicados.ordenarPor?.replace("-", ""),
      ordenDireccion: filtrosAplicados.direccion
    })
      .then((response) => {
        const arrayReal = Array.isArray(response?.data) ? response.data : [];
        setPaginasTotales(response?.paginacion?.totalPaginas ?? 1);
        setResultados(arrayReal);
        setCargando(false);
      })
      .catch(() => {
        message.error(t("buscarTurnos.errorCarga"));
        setCargando(false);
      });
  }, [filtrosAplicados, paginaActual]);

  const medicoSeleccionado = turnoSeleccionado ? medicosById.get(turnoSeleccionado.medicoId) : null;
  const espSeleccionada = medicoSeleccionado
    ? espPersonalizadasById.get(medicoSeleccionado.especialidadId)
    : null;

  const confirmarReserva = async (motivo) => {
    if (!motivo) {
      message.warning(t("buscarTurnos.warningMotivo"));
      return;
    }
    setReservando(true);
    let params = { turnoId: turnoSeleccionado.id || turnoSeleccionado._id };
    if (motivo.tipo === "esp") params.especialidadId = motivo.id;
    if (motivo.tipo === "prac") params.practicaId = motivo.id;
    try {
      await reservarTurno(params);
      message.success(t("buscarTurnos.successReservado"));
      setResultados((r) => r.filter((t) => (t.id || t._id) !== (turnoSeleccionado.id || turnoSeleccionado._id)));
      setTurnoSeleccionado(null);
      navigate("/mis-turnos");
    } catch (error) {
      if (error.response?.status === 422) {
        modal.error({
          title: "Turno no disponible",
          content: t("buscarTurnos.errorTurnoNoDisponible"),
          centered: true,
        });
        // El turno ya no está disponible, lo sacamos de la lista
        setResultados((r) => r.filter((t) => (t.id || t._id) !== (turnoSeleccionado.id || turnoSeleccionado._id)));
        setTurnoSeleccionado(null);
      } else {
        message.error(error.response?.data?.message || t("buscarTurnos.errorGenericoReserva"));
      }
    } finally {
      setReservando(false);
    }
  };

  const limpiar = () => {
    setFiltrosBorrador(FILTROS_DEFAULT);
    setFiltrosAplicados(FILTROS_DEFAULT);
    setPaginaActual(1);
    setSearchParams({});
  };

  return (
    <Layout style={{ background: "#fafafa", minHeight: "100vh" }}>
      <Navbar />
      <Content style={{ padding: "clamp(20px, 4vw, 32px) clamp(16px, 4vw, 32px) clamp(40px, 6vw, 64px)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <Text style={{ color: "#be123c", fontWeight: 600, fontSize: 14 }}>{t("buscarTurnos.encabezado")}</Text>
          <Title level={2} style={{ marginTop: 8 }}>{t("buscarTurnos.titulo")}</Title>
          <Paragraph type="secondary" style={{ maxWidth: 720 }}>
            {t("buscarTurnos.subtitulo")}
          </Paragraph>

          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col xs={24} lg={8}>
              <FiltrosTurnos
                especialidadesGenericas={especialidadesGenericas}
                sedes={sedes}
                practicasGenericas={practicasGenericas}
                medicos={medicos}
                filtros={filtrosBorrador}
                setFiltros={setFiltrosBorrador}
                onAplicar={aplicarFiltros}
                onLimpiar={limpiar}
              />
            </Col>

            <Col xs={24} lg={16}>
              <Card>
                <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }}>
                  <Text>
                    {t("buscarTurnos.resultCount", {
                      count: resultados.length,
                      plural: resultados.length === 1 ? "" : "s",
                    })}
                  </Text>
                </Space>

                {resultados.length === 0 && !cargando ? (
                  <Empty description={t("buscarTurnos.noResults")} style={{ padding: "40px 0" }} />
                ) : (
                  <List
                    loading={cargando}
                    dataSource={resultados}
                    renderItem={(turno) => (
                      <List.Item
                        key={turno._id}
                        actions={[
                          <Button type="primary" onClick={() => setTurnoSeleccionado(turno)}>
                            {t("buscarTurnos.reservar")}
                          </Button>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <div
                              style={{
                                width: 56, height: 56, borderRadius: 12,
                                background: "#fff1f2", color: "#be123c",
                                display: "inline-flex", flexDirection: "column",
                                alignItems: "center", justifyContent: "center", fontWeight: 700,
                              }}
                            >
                              <span style={{ fontSize: 18, lineHeight: 1 }}>{dia(turno.fechaHora)}</span>
                              <span style={{ fontSize: 11, marginTop: 2 }}>{mesAbrev(turno.fechaHora)}</span>
                            </div>
                          }
                          title={turno.medico?.nombre}
                          description={
                            <div style={{ lineHeight: "1.6" }}>
                              {/* Línea 1: hora y sede */}
                              <Space split={<Divider type="vertical" />} size={0}>
                                <Text type="secondary"><ClockCircleOutlined /> {fmtHora(turno.fechaHora)}</Text>
                                <Text type="secondary"><EnvironmentOutlined /> {turno.sede?.nombre}</Text>
                              </Space>
                              {/* Línea 2: especialidades y prácticas con ellipsis */}
                              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                                <Text type="secondary">
                                  {[
                                    ...(Array.isArray(turno.especialidad) ? turno.especialidad : turno.especialidad ? [turno.especialidad] : []),
                                    ...(Array.isArray(turno.practica) ? turno.practica : turno.practica ? [turno.practica] : []),
                                  ].map(s => s?.nombre).filter(Boolean).join(" - ") || "—"}
                                </Text>
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </Card>
              <Pagination align="center" defaultCurrent={1} current={paginaActual} pageSize={10} total={paginasTotales * 10}
                style={{ marginTop: '16px' }}
                onChange={(page) => setPaginaActual(page)}
                showSizeChanger={false} />
            </Col>
          </Row>
        </div>
      </Content>
      <Footer />

      <ModalReservaTurno
        turno={turnoSeleccionado}
        medico={medicoSeleccionado}
        especialidadPersonalizada={espSeleccionada}
        practicasById={practicasById}
        onCancel={() => setTurnoSeleccionado(null)}
        onReservar={confirmarReserva}
        reservando={reservando}
      />
    </Layout>
  );
}
