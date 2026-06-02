import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  App as AntApp,
  Layout,
  Row,
  Col,
  Card,
  Form,
  Select,
  Input,
  DatePicker,
  Button,
  Typography,
  List,
  Empty,
  Space,
  Tag,
  Divider,
} from "antd";
import {
  EnvironmentOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  getTurnosDisponibles,
  getEspecialidadesGenericas,
  getSedes,
  getMedicos,
  getEspecialidades,
  reservarTurno,
} from "../mocks";

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

// Como no hay login, simulamos que el usuario activo es la paciente Ana.
const PACIENTE_ACTIVO = { pacienteId: 1, usuarioId: 201 };

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const fmtFecha = (iso) => iso.slice(0, 10);
const fmtHora = (iso) => iso.slice(11, 16);
const mesAbrev = (iso) => MESES[Number(iso.slice(5, 7)) - 1] ?? "";
const dia = (iso) => iso.slice(8, 10);
const fmtMoneda = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

export default function BuscarTurnos() {
  return (
    <AntApp>
      <BuscarTurnosInner />
    </AntApp>
  );
}

function BuscarTurnosInner() {
  const navigate = useNavigate();
  const { message, modal } = AntApp.useApp();
  const [reservando, setReservando] = useState(null);

  const [especialidadGenericaId, setEspecialidadGenericaId] = useState();
  const [sedeId, setSedeId] = useState();
  const [medicoQuery, setMedicoQuery] = useState("");
  const [fechaDesde, setFechaDesde] = useState();

  const [especialidadesGenericas, setEspecialidadesGenericas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [medicosById, setMedicosById] = useState(new Map());
  const [sedesById, setSedesById] = useState(new Map());
  const [espPersonalizadasById, setEspPersonalizadasById] = useState(new Map());

  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Carga inicial de catálogos.
  useEffect(() => {
    Promise.all([
      getEspecialidadesGenericas(),
      getSedes(),
      getMedicos(),
      getEspecialidades(),
    ]).then(([genericas, listaSedes, listaMedicos, listaEspecialidades]) => {
      setEspecialidadesGenericas(genericas);
      setSedes(listaSedes);
      setMedicosById(new Map(listaMedicos.map((m) => [m.id, m])));
      setSedesById(new Map(listaSedes.map((s) => [s.id, s])));
      setEspPersonalizadasById(new Map(listaEspecialidades.map((e) => [e.id, e])));
    });
  }, []);

  // Cada cambio de filtro re-consulta los turnos disponibles.
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

  const onReservar = (turno) => {
    modal.confirm({
      title: "Confirmar reserva",
      content: `${turno.medicoNombre} · ${turno.especialidadNombre} · ${fmtFecha(turno.fechaHora)} ${fmtHora(turno.fechaHora)} · ${turno.sedeNombre}`,
      okText: "Reservar",
      cancelText: "Volver",
      onOk: async () => {
        setReservando(turno.id);
        await reservarTurno(turno.id, PACIENTE_ACTIVO);
        message.success("¡Turno reservado!");
        setResultados((r) => r.filter((t) => t.id !== turno.id));
        setReservando(null);
        navigate("/mis-turnos");
      },
    });
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
          <Text style={{ color: "#be123c", fontWeight: 600, fontSize: 14 }}>Reservá tu turno</Text>
          <Title level={2} style={{ marginTop: 8 }}>Buscar turnos disponibles</Title>
          <Paragraph type="secondary" style={{ maxWidth: 720 }}>
            Filtrá por especialidad, médico, sede o fecha para encontrar el turno que mejor te queda.
          </Paragraph>

          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col xs={24} lg={8}>
              <Card
                title="Filtros"
                extra={<Button type="link" size="small" icon={<ClearOutlined />} onClick={limpiar}>Limpiar</Button>}
              >
                <Form layout="vertical">
                  <Form.Item label="Especialidad">
                    <Select
                      placeholder="Todas"
                      allowClear
                      value={especialidadGenericaId}
                      onChange={setEspecialidadGenericaId}
                      options={especialidadesGenericas.map((e) => ({ value: e.id, label: e.nombre }))}
                    />
                  </Form.Item>
                  <Form.Item label="Médico">
                    <Input
                      placeholder="Buscar por nombre"
                      value={medicoQuery}
                      onChange={(e) => setMedicoQuery(e.target.value)}
                      allowClear
                    />
                  </Form.Item>
                  <Form.Item label="Sede">
                    <Select
                      placeholder="Todas"
                      allowClear
                      value={sedeId}
                      onChange={setSedeId}
                      options={sedes.map((s) => ({ value: s.id, label: s.nombre }))}
                    />
                  </Form.Item>
                  <Form.Item label="Fecha desde">
                    <DatePicker
                      style={{ width: "100%" }}
                      value={fechaDesde}
                      onChange={setFechaDesde}
                      format="DD/MM/YYYY"
                    />
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            <Col xs={24} lg={16}>
              <Card>
                <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }}>
                  <Text>
                    <Text strong>{resultadosVisibles.length}</Text>{" "}
                    turno{resultadosVisibles.length === 1 ? "" : "s"} disponible{resultadosVisibles.length === 1 ? "" : "s"}
                  </Text>
                </Space>

                {resultadosVisibles.length === 0 && !cargando ? (
                  <Empty description="No encontramos turnos con esos filtros" style={{ padding: "40px 0" }} />
                ) : (
                  <List
                    loading={cargando}
                    dataSource={resultadosVisibles}
                    renderItem={(turno) => (
                      <List.Item
                        key={turno.id}
                        actions={[
                          <Button
                            type="primary"
                            onClick={() => onReservar(turno)}
                            loading={reservando === turno.id}
                          >
                            Reservar
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
                              <Tag color="pink"><CalendarOutlined /> {fmtMoneda(turno.costo)}</Tag>
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
    </Layout>
  );
}
