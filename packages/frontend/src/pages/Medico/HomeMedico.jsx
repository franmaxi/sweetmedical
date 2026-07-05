import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { App as AntApp, Card, Layout, Space, Typography } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  PushpinOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { getTurnos } from "../../api/api";
import { EstadoTurno } from "../../utils/turnos";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const { Title, Text } = Typography;

const esFuturo = (iso) => new Date(iso).getTime() >= Date.now();

export default function HomeMedico() {
  return (
    <AntApp>
      <HomeMedicoInner />
    </AntApp>
  );
}

function HomeMedicoInner() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const medicoId = user?.userId;

  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!medicoId) {
      setCargando(false);
      return;
    }
    setCargando(true);
    getTurnos({ medicoId })
      .then((res) => setTurnos(res?.data || res || []))
      .catch(() => setTurnos([]))
      .finally(() => setCargando(false));
  }, [medicoId]);

  const { proximos, porConfirmar } = useMemo(() => {
    const lista = Array.isArray(turnos) ? turnos : [];
    return {
      proximos: lista.filter(
        (turno) => esFuturo(turno.fechaHora) && turno.estado !== EstadoTurno.CANCELADO,
      ).length,
      porConfirmar: lista.filter(
        (turno) => turno.estado === EstadoTurno.RESERVADO && esFuturo(turno.fechaHora),
      ).length,
    };
  }, [turnos]);

  const stats = [
    {
      key: "proximos",
      accent: "#be123c",
      icon: <CalendarOutlined />,
      label: t("homeMedico.proximosTurnos"),
      value: proximos,
      to: "/agenda",
    },
    {
      key: "porConfirmar",
      accent: "#f59e0b",
      icon: <ClockCircleOutlined />,
      label: t("homeMedico.porConfirmar"),
      value: porConfirmar,
      to: "/agenda",
    },
  ];

  const accesos = [
    {
      key: "/agenda",
      accent: "#be123c",
      icon: <CalendarOutlined />,
      titulo: t("navbar.agenda"),
      desc: t("homeMedico.agendaDesc"),
    },
    {
      key: "/disponibilidades",
      accent: "#2e9e83",
      icon: <ClockCircleOutlined />,
      titulo: t("navbar.disponibilidades"),
      desc: t("homeMedico.disponibilidadesDesc"),
    },
    {
      key: "/mis-servicios",
      accent: "#7d5bd6",
      icon: <MedicineBoxOutlined />,
      titulo: t("navbar.misServicios"),
      desc: t("homeMedico.serviciosDesc"),
    },
    {
      key: "/mis-sedes",
      accent: "#0ea5e9",
      icon: <PushpinOutlined />,
      titulo: t("navbar.misSedes"),
      desc: t("homeMedico.sedesDesc"),
    },
  ];

  const nombre = user?.displayName || user?.username || "";

  return (
    <Layout
      style={{
        background:
          "radial-gradient(circle at 0% 0%, rgba(190, 18, 60, 0.12), transparent 42%), radial-gradient(circle at 100% 0%, rgba(46, 158, 131, 0.10), transparent 40%), linear-gradient(180deg, #f6f8fc 0%, #eef2f8 100%)",
        minHeight: "100vh",
      }}
    >
      <Navbar />
      <Layout.Content
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "clamp(20px, 4vw, 36px) clamp(12px, 4vw, 24px)",
          width: "100%",
        }}
      >
        <Card
          bordered={false}
          style={{
            marginBottom: 20,
            borderRadius: 24,
            background: "linear-gradient(135deg, #881337 0%, #be123c 55%, #e11d48 100%)",
            color: "#fff",
            boxShadow: "0 24px 60px rgba(159, 18, 57, 0.22)",
            overflow: "hidden",
          }}
          bodyStyle={{ padding: "clamp(22px, 4vw, 34px)" }}
        >
          <Space
            size={10}
            align="center"
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.14)",
              fontSize: 12,
              letterSpacing: 0.8,
              textTransform: "uppercase",
            }}
          >
            <DashboardOutlined />
            {t("homeMedico.etiqueta")}
          </Space>
          <Title level={2} style={{ margin: "14px 0 4px", color: "#fff" }}>
            {t("homeMedico.saludo", { nombre })}
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.82)", maxWidth: 640 }}>
            {t("homeMedico.subtitulo")}
          </Text>
        </Card>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 20,
          }}
        >
          {stats.map((stat) => (
            <Card
              key={stat.key}
              hoverable
              bordered={false}
              loading={cargando}
              onClick={() => navigate(stat.to)}
              style={{
                borderRadius: 20,
                cursor: "pointer",
                boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
              }}
              bodyStyle={{ padding: 18 }}
            >
              <Space align="start" style={{ width: "100%", justifyContent: "space-between" }}>
                <div>
                  <Text
                    type="secondary"
                    style={{ textTransform: "uppercase", letterSpacing: 0.6, fontSize: 12 }}
                  >
                    {stat.label}
                  </Text>
                  <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.2, color: "#1f2937" }}>
                    {stat.value}
                  </div>
                </div>
                <span
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    background: `${stat.accent}1a`,
                    color: stat.accent,
                    flex: "0 0 auto",
                  }}
                >
                  {stat.icon}
                </span>
              </Space>
            </Card>
          ))}
        </div>

        <Title level={4} style={{ margin: "8px 0 12px" }}>
          {t("homeMedico.accesosTitulo")}
        </Title>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {accesos.map((acceso) => (
            <Card
              key={acceso.key}
              hoverable
              bordered={false}
              onClick={() => navigate(acceso.key)}
              style={{
                borderRadius: 20,
                cursor: "pointer",
                boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
                height: "100%",
              }}
              bodyStyle={{ padding: 20 }}
            >
              <Space direction="vertical" size={10} style={{ width: "100%" }}>
                <span
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    background: `${acceso.accent}1a`,
                    color: acceso.accent,
                  }}
                >
                  {acceso.icon}
                </span>
                <Title level={5} style={{ margin: 0 }}>
                  {acceso.titulo}
                </Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {acceso.desc}
                </Text>
              </Space>
            </Card>
          ))}
        </div>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}
