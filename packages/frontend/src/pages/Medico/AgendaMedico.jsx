import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import {
  getTurnos,
  confirmarTurno,
  cancelarTurno,
  rechazarTurno,
  marcarRealizado,
  getPacientes,
  getSedes,
  getEspecialidades,
} from "../../api/api";
import { EstadoTurno, nombreEstado } from "../../utils/turnos";
import { extraerMensajeError } from "../../api/errorUtils";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const { Title, Text } = Typography;



const COLOR_ESTADO = {
  [EstadoTurno.DISPONIBLE]: "default",
  [EstadoTurno.RESERVADO]: "blue",
  [EstadoTurno.CONFIRMADO]: "green",
  [EstadoTurno.CANCELADO]: "red",
  [EstadoTurno.REALIZADO]: "purple",
};

const getFiltros = (t) => [
  { label: t("agenda.filtros.proximos"), value: "proximos" },
  { label: t("agenda.filtros.porConfirmar"), value: "porConfirmar" },
  { label: t("agenda.filtros.historico"), value: "historico" },
  { label: t("agenda.filtros.todos"), value: "todos" },
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
  const { t } = useTranslation();
  const { user } = useAuth();
  const medicoId = user?.userId;
  const usuarioId = user?.userId;

  const { message, modal } = AntApp.useApp();
  const [turnos, setTurnos] = useState([]);
  const [pacientesById, setPacientesById] = useState(new Map());
  const [sedesById, setSedesById] = useState(new Map());
  const [espById, setEspById] = useState(new Map());
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState("proximos");
  const filtros = getFiltros(t);
  const estadoLabel = (e) => t(`estados.${nombreEstado(e).toLowerCase()}`, { defaultValue: nombreEstado(e) });

  const recargar = useCallback(() => {
    if (!medicoId) {
      setCargando(false);
      return;
    }
    setCargando(true);
    Promise.all([
      getTurnos({ medicoId }),
      getPacientes(),
      getSedes(),
      getEspecialidades(),
    ]).then(([turnosData, pacientesRes, sedesRes, espsRes]) => {
      const pacientes = pacientesRes?.data || pacientesRes || [];
      const sedes = sedesRes?.data || sedesRes || [];
      const esps = espsRes?.data || espsRes || [];
      const turnosLista = turnosData?.data || turnosData || [];

      setPacientesById(new Map(pacientes.map((p) => [p._id || p.id, p])));
      setSedesById(new Map(sedes.map((s) => [s._id || s.id, s])));
      setEspById(new Map(esps.map((e) => [e._id || e.id, e])));
      setTurnos(Array.isArray(turnosLista) ? turnosLista : []);
      setCargando(false);
    }).catch((err) => {
      message.error(extraerMensajeError(err, "Error al cargar la agenda"));
      setCargando(false);
    });
  }, [medicoId, message]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const hidratados = useMemo(
    () =>
      turnos.map((turno) => {
        const pacId = turno.paciente?._id || turno.paciente;
        const sdId = turno.sede?._id || turno.sede;
        const espId = Array.isArray(turno.especialidad)
          ? (turno.especialidad[0]?._id || turno.especialidad[0])
          : (turno.especialidad?._id || turno.especialidad);

        return {
          ...turno,
          key: turno._id || turno.id,
          pacienteNombre: pacId ? pacientesById.get(pacId)?.nombre ?? "—" : t("agenda.disponible"),
          sedeNombre: sedesById.get(sdId)?.nombre ?? "—",
          especialidadNombre: espId ? espById.get(espId)?.nombre ?? "—" : "—",
        };
      }),
    [turnos, pacientesById, sedesById, espById, t],
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

  const onConfirmar = async (turno) => {
    try {
      await confirmarTurno(turno._id || turno.id, { usuarioId });
      message.success(t("agenda.confirmadoOk"));
      recargar();
    } catch (err) {
      message.error(extraerMensajeError(err, "Error al confirmar el turno"));
    }
  };
  
  const onRechazar = async (turno) => {
    try {
      await rechazarTurno(turno._id || turno.id, { usuarioId });
      message.success(t("agenda.rechazadoOk"));
      recargar();
    } catch (err) {
      message.error(extraerMensajeError(err, "Error al rechazar el turno"));
    }
  };

  const onRealizado = async (turno) => {
    try {
      await marcarRealizado(turno._id || turno.id, { usuarioId });
      message.success(t("agenda.realizadoOk"));
      recargar();
    } catch (err) {
      message.error(extraerMensajeError(err, "Error al marcar el turno como realizado"));
    }
  };

  const onCancelar = (turno) => {
    let motivo = "";
    modal.confirm({
      title: t("agenda.cancelarTitle"),
      content: (
        <div>
          <p>{turno.pacienteNombre} · {fmt(turno.fechaHora)}</p>
          <Input.TextArea
            rows={3}
            placeholder={t("agenda.cancelarPlaceholder")}
            onChange={(e) => { motivo = e.target.value; }}
          />
        </div>
      ),
      okText: t("agenda.cancelarOk"),
      okButtonProps: { danger: true },
      cancelText: t("agenda.cancelarCancel"),
      onOk: async () => {
        if (!motivo.trim()) {
          message.error(t("agenda.cancelarErrorMotivo"));
          throw new Error("falta motivo");
        }
        try {
          await cancelarTurno(turno._id || turno.id, { usuarioId, motivo: motivo.trim() });
          message.success(t("agenda.canceladoOk"));
          recargar();
        } catch (err) {
          message.error(extraerMensajeError(err, "Error al cancelar el turno"));
        }
      },
    });
  };

  const columns = [
    { title: t("agenda.column.fecha"), dataIndex: "fechaHora", render: fmt, sorter: (a, b) => a.fechaHora.localeCompare(b.fechaHora) },
    { title: t("agenda.column.paciente"), dataIndex: "pacienteNombre" },
    { title: t("agenda.column.especialidad"), dataIndex: "especialidadNombre" },
    { title: t("agenda.column.sede"), dataIndex: "sedeNombre" },
    {
      title: t("agenda.column.estado"),
      dataIndex: "estado",
      render: (e) => <Tag color={COLOR_ESTADO[e]}>{estadoLabel(e)}</Tag>,
    },
    {
      title: t("agenda.column.acciones"),
      render: (_, turno) => (
        <Space wrap>
          {turno.estado === EstadoTurno.RESERVADO && (
            <Button size="small" color="green" variant="solid" type="primary" onClick={() => onConfirmar(turno)}>{t("agenda.confirmar")}</Button>
          )}
          {turno.estado === EstadoTurno.CONFIRMADO && !esFuturo(turno.fechaHora) && (
            <Button size="small" onClick={() => onRealizado(turno)}>{t("agenda.marcarRealizado")}</Button>
          )}
          {[EstadoTurno.CONFIRMADO].includes(turno.estado) && esFuturo(turno.fechaHora) && (
            <Button size="small" danger onClick={() => onCancelar(turno)}>{t("agenda.cancelar")}</Button>
          )}
          {turno.estado === EstadoTurno.RESERVADO && (
            <Button size="small" type="primary" color="red" variant="solid" onClick={() => onRechazar(turno)}>{t("agenda.rechazar")}</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ background: "#fafafa", minHeight: "100vh" }}>
      <Navbar />
      <Layout.Content style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(20px, 4vw, 32px) clamp(12px, 4vw, 24px)", width: "100%" }}>
        <Title level={2}>{t("agenda.titulo")}</Title>
        <Text type="secondary">{t("agenda.subtitulo")}</Text>

        <Card style={{ marginTop: 16 }} bodyStyle={{ padding: 16 }}>
          <Segmented options={filtros} value={filtro} onChange={setFiltro} />
        </Card>

        <Card style={{ marginTop: 16 }} bodyStyle={{ padding: 0 }}>
          <Table
            loading={cargando}
            columns={columns}
            dataSource={visibles}
            scroll={{ x: 720 }}
            locale={{ emptyText: <Empty description={t("agenda.sinTurnos")} /> }}
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
          />
        </Card>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}
