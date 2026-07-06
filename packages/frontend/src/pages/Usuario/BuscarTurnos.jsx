import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
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
import { extraerMensajeError } from "../../api/errorUtils.js";
import { useCart } from "../../context/CartContext";


const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

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

// ─── Helpers URL ─────────────────────────────────────────────────────────────

const FILTROS_DEFAULT = {
  especialidadGenericaId: undefined,
  sedeId:                 undefined,
  medicoId:               undefined,
  fechaDesde:             undefined,
  fechaHasta:             undefined,
  practicaGenericaId:     undefined,
  ordenarPor:             "fechaHora",
  direccion:              "asc",
};

function parsearFiltrosURL(params) {
  return {
    especialidadGenericaId: params.get("especialidadGenericaId") || undefined,
    sedeId:                 params.get("sedeId")                 || undefined,
    medicoId:               params.get("medicoId")               || undefined,
    practicaGenericaId:     params.get("practicaGenericaId")     || undefined,
    fechaDesde: params.get("fechaDesde") ? dayjs(params.get("fechaDesde"), "YYYY-MM-DD") : undefined,
    fechaHasta: params.get("fechaHasta") ? dayjs(params.get("fechaHasta"), "YYYY-MM-DD") : undefined,
    ordenarPor: params.get("ordenarPor") || "fechaHora",
    direccion:  params.get("direccion")  || "asc",
  };
}

/** Convierte un objeto de filtros en un plain object apto para setSearchParams. */
function filtrosAParams(filtros, page = 1) {
  const params = {};
  if (filtros.especialidadGenericaId) params.especialidadGenericaId = filtros.especialidadGenericaId;
  if (filtros.practicaGenericaId)     params.practicaGenericaId     = filtros.practicaGenericaId;
  if (filtros.sedeId)                 params.sedeId                 = filtros.sedeId;
  if (filtros.medicoId)               params.medicoId               = filtros.medicoId;
  if (filtros.fechaDesde && filtros.fechaDesde.isValid()) params.fechaDesde = filtros.fechaDesde.format("YYYY-MM-DD");
  if (filtros.fechaHasta && filtros.fechaHasta.isValid()) params.fechaHasta = filtros.fechaHasta.format("YYYY-MM-DD");
  if (filtros.ordenarPor && filtros.ordenarPor !== "fechaHora") params.ordenarPor = filtros.ordenarPor;
  if (filtros.direccion  && filtros.direccion  !== "asc")       params.direccion  = filtros.direccion;
  if (page > 1) params.page = String(page);
  return params;
}

// ─── Componente raíz ─────────────────────────────────────────────────────────

export default function BuscarTurnos() {
  return (
    <AntApp>
      <BuscarTurnosInner />
    </AntApp>
  );
}

// ─── Componente interno ───────────────────────────────────────────────────────

