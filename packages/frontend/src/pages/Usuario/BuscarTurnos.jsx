import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
} from "antd";
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
<<<<<<< HEAD:packages/frontend/src/pages/Usuario/BuscarTurnos.jsx
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import FiltrosTurnos from "../../components/FiltrosTurnos";
import ModalReservaTurno from "../../components/ModalReservaTurno";
=======
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FiltrosTurnos from "../components/FiltrosTurnos";
import ModalReservaTurno from "../components/ModalReservaTurno";
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b:packages/frontend/src/pages/BuscarTurnos.jsx
import {
  getTurnosDisponibles,
  getEspecialidadesGenericas,
  getSedes,
  getMedicos,
  getEspecialidades,
  getPracticas,
  reservarTurno,
} from "../../mocks";

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

// Como no hay login, simulamos que el usuario activo es la paciente Ana.
const PACIENTE_ACTIVO = { pacienteId: 1, usuarioId: 201 };

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const fmtHora = (iso) => iso.slice(11, 16);
const mesAbrev = (iso) => MESES[Number(iso.slice(5, 7)) - 1] ?? "";
const dia = (iso) => iso.slice(8, 10);

export default function BuscarTurnos() {
  return (
    <AntApp>
      <BuscarTurnosInner />
    </AntApp>
  );
}

function BuscarTurnosInner() {
  const navigate = useNavigate();
<<<<<<< HEAD:packages/frontend/src/pages/Usuario/BuscarTurnos.jsx
  const { t } = useTranslation();
=======
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b:packages/frontend/src/pages/BuscarTurnos.jsx
  const { message } = AntApp.useApp();

  // Filtros.
  const [especialidadGenericaId, setEspecialidadGenericaId] = useState();
  const [sedeId, setSedeId] = useState();
  const [medicoQuery, setMedicoQuery] = useState("");
  const [fechaDesde, setFechaDesde] = useState();

  // Catálogos.
  const [especialidadesGenericas, setEspecialidadesGenericas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [medicosById, setMedicosById] = useState(new Map());
  const [sedesById, setSedesById] = useState(new Map());
  const [espPersonalizadasById, setEspPersonalizadasById] = useState(new Map());
  const [practicasById, setPracticasById] = useState(new Map());

  // Resultados y modal de reserva.
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [reservando, setReservando] = useState(false);

  // Carga inicial de catálogos.
  useEffect(() => {
    Promise.all([
      getEspecialidadesGenericas(),
      getSedes(),
      getMedicos(),
      getEspecialidades(),
      getPracticas(),
    ]).then(([genericas, listaSedes, listaMedicos, listaEsp, listaPrac]) => {
      setEspecialidadesGenericas(genericas);
      setSedes(listaSedes);
      setMedicosById(new Map(listaMedicos.map((m) => [m.id, m])));
      setSedesById(new Map(listaSedes.map((s) => [s.id, s])));
      setEspPersonalizadasById(new Map(listaEsp.map((e) => [e.id, e])));
      setPracticasById(new Map(listaPrac.map((p) => [p.id, p])));
    });
  }, []);

  // Cada cambio de filtro vuelve a consultar los turnos disponibles.
  useEffect(() => {
    setCargando(true);
    getTurnosDisponibles({
      especialidadGenericaId: especialidadGenericaId ?? undefined,
      sedeId: sedeId ?? undefined,
      fechaDesde: fechaDesde ? fechaDesde.format("YYYY-MM-DD") : undefined,
    }).then((turnos) => {
      setResultados(turnos);
      setCargando(false);
    });
  }, [especialidadGenericaId, sedeId, fechaDesde]);

  const resultadosVisibles = useMemo(() => {
    const q = medicoQuery.trim().toLowerCase();
    return resultados
      .map((turno) => ({
        ...turno,
        medicoNombre: medicosById.get(turno.medicoId)?.nombre ?? "—",
        sedeNombre: sedesById.get(turno.sedeId)?.nombre ?? "—",
        especialidadNombre: espPersonalizadasById.get(turno.especialidadId)?.nombre ?? "—",
      }))
      .filter((turno) => !q || turno.medicoNombre.toLowerCase().includes(q))
      .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));
  }, [resultados, medicoQuery, medicosById, sedesById, espPersonalizadasById]);

  const medicoSeleccionado = turnoSeleccionado ? medicosById.get(turnoSeleccionado.medicoId) : null;
  const espSeleccionada = medicoSeleccionado
    ? espPersonalizadasById.get(medicoSeleccionado.especialidadId)
    : null;

  const confirmarReserva = async (motivo) => {
    if (!motivo) {
<<<<<<< HEAD:packages/frontend/src/pages/Usuario/BuscarTurnos.jsx
      message.warning(t("buscarTurnos.warningMotivo"));
=======
      message.warning("Elegí un motivo para la consulta");
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b:packages/frontend/src/pages/BuscarTurnos.jsx
      return;
    }
    setReservando(true);
    await reservarTurno(turnoSeleccionado.id, PACIENTE_ACTIVO);
    setReservando(false);
<<<<<<< HEAD:packages/frontend/src/pages/Usuario/BuscarTurnos.jsx
    message.success(t("buscarTurnos.successReservado"));
=======
    message.success("¡Turno reservado!");
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b:packages/frontend/src/pages/BuscarTurnos.jsx
    setResultados((r) => r.filter((t) => t.id !== turnoSeleccionado.id));
    setTurnoSeleccionado(null);
    navigate("/mis-turnos");
  };

  const limpiar = () => {
    setEspecialidadGenericaId(undefined);
    setSedeId(undefined);
    setMedicoQuery("");
    setFechaDesde(undefined);
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
                especialidadGenericaId={especialidadGenericaId}
                setEspecialidadGenericaId={setEspecialidadGenericaId}
                sedeId={sedeId}
                setSedeId={setSedeId}
                medicoQuery={medicoQuery}
                setMedicoQuery={setMedicoQuery}
                fechaDesde={fechaDesde}
                setFechaDesde={setFechaDesde}
                onLimpiar={limpiar}
              />
            </Col>

            <Col xs={24} lg={16}>
              <Card>
                <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }}>
                  <Text>
                    {t("buscarTurnos.resultCount", {
                      count: resultadosVisibles.length,
                      plural: resultadosVisibles.length === 1 ? "" : "s",
                    })}
                  </Text>
                </Space>

                {resultadosVisibles.length === 0 && !cargando ? (
                  <Empty description={t("buscarTurnos.noResults")} style={{ padding: "40px 0" }} />
                ) : (
                  <List
                    loading={cargando}
                    dataSource={resultadosVisibles}
                    renderItem={(turno) => (
                      <List.Item
                        key={turno.id}
                        actions={[
                          <Button type="primary" onClick={() => setTurnoSeleccionado(turno)}>
<<<<<<< HEAD:packages/frontend/src/pages/Usuario/BuscarTurnos.jsx
                            {t("buscarTurnos.reservar")}
=======
                            Reservar
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b:packages/frontend/src/pages/BuscarTurnos.jsx
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
                          title={turno.medicoNombre}
                          description={
                            <Space split={<Divider type="vertical" />} wrap>
                              <Text type="secondary">{turno.especialidadNombre}</Text>
                              <Text type="secondary"><EnvironmentOutlined /> {turno.sedeNombre}</Text>
                              <Text type="secondary"><ClockCircleOutlined /> {fmtHora(turno.fechaHora)}</Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </Card>
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
