import { useEffect, useMemo, useState } from "react";
import {
  App as AntApp,
  Button,
  Card,
  Empty,
  Layout,
  Input,
  Segmented,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  getTurnos,
  confirmarTurno,
  cancelarTurno,
  marcarRealizado,
  getPacientes,
  getSedes,
  getEspecialidades,
  EstadoTurno,
  nombreEstado,
} from "../mocks";

const { Title, Text } = Typography;

// Sin login, simulamos que la médica activa es Rebecca Rose (id 5).
const MEDICO_ACTIVO = { medicoId: 5, usuarioId: 105 };

const COLOR_ESTADO = {
  [EstadoTurno.DISPONIBLE]: "default",
  [EstadoTurno.RESERVADO]: "blue",
  [EstadoTurno.CONFIRMADO]: "green",
  [EstadoTurno.CANCELADO]: "red",
  [EstadoTurno.REALIZADO]: "purple",
};

const FILTROS = [
  { label: "Próximos", value: "proximos" },
  { label: "Por confirmar", value: "porConfirmar" },
  { label: "Histórico", value: "historico" },
  { label: "Todos", value: "todos" },
];

const fmt = (iso) =>
  new Date(iso).toLocaleString("es-AR", {
    weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });

const esFuturo = (iso) => new Date(iso).getTime() >= Date.now();

export default function AgendaMedico() {
  return (
    <AntApp>
      <AgendaMedicoInner />
    </AntApp>
  );
}

function AgendaMedicoInner() {
  const { message, modal } = AntApp.useApp();
  const [turnos, setTurnos] = useState([]);
  const [pacientesById, setPacientesById] = useState(new Map());
  const [sedesById, setSedesById] = useState(new Map());
  const [espById, setEspById] = useState(new Map());
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState("proximos");

  const recargar = () => {
    setCargando(true);
    Promise.all([
      getTurnos({ medicoId: MEDICO_ACTIVO.medicoId }),
      getPacientes(),
      getSedes(),
      getEspecialidades(),
    ]).then(([t, pacientes, sedes, esps]) => {
      setPacientesById(new Map(pacientes.map((p) => [p.id, p])));
      setSedesById(new Map(sedes.map((s) => [s.id, s])));
      setEspById(new Map(esps.map((e) => [e.id, e])));
      setTurnos(t);
      setCargando(false);
    });
  };

  useEffect(recargar, []);

  const hidratados = useMemo(
    () =>
      turnos.map((t) => ({
        ...t,
        key: t.id,
        pacienteNombre: t.pacienteId ? pacientesById.get(t.pacienteId)?.nombre ?? "—" : "(disponible)",
        sedeNombre: sedesById.get(t.sedeId)?.nombre ?? "—",
        especialidadNombre: espById.get(t.especialidadId)?.nombre ?? "—",
      })),
    [turnos, pacientesById, sedesById, espById],
  );

  const visibles = useMemo(() => {
    let lista = hidratados;
    if (filtro === "proximos") {
      lista = lista.filter((t) => esFuturo(t.fechaHora) && t.estado !== EstadoTurno.CANCELADO);
    } else if (filtro === "porConfirmar") {
      lista = lista.filter((t) => t.estado === EstadoTurno.RESERVADO && esFuturo(t.fechaHora));
    } else if (filtro === "historico") {
      lista = lista.filter((t) => !esFuturo(t.fechaHora) || t.estado === EstadoTurno.REALIZADO);
    }
    return lista.sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));
  }, [hidratados, filtro]);

  const onConfirmar = async (t) => {
    await confirmarTurno(t.id, { usuarioId: MEDICO_ACTIVO.usuarioId });
    message.success("Turno confirmado");
    recargar();
  };

  const onRealizado = async (t) => {
    await marcarRealizado(t.id, { usuarioId: MEDICO_ACTIVO.usuarioId });
    message.success("Turno marcado como realizado");
    recargar();
  };

  const onCancelar = (t) => {
    let motivo = "";
    modal.confirm({
      title: "Cancelar turno",
      content: (
        <div>
          <p>{t.pacienteNombre} · {fmt(t.fechaHora)}</p>
          <Input.TextArea
            rows={3}
            placeholder="Motivo de la cancelación (obligatorio)"
            onChange={(e) => { motivo = e.target.value; }}
          />
        </div>
      ),
      okText: "Cancelar turno",
      okButtonProps: { danger: true },
      cancelText: "Volver",
      onOk: async () => {
        if (!motivo.trim()) {
          message.error("Tenés que indicar un motivo");
          throw new Error("falta motivo");
        }
        await cancelarTurno(t.id, { usuarioId: MEDICO_ACTIVO.usuarioId, motivo: motivo.trim() });
        message.success("Turno cancelado");
        recargar();
      },
    });
  };

  const columns = [
    { title: "Fecha", dataIndex: "fechaHora", render: fmt, sorter: (a, b) => a.fechaHora.localeCompare(b.fechaHora) },
    { title: "Paciente", dataIndex: "pacienteNombre" },
    { title: "Especialidad", dataIndex: "especialidadNombre" },
    { title: "Sede", dataIndex: "sedeNombre" },
    {
      title: "Estado",
      dataIndex: "estado",
      render: (e) => <Tag color={COLOR_ESTADO[e]}>{nombreEstado(e)}</Tag>,
    },
    {
      title: "Acciones",
      render: (_, t) => (
        <Space wrap>
          {t.estado === EstadoTurno.RESERVADO && (
            <Button size="small" type="primary" onClick={() => onConfirmar(t)}>Confirmar</Button>
          )}
          {t.estado === EstadoTurno.CONFIRMADO && !esFuturo(t.fechaHora) && (
            <Button size="small" onClick={() => onRealizado(t)}>Marcar realizado</Button>
          )}
          {[EstadoTurno.RESERVADO, EstadoTurno.CONFIRMADO].includes(t.estado) && esFuturo(t.fechaHora) && (
            <Button size="small" danger onClick={() => onCancelar(t)}>Cancelar</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ background: "#fafafa", minHeight: "100vh" }}>
      <Navbar />
      <Layout.Content style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(20px, 4vw, 32px) clamp(12px, 4vw, 24px)", width: "100%" }}>
        <Title level={2}>Mi agenda</Title>
        <Text type="secondary">Confirmá, cancelá o marcá como realizados los turnos de tus pacientes.</Text>

        <Card style={{ marginTop: 16 }} bodyStyle={{ padding: 16 }}>
          <Segmented options={FILTROS} value={filtro} onChange={setFiltro} />
        </Card>

        <Card style={{ marginTop: 16 }} bodyStyle={{ padding: 0 }}>
          <Table
            loading={cargando}
            columns={columns}
            dataSource={visibles}
            scroll={{ x: 720 }}
            locale={{ emptyText: <Empty description="No hay turnos en esta vista" /> }}
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
          />
        </Card>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}
