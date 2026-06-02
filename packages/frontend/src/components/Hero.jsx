import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Typography, Button, Space, Statistic, Card } from "antd";
import {
  ArrowRightOutlined,
  CalendarOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import {
  getEspecialidadesGenericas,
  getMedicos,
  getSedes,
} from "../mocks";

const { Title, Paragraph, Text } = Typography;

export default function Hero() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ especialidades: 0, medicos: 0, sedes: 0 });

  useEffect(() => {
    Promise.all([getEspecialidadesGenericas(), getMedicos(), getSedes()]).then(
      ([especialidades, medicos, sedes]) => {
        setStats({
          especialidades: especialidades.length,
          medicos: medicos.length,
          sedes: sedes.length,
        });
      },
    );
  }, []);

  return (
    <section
      style={{
        background: "linear-gradient(135deg, #fff1f2 0%, #fff7ed 100%)",
        padding: "clamp(48px, 8vw, 96px) clamp(16px, 4vw, 32px) clamp(48px, 6vw, 80px)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        <Text style={{ color: "#be123c", fontWeight: 600, fontSize: 14, letterSpacing: 1 }}>
          SWEET MEDICAL
        </Text>
        <Title level={1} style={{ fontSize: "clamp(32px, 6vw, 56px)", lineHeight: 1.1, margin: "16px 0 24px" }}>
          Tu turno médico,<br />simple y al instante
        </Title>
        <Paragraph
          style={{
            fontSize: "clamp(15px, 1.6vw, 18px)",
            color: "#475569",
            maxWidth: 640,
            margin: "0 auto 40px",
          }}
        >
          Reservá turnos con los mejores profesionales de la salud, en la sede
          más cercana y con la cobertura de tu obra social.
        </Paragraph>

        <Space size="middle" wrap style={{ marginBottom: 64, justifyContent: "center" }}>
          <Button type="primary" size="large" icon={<CalendarOutlined />} onClick={() => navigate("/buscar")}>
            Buscar turnos
          </Button>
          <Button size="large" icon={<ArrowRightOutlined />} onClick={() => navigate("/mis-turnos")}>
            Mis turnos
          </Button>
        </Space>

        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: 16, border: "1px solid rgba(190,18,60,0.12)" }}>
              <Statistic
                title="Especialidades"
                value={stats.especialidades}
                prefix={<MedicineBoxOutlined style={{ color: "#be123c" }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: 16, border: "1px solid rgba(190,18,60,0.12)" }}>
              <Statistic
                title="Médicos disponibles"
                value={stats.medicos}
                prefix={<TeamOutlined style={{ color: "#be123c" }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: 16, border: "1px solid rgba(190,18,60,0.12)" }}>
              <Statistic
                title="Sedes"
                value={stats.sedes}
                prefix={<EnvironmentOutlined style={{ color: "#be123c" }} />}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </section>
  );
}
