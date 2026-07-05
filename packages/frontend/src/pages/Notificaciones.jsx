import { useCallback, useEffect, useState } from "react";
import {
  App as AntApp,
  Badge,
  Button,
  Card,
  Empty,
  Layout,
  List,
  Space,
  Typography,
} from "antd";
import { BellOutlined, CheckOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getNotificaciones, marcarComoLeida, marcarTodasComoLeidas } from "../api/api";

const { Title, Text } = Typography;
const { Content } = Layout;

const fmtFecha = (iso, locale) => {
  if (!iso) return "";
  return new Date(iso).toLocaleString(locale, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Notificaciones() {
  return (
    <AntApp>
      <NotificacionesInner />
    </AntApp>
  );
}

function NotificacionesInner() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const destinatarioId = user?.userId;
  const locale = i18n.language === "en" ? "en-US" : "es-AR";

  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const recargar = useCallback(() => {
    if (!destinatarioId) {
      setCargando(false);
      return;
    }
    setCargando(true);
    getNotificaciones({ destinatarioId })
      .then((res) => {
        setNotificaciones(res?.data || []);
      })
      .catch((err) => {
        console.error("Error al cargar notificaciones en la página", err);
      })
      .finally(() => setCargando(false));
  }, [destinatarioId]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  const onMarcar = async (id) => {
    await marcarComoLeida(id);
    recargar();
  };

  const onMarcarTodas = async () => {
    if (!destinatarioId) return;
    await marcarTodasComoLeidas(destinatarioId);
    recargar();
  };

  return (
    <Layout
      style={{
        background:
          "radial-gradient(circle at 0% 0%, rgba(190, 18, 60, 0.10), transparent 42%), linear-gradient(180deg, #f6f8fc 0%, #eef2f8 100%)",
        minHeight: "100vh",
      }}
    >
      <Navbar />
      <Content
        style={{
          maxWidth: 820,
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
            <BellOutlined />
            {t("navbar.notificaciones")}
          </Space>
          <Title level={2} style={{ margin: "14px 0 4px", color: "#fff" }}>
            {t("notificaciones.titulo")}
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.82)" }}>
            {t("notificaciones.subtitulo")}
          </Text>
        </Card>

        <Card
          bordered={false}
          style={{
            borderRadius: 24,
            boxShadow: "0 18px 44px rgba(15, 23, 42, 0.08)",
          }}
          bodyStyle={{ padding: "clamp(12px, 3vw, 20px)" }}
        >
          <Space
            style={{
              width: "100%",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <Badge count={noLeidas} size="small" offset={[8, 0]}>
              <Text strong>{t("notificaciones.titulo")}</Text>
            </Badge>
            {noLeidas > 0 && (
              <Button type="link" size="small" onClick={onMarcarTodas}>
                {t("notificaciones.marcarTodas")}
              </Button>
            )}
          </Space>

          {!cargando && notificaciones.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("notificaciones.emptyText")}
              style={{ padding: 32 }}
            />
          ) : (
            <List
              loading={cargando}
              dataSource={notificaciones}
              renderItem={(n) => (
                <List.Item
                  key={n._id || n.id}
                  style={{
                    padding: "14px 12px",
                    background: n.leida ? "transparent" : "#fff1f0",
                    borderRadius: 12,
                    alignItems: "flex-start",
                  }}
                  actions={
                    n.leida
                      ? []
                      : [
                          <Button
                            key="marcar"
                            type="link"
                            size="small"
                            icon={<CheckOutlined />}
                            onClick={() => onMarcar(n._id || n.id)}
                          >
                            {t("notificaciones.marcarLeida")}
                          </Button>,
                        ]
                  }
                >
                  <Space direction="vertical" size={2} style={{ width: "100%" }}>
                    <Text style={{ fontWeight: n.leida ? 400 : 500 }}>
                      {n.mensaje}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {fmtFecha(n.fechaHoraCreacion, locale)}
                    </Text>
                  </Space>
                </List.Item>
              )}
            />
          )}
        </Card>
      </Content>
      <Footer />
    </Layout>
  );
}
