import { useTranslation } from "react-i18next";
import { Layout, Row, Col, Typography, Input, Button, Space, Divider } from "antd";

const { Footer: AntFooter } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function Footer() {
  const { t } = useTranslation();
  const ESPECIALIDADES = t("footer.especialidades", { returnObjects: true });
  const ENLACES = t("footer.enlaces", { returnObjects: true });

  return (
    <AntFooter style={{ background: "#fafafa", padding: "clamp(32px, 5vw, 48px) clamp(16px, 4vw, 32px) 24px", borderTop: "1px solid #f0f0f0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Row gutter={[32, 32]}>
          <Col xs={24} md={8}>
            <Space style={{ marginBottom: 12 }}>
              <span
                style={{
                  width: 32, height: 32, borderRadius: "50%", background: "#be123c",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={20} height={20}>
                  <path
                    fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
                    d="M 78 30 C 78 13 22 13 22 50 C 22 82 78 82 78 50 C 78 28 35 28 35 55 C 35 73 62 73 62 50 C 62 40 50 40 50 52"
                  />
                </svg>
              </span>
              <Text strong style={{ fontSize: 18, color: "#be123c" }}>Sweet Medical</Text>
            </Space>
            <Paragraph type="secondary" style={{ fontSize: 13 }}>
              {t("footer.descripcion")}
            </Paragraph>
          </Col>

          <Col xs={12} md={5}>
            <Title level={5}>{t("footer.encabezadoEspecialidades")}</Title>
            <Space direction="vertical" size={4}>
              {ESPECIALIDADES.map((e) => (
                <Text type="secondary" key={e} style={{ fontSize: 13 }}>{e}</Text>
              ))}
            </Space>
          </Col>

          <Col xs={12} md={5}>
            <Title level={5}>{t("footer.encabezadoEnlaces")}</Title>
            <Space direction="vertical" size={4}>
              {ENLACES.map((e) => (
                <Text type="secondary" key={e} style={{ fontSize: 13 }}>{e}</Text>
              ))}
            </Space>
          </Col>
        </Row>

        <Divider />

        <Text type="secondary" style={{ display: "block", textAlign: "center", fontSize: 13 }}>
          © 2026 Sweet Medical · Grupo 12 · DDSO UTN FRBA
        </Text>
      </div>
    </AntFooter>
  );
}
