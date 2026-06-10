import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Row, Col, Typography, Button, Card, Space } from "antd";
import { CalendarOutlined, ArrowRightOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

export default function ReservaTurno() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section
      id="reserva"
      style={{
        padding: "clamp(48px, 7vw, 64px) clamp(16px, 4vw, 32px)",
        background: "linear-gradient(135deg, #be123c 0%, #9f1239 100%)",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Row gutter={[48, 32]} align="middle">
          <Col xs={24} md={12}>
            <Title level={2} style={{ color: "#fff", fontSize: "clamp(24px, 4vw, 36px)", marginBottom: 16 }}>
              {t("turno.titleLine1")}<br />{t("turno.titleLine2")}
            </Title>
            <Paragraph style={{ color: "rgba(255,255,255,0.85)", fontSize: 16, maxWidth: 480 }}>
              {t("turno.descripcion")}
            </Paragraph>
          </Col>
          <Col xs={24} md={12}>
            <Card style={{ borderRadius: 20, boxShadow: "0 24px 48px rgba(0,0,0,0.2)" }} bodyStyle={{ padding: 32 }}>
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Title level={4} style={{ margin: 0 }}>{t("turno.buscasUnTurno")}</Title>
                <Paragraph type="secondary" style={{ margin: 0 }}>
                  {t("turno.subtitulo")}
                </Paragraph>
                <Button type="primary" size="large" block icon={<CalendarOutlined />} onClick={() => navigate("/buscar")}>
                  {t("turno.botonBuscarDisponibles")}
                </Button>
                <Button size="large" block icon={<ArrowRightOutlined />} onClick={() => navigate("/mis-turnos")}>
                  {t("turno.botonVerMisTurnos")}
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </section>
  );
}