function BuscarTurnosInner() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { message } = AntApp.useApp();
  const { agregar, estaEnCarrito } = useCart();

  // ─── URL como fuente de verdad de filtros y página ──────────────────────────
  const [searchParams, setSearchParams] = useSearchParams();

  // filtrosAplicados se deriva de la URL (solo lectura).
  const filtrosAplicados = parsearFiltrosURL(searchParams);
  const paginaActual     = parseInt(searchParams.get("page") || "1", 10);

  // filtrosBorrador es el estado local que edita el usuario antes de aplicar.
  const [filtrosBorrador, setFiltrosBorrador] = useState(() => parsearFiltrosURL(searchParams));

  // Si el usuario usa atrás/adelante del navegador, sincronizar el borrador.
  useEffect(() => {
    setFiltrosBorrador(parsearFiltrosURL(searchParams));
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Al presionar "Buscar": escribe los filtros del borrador en la URL.
  const aplicarFiltros = useCallback(() => {
    setSearchParams(filtrosAParams(filtrosBorrador, 1));
  }, [filtrosBorrador, setSearchParams]);

  // Limpiar: limpia borrador y URL.
  const limpiar = useCallback(() => {
    setFiltrosBorrador(FILTROS_DEFAULT);
    setSearchParams({});
  }, [setSearchParams]);

  // Cambiar de página: solo actualiza el param `page`.
  const cambiarPagina = useCallback((page) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (page === 1) next.delete("page");
      else next.set("page", String(page));
      return next;
    });
  }, [setSearchParams]);

  // ─── Catálogos ───────────────────────────────────────────────────────────────
  const [especialidadesGenericas, setEspecialidadesGenericas] = useState([]);
  const [practicasGenericas,      setPracticasGenericas]      = useState([]);
  const [sedes,                   setSedes]                   = useState([]);
  const [medicos,                 setMedicos]                 = useState([]);
  const [medicosById,             setMedicosById]             = useState(new Map());
  const [practicasById,           setPracticasById]           = useState(new Map());
  const [espPersonalizadasById]                               = useState(new Map());

  useEffect(() => {
    Promise.all([
      getSedes(),
      getMedicos(),
      getEspecialidadesGenericas(),
      getPracticasGenericas(),
    ]).then(([sedesRes, medicosRes, espRes, pracRes]) => {
      const listaSedes       = Array.isArray(sedesRes?.data)   ? sedesRes.data   : [];
      const listaMedicos     = Array.isArray(medicosRes?.data)  ? medicosRes.data  : [];
      const listaEsp         = Array.isArray(espRes?.data)      ? espRes.data      : [];
      const listaPrac        = Array.isArray(pracRes?.data)     ? pracRes.data     : [];

      setSedes(listaSedes);
      setMedicos(listaMedicos);
      setEspecialidadesGenericas(listaEsp);
      setPracticasGenericas(listaPrac);
      setMedicosById(new Map(listaMedicos.map((m) => [m._id ?? m.id, m])));
      setPracticasById(new Map(listaPrac.map((p) => [p._id ?? p.id, p])));
    });
  }, []);

  // ─── Resultados ─────────────────────────────────────────────────────────────
  const [resultados,   setResultados]   = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [paginasTotales, setPaginasTotales] = useState(1);

  // Re-fetch cuando cambian los filtros o la página (vienen de la URL).
  useEffect(() => {
    const controller = new AbortController();

    setCargando(true);
    getTurnos({
      estado: "DISPONIBLE",
      page:   paginaActual,
      especialidadId: filtrosAplicados.especialidadGenericaId,
      sedeId:         filtrosAplicados.sedeId,
      medicoId:       filtrosAplicados.medicoId,
      practicaId:     filtrosAplicados.practicaGenericaId,
      desde:          filtrosAplicados.fechaDesde?.format("YYYY-MM-DD"),
      hasta:          filtrosAplicados.fechaHasta?.format("YYYY-MM-DD"),
      ordenarPor:     filtrosAplicados.ordenarPor?.replace("-", ""),
      ordenDireccion: filtrosAplicados.direccion,
    })
      .then((response) => {
        if (controller.signal.aborted) return;
        setResultados(Array.isArray(response?.data) ? response.data : []);
        setPaginasTotales(response?.paginacion?.totalPaginas ?? 1);
        setCargando(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        message.error(extraerMensajeError(err, t("buscarTurnos.errorCarga")));
        setCargando(false);
      });

    return () => controller.abort();
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Reserva ─────────────────────────────────────────────────────────────────
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [reservando,        setReservando]        = useState(false);

  const medicoSeleccionado = turnoSeleccionado ? medicosById.get(turnoSeleccionado.medicoId) : null;
  const espSeleccionada    = medicoSeleccionado
    ? espPersonalizadasById.get(medicoSeleccionado.especialidadId)
    : null;

  const agregarAlCarrito = (motivo) => {
    if (!motivo) { message.warning(t("buscarTurnos.warningMotivo")); return; }
    const turnoId = turnoSeleccionado.id || turnoSeleccionado._id;
    if (estaEnCarrito(turnoId)) {
      message.info(t("carrito.yaEnCarrito"));
      setTurnoSeleccionado(null);
      return;
    }
    agregar({
      turnoId,
      medicoNombre: turnoSeleccionado.medico?.nombre || turnoSeleccionado.medicoNombre || "Médico",
      fechaHora: turnoSeleccionado.fechaHora,
      sedeNombre: turnoSeleccionado.sede?.nombre || "",
      motivoTipo: motivo.tipo,
      motivoId: motivo.id,
      motivoNombre: motivo.nombre,
      precio: motivo.precio || 0,
    });
    message.success(t("carrito.agregado"));
    setTurnoSeleccionado(null);
  };

  const confirmarReserva = async (motivo) => {
    if (!motivo) { message.warning(t("buscarTurnos.warningMotivo")); return; }
    setReservando(true);
    const params = { turnoId: turnoSeleccionado.id || turnoSeleccionado._id };
    if (motivo.tipo === "esp")  params.especialidadId = motivo.id;
    if (motivo.tipo === "prac") params.practicaId     = motivo.id;
    try {
      await reservarTurno(params);
      message.success(t("buscarTurnos.successReservado"));
      setResultados((r) => r.filter((t) => (t.id || t._id) !== (turnoSeleccionado.id || turnoSeleccionado._id)));
      setTurnoSeleccionado(null);
      navigate("/mis-turnos");
    } catch (err) {
      message.error(extraerMensajeError(err, t("buscarTurnos.errorGenericoReserva")));
    } finally {
      setReservando(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
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
                          title={turno.medico?.nombre ? `Dr. ${turno.medico.nombre}` : "—"}
                          description={
                            <div style={{ lineHeight: "1.6" }}>
                              <Space split={<Divider type="vertical" />} size={0}>
                                <Text type="secondary"><ClockCircleOutlined /> {fmtHora(turno.fechaHora)}</Text>
                                <Text type="secondary"><EnvironmentOutlined /> {turno.sede?.nombre}</Text>
                              </Space>
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
              <Pagination
                align="center"
                defaultCurrent={1}
                current={paginaActual}
                pageSize={10}
                total={paginasTotales * 10}
                style={{ marginTop: "16px" }}
                onChange={cambiarPagina}
                showSizeChanger={false}
              />
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
        onAgregarCarrito={agregarAlCarrito}
        reservando={reservando}
      />
    </Layout>
  );
}
