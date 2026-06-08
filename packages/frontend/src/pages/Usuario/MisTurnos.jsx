import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  App as AntApp,
  Button,
  Card,
  Empty,
  Input,
  Layout,
  Space,
  Tabs,
  Tag,
  Typography,
} from "antd";
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined, MedicineBoxOutlined } from "@ant-design/icons";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useTranslation } from "react-i18next";
import {
  getTurnos,
  cancelarTurno,
  getMedicos,
  getSedes,
  getEspecialidades,
  EstadoTurno,
  nombreEstado,
} from "../../mocks";

const { Title, Text } = Typography;

// Sin login simulo que el paciente activo es Ana García (id 1).
const PACIENTE_ACTIVO = { pacienteId: 1, usuarioId: 201 };

const COLOR_ESTADO = {
  [EstadoTurno.DISPONIBLE]: "default",
  [EstadoTurno.RESERVADO]: "blue",
  [EstadoTurno.CONFIRMADO]: "green",
  [EstadoTurno.CANCELADO]: "red",
  [EstadoTurno.REALIZADO]: "purple",
};

// formato de fecha legible para mostrar en la UI
const fmt = (iso) =>
  new Date(iso).toLocaleString("es-AR", {
    weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });

const fmtMoneda = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

const esFuturo = (iso) => new Date(iso).getTime() >= Date.now();

export default function MisTurnos() {
  return (
    <AntApp>
      <MisTurnosInner />
    </AntApp>
  );
}

function MisTurnosInner() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { message, modal } = AntApp.useApp();
  const [turnos, setTurnos] = useState([]);
  const estadoLabel = (e) => t(`estados.${nombreEstado(e).toLowerCase()}`, { defaultValue: nombreEstado(e) });
  const [medicosById, setMedicosById] = useState(new Map());
  const [sedesById, setSedesById] = useState(new Map());
  const [espById, setEspById] = useState(new Map());
  const [cargando, setCargando] = useState(true);

  const recargar = () => {
    setCargando(true);
    Promise.all([
      getTurnos({ pacienteId: PACIENTE_ACTIVO.pacienteId }),
      getMedicos(),
      getSedes(),
      getEspecialidades(),
    ]).then(([t, medicos, sedes, esps]) => {
      setMedicosById(new Map(medicos.map((m) => [m.id, m])));
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
        medicoNombre: medicosById.get(t.medicoId)?.nombre ?? "—",
        sedeNombre: sedesById.get(t.sedeId)?.nombre ?? "—",
        especialidadNombre: espById.get(t.especialidadId)?.nombre ?? "—",
      })),
    [turnos, medicosById, sedesById, espById],
  );

  const proximos = hidratados
    .filter((t) => esFuturo(t.fechaHora) && t.estado !== EstadoTurno.CANCELADO)
    .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));

  const historicos = hidratados
    .filter((t) => !esFuturo(t.fechaHora) || t.estado === EstadoTurno.CANCELADO)
    .sort((a, b) => b.fechaHora.localeCompare(a.fechaHora));

  const onCancelar = (turno) => {
    let motivo = "";
    modal.confirm({
      title: t("misTurnos.cancelarTitle"),
      content: (
        <div>
          <p>{turno.medicoNombre} · {fmt(turno.fechaHora)}</p>
          <Input.TextArea
            rows={3}
            placeholder={t("misTurnos.cancelarPlaceholder")}
            onChange={(e) => { motivo = e.target.value; }}
          />
        </div>
      ),
      okText: t("misTurnos.cancelarOk"),
      okButtonProps: { danger: true },
      cancelText: t("misTurnos.cancelarCancel"),
      onOk: async () => {
        if (!motivo.trim()) {
          message.error(t("misTurnos.errorFaltaMotivo"));
          throw new Error("falta motivo");
        }
        await cancelarTurno(turno.id, { usuarioId: PACIENTE_ACTIVO.usuarioId, motivo: motivo.trim() });
        message.success(t("misTurnos.canceladoOk"));
        recargar();
      },
    });
  };

  const renderTurno = (turno) => (
    <Card key={turno.id} style={{ marginBottom: 12 }} bodyStyle={{ padding: 16 }}>
      <Space direction="vertical" size={4} style={{ width: "100%" }}>
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Title level={5} style={{ margin: 0 }}>{turno.medicoNombre}</Title>
          <Tag color={COLOR_ESTADO[turno.estado]}>{estadoLabel(turno.estado)}</Tag>
        </Space>
        <Space wrap size="large">
          <Text type="secondary"><MedicineBoxOutlined /> {turno.especialidadNombre}</Text>
          <Text type="secondary"><EnvironmentOutlined /> {turno.sedeNombre}</Text>
          <Text type="secondary"><CalendarOutlined /> {fmt(turno.fechaHora)}</Text>
          <Text type="secondary"><ClockCircleOutlined /> {fmtMoneda(turno.costo)}</Text>
        </Space>
        {(turno.estado === EstadoTurno.RESERVADO || turno.estado === EstadoTurno.CONFIRMADO) && esFuturo(turno.fechaHora) && (
          <Space style={{ marginTop: 8 }}>
            <Button danger onClick={() => onCancelar(turno)}>{t("misTurnos.cancelarOk")}</Button>
          </Space>
        )}
      </Space>
    </Card>
  );

  const renderLista = (lista) => {
    if (cargando) return <Text type="secondary">{t("misTurnos.cargando")}</Text>;
    if (lista.length === 0) {
      return (
        <Empty description={t("misTurnos.sinTurnosDescripcion")}>
          <Button type="primary" onClick={() => navigate("/buscar")}>
            {t("misTurnos.buscarTurnosBoton")}
          </Button>
        </Empty>
      );
    }
    return lista.map(renderTurno);
  };

  return (
    <Layout style={{ background: "#fafafa", minHeight: "100vh" }}>
      <Navbar />
      <Layout.Content style={{ maxWidth: 880, margin: "0 auto", padding: "clamp(20px, 4vw, 32px) clamp(12px, 4vw, 24px)", width: "100%" }}>
        <Title level={2}>{t("misTurnos.titulo")}</Title>
        <Text type="secondary">{t("misTurnos.subtitulo")}</Text>

        <Tabs
          defaultActiveKey="proximos"
          style={{ marginTop: 16 }}
          items={[
            { key: "proximos", label: `${t("misTurnos.proximos")} (${proximos.length})`, children: renderLista(proximos) },
            { key: "historicos", label: `${t("misTurnos.historial")} (${historicos.length})`, children: renderLista(historicos) },
          ]}
        />
      </Layout.Content>
      <Footer />
    </Layout>
  );
}
