import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Row, Col, Card, Avatar, Typography, Button, Space, Tag } from "antd";
import { EnvironmentOutlined, IdcardOutlined } from "@ant-design/icons";
import { getMedicos, getEspecialidades, getSedes } from "../mocks";

const { Title, Text, Paragraph } = Typography;

const AVATAR_COLORS = ["#be123c", "#f59e0b", "#10b981", "#6366f1", "#0ea5e9", "#d946ef"];

const hashName = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

// "Dra. Jessica Joan" → "JJ"
const iniciales = (nombre) => {
  const partes = nombre.split(/\s+/).filter((p) => !/^Dra?\.?$/i.test(p));
  return ((partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "")).toUpperCase();
};

const colorAvatar = (m) => AVATAR_COLORS[hashName(m.nombre) % AVATAR_COLORS.length];

export default function Medicos() {
  const { t } = useTranslation();
  const [medicos, setMedicos] = useState([]);

  useEffect(() => {
    Promise.all([getMedicos(), getEspecialidades(), getSedes()]).then(
      ([listaMedicos, especialidades, sedes]) => {
        const espById = new Map(especialidades.map((e) => [e.id, e]));
        const sedeById = new Map(sedes.map((s) => [s.id, s]));
        setMedicos(
          listaMedicos.map((m) => ({
            ...m,
            especialidadNombre: espById.get(m.especialidadId)?.nombre ?? "—",
            sedeNombre: sedeById.get(m.sedes[0])?.nombre ?? "—",
          })),
        );
      },
    );
  }, []);

  return (
    <section id="medicos" style={{ padding: "clamp(48px, 8vw, 80px) clamp(16px, 4vw, 32px)", background: "#fafafa" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Text style={{ color: "#be123c", fontWeight: 600, fontSize: 14 }}>{t("doctor.seccionEtiqueta")}</Text>
          <Title level={2} style={{ marginTop: 8, fontSize: "clamp(24px, 4vw, 36px)" }}>{t("doctor.titulo")}</Title>
          <Paragraph type="secondary" style={{ maxWidth: 560, margin: "12px auto 0" }}>
            {t("doctor.subtitulo")}
          </Paragraph>
        </div>

        <Row gutter={[20, 20]}>
          {medicos.map((m) => (
            <Col xs={24} sm={12} lg={6} key={m.id}>
              <Card style={{ height: "100%", borderRadius: 16 }} hoverable>
                <Space direction="vertical" size={8} style={{ width: "100%", alignItems: "flex-start" }}>
                  <Avatar size={56} style={{ background: colorAvatar(m), fontWeight: 700 }}>
                    {iniciales(m.nombre)}
                  </Avatar>
                  <Title level={5} style={{ margin: 0 }}>{m.nombre}</Title>
                  <Tag color="pink">{m.especialidadNombre}</Tag>
                  <Space size={6}>
                    <EnvironmentOutlined style={{ color: "#94a3b8" }} />
                    <Text type="secondary" style={{ fontSize: 13 }}>{m.sedeNombre}</Text>
                  </Space>
                  <Space size={6}>
                    <IdcardOutlined style={{ color: "#94a3b8" }} />
                    <Text type="secondary" style={{ fontSize: 13 }}>{m.matricula}</Text>
                  </Space>
                  <Button type="primary" block style={{ marginTop: 12 }}>
                    {t("doctor.verAgenda")}
                  </Button>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Button size="large">{t("doctor.verTodosDoctores")}</Button>
        </div>
      </div>
    </section>
  );
}
