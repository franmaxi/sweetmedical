import { useCallback, useEffect, useState } from "react";
import { App as AntApp, Card, Layout, Space, Typography } from "antd";
import {
  DashboardOutlined,
  MedicineBoxOutlined,
  PushpinOutlined,
  SettingOutlined,
  SmileOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  getSedes,
  getPracticasGenericas,
  getEspecialidadesGenericas,
  getObrasSociales,
  getPlanes,
} from "../../api/api";
import SedesTab from "./tabs/SedesTab";
import PracticasTab from "./tabs/PracticasTab";
import EspecialidadesTab from "./tabs/EspecialidadesTab";
import ObrasSocialesTab from "./tabs/ObrasSocialesTab";
import PlanesTab from "./tabs/PlanesTab";

const { Title, Text } = Typography;

export default function AdminPanel() {
  return (
    <AntApp>
      <AdminPanelInner />
    </AntApp>
  );
}

const SECCIONES = [
  {
    key: "sedes",
    icon: <PushpinOutlined />,
    accent: "#be123c",
    loadFn: () => getSedes({ limit: 100 }),
    render: (props) => <SedesTab {...props} />,
  },
  {
    key: "practicas",
    icon: <MedicineBoxOutlined />,
    accent: "#2e9e83",
    loadFn: () => getPracticasGenericas({ limit: 100 }),
    render: (props) => <PracticasTab {...props} />,
  },
  {
    key: "especialidades",
    icon: <SettingOutlined />,
    accent: "#7d5bd6",
    loadFn: () => getEspecialidadesGenericas({ limit: 100 }),
    render: (props) => <EspecialidadesTab {...props} />,
  },
  {
    key: "obrasSociales",
    icon: <SmileOutlined />,
    accent: "#ea580c",
    loadFn: () => getObrasSociales(),
    render: (props) => <ObrasSocialesTab {...props} />,
  },
  {
    key: "planes",
    icon: <FileTextOutlined />,
    accent: "#0284c7",
    loadFn: () => getPlanes(),
    render: (props) => <PlanesTab {...props} />,
  },
];

function AdminPanelInner() {
  const { t } = useTranslation();
  const [seccionActiva, setSeccionActiva] = useState("sedes");
  const [counts, setCounts] = useState({});

  const recargarCounts = useCallback(() => {
    Promise.all(
      SECCIONES.map((seccion) =>
        seccion
          .loadFn()
          .then((res) => [
            seccion.key,
            Array.isArray(res?.data) ? res.data.length : 0,
          ])
          .catch(() => [seccion.key, null]),
      ),
    ).then((pares) => setCounts(Object.fromEntries(pares)));
  }, []);

  useEffect(() => {
    recargarCounts();
  }, [recargarCounts]);

  const seccionActual =
    SECCIONES.find((s) => s.key === seccionActiva) ?? SECCIONES[0];

  return (
    <Layout
      style={{
        background:
          "radial-gradient(circle at 0% 0%, rgba(190, 18, 60, 0.12), transparent 42%), radial-gradient(circle at 100% 0%, rgba(125, 91, 214, 0.10), transparent 40%), linear-gradient(180deg, #f6f8fc 0%, #eef2f8 100%)",
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
            background:
              "linear-gradient(135deg, #881337 0%, #be123c 55%, #e11d48 100%)",
            color: "#fff",
            boxShadow: "0 24px 60px rgba(159, 18, 57, 0.22)",
            overflow: "hidden",
          }}
          bodyStyle={{ padding: "clamp(22px, 4vw, 34px)" }}
        >
          <Space
            size={12}
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
            <DashboardOutlined aria-hidden/>
            {t("admin.titulo")}
          </Space>
          <Title level={2} style={{ margin: "14px 0 4px", color: "#fff" }}>
            {t("admin.tabs." + seccionActiva)}
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.82)", maxWidth: 640 }}>
            {t("admin.subtitulo")}
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
          {SECCIONES.map((seccion) => {
            const activa = seccion.key === seccionActiva;
            const total = counts[seccion.key];
            return (
              <Card
                key={seccion.key}
                hoverable
                role = "button"
                tabIndex = {0}
                aria-pressed={activa}
                bordered={false}
                onClick={() => setSeccionActiva(seccion.key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSeccionActiva(seccion.key);
                  }
                }}
                style={{
                  borderRadius: 20,
                  cursor: "pointer",
                  boxShadow: activa
                    ? `0 16px 36px ${seccion.accent}33`
                    : "0 10px 28px rgba(15, 23, 42, 0.06)",
                  border: activa
                    ? `2px solid ${seccion.accent}`
                    : "2px solid transparent",
                  transition: "all 0.2s ease",
                }}
                bodyStyle={{ padding: 18 }}
              >
                <Space
                  align="start"
                  style={{ width: "100%", justifyContent: "space-between" }}
                >
                  <div>
                    <Text
                      type="secondary"
                      style={{
                        textTransform: "uppercase",
                        letterSpacing: 0.6,
                        fontSize: 12,
                      }}
                    >
                      {t("admin.tabs." + seccion.key)}
                    </Text>
                    <div
                      style={{
                        fontSize: 30,
                        fontWeight: 700,
                        lineHeight: 1.2,
                        color: "#1f2937",
                      }}
                    >
                      {total ?? "—"}
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
                      background: `${seccion.accent}1a`,
                      color: seccion.accent,
                      flex: "0 0 auto",
                    }}
                  >
                    {seccion.icon}
                  </span>
                </Space>
              </Card>
            );
          })}
        </div>

        <Card
          bordered={false}
          style={{
            borderRadius: 24,
            boxShadow: "0 18px 44px rgba(15, 23, 42, 0.08)",
          }}
          bodyStyle={{ padding: "clamp(16px, 3vw, 24px)" }}
        >
          <Space direction="vertical" size={4} style={{ marginBottom: 16 }}>
            <Space size={10} align="center">
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  background: `${seccionActual.accent}1a`,
                  color: seccionActual.accent,
                }}
              >
                {seccionActual.icon}
              </span>
              <Title level={4} style={{ margin: 0 }}>
                {t("admin.tabs." + seccionActiva)}
              </Title>
            </Space>
          </Space>
          {seccionActual.render({ onChanged: recargarCounts })}
        </Card>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}
