import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Row, Col, Card, Input, Typography, Tag, Empty, Button, Modal, Avatar, Space } from "antd";
import { SearchOutlined, EnvironmentOutlined, IdcardOutlined } from "@ant-design/icons";
import { getEspecialidadesGenericas, getMedicosFull } from "../api/api";

const { Title, Text, Paragraph } = Typography;

const ICONO_DEFAULT = "🩺";

const AVATAR_COLORS = ["#be123c", "#f59e0b", "#10b981", "#6366f1", "#0ea5e9", "#d946ef"];

const hashName = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

// "Dra. Jessica Joan" → "JJ"
const iniciales = (nombre = "") => {
  const partes = nombre.split(/\s+/).filter((p) => !/^Dra?\.?$/i.test(p));
  return ((partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "")).toUpperCase();
};

const colorAvatar = (nombre = "") => AVATAR_COLORS[hashName(nombre) % AVATAR_COLORS.length];

// True si el médico atiende la especialidad genérica indicada.
const atiendeEspecialidad = (medico, especialidadId) =>
  (medico.especialidades || []).some((esp) => {
    const key = esp.especialidadGenerica?._id || esp.especialidadGenerica;
    return key && String(key) === String(especialidadId);
  });

const DESCRIPCIONES_LOCALES = {
  "Cardiología": "Cuidado integral de tu corazón y sistema circulatorio.",
  "Pediatría": "Atención médica especializada para el crecimiento sano de tus niños.",
  "Oftalmología": "Exámenes de vista y tratamiento de enfermedades oculares.",
  "Clínica Médica": "Tu médico de cabecera para chequeos generales y cuidados preventivos.",
  "Dermatología": "Salud, prevención y estética de tu piel, cabello y uñas.",
  "Traumatología": "Tratamiento de lesiones en huesos, articulaciones y músculos.",
  "Ginecología": "Atención especializada para la salud integral de la mujer.",
  "Obstetricia": "Control prenatal, parto y cuidado del embarazo.",
  "Neurología": "Diagnóstico y tratamiento de trastornos del sistema nervioso.",
  "Odontología": "Cuidado, prevención y salud de tu boca y dientes.",
};

// Cuenta cuántos médicos atienden cada especialidad genérica.
const contarMedicosPorGenerica = (medicosList) => {
  const conteo = new Map();
  for (const m of medicosList) {
    if (!m.especialidades) continue;
    for (const esp of m.especialidades) {
      const key = esp.especialidadGenerica?._id || esp.especialidadGenerica;
      if (!key) continue;
      const keyStr = String(key);
      conteo.set(keyStr, (conteo.get(keyStr) ?? 0) + 1);
    }
  }
  return conteo;
};

export default function Especialidades() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [especialidades, setEspecialidades] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState(null);

  useEffect(() => {
    Promise.all([getEspecialidadesGenericas(), getMedicosFull()])
      .then(([espRes, medRes]) => {
        const listaEsp = espRes?.data || [];
        const listaMedicos = medRes?.data || [];
        setMedicos(listaMedicos);
        const conteo = contarMedicosPorGenerica(listaMedicos);
        setEspecialidades(
          listaEsp.map((e) => {
            const descripcion = DESCRIPCIONES_LOCALES[e.nombre] || "Atención médica profesional y personalizada.";
            return {
              ...e,
              id: e._id || e.id,
              descripcion,
              medicos: conteo.get(String(e._id || e.id)) ?? 0,
            };
          })
        );
      })
      .catch((err) => {
        console.error("Error al cargar especialidades y médicos desde el backend", err);
      });
  }, []);

  const filtradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return especialidades;
    return especialidades.filter(
      (e) => e.nombre.toLowerCase().includes(q)
    );
  }, [query, especialidades]);

  // Médicos que atienden la especialidad seleccionada (para el modal).
  const medicosDeEspecialidad = useMemo(() => {
    if (!especialidadSeleccionada) return [];
    return medicos.filter((m) => atiendeEspecialidad(m, especialidadSeleccionada.id));
  }, [medicos, especialidadSeleccionada]);

  return (
    <section id="especialidades" style={{ padding: "clamp(48px, 8vw, 80px) clamp(16px, 4vw, 32px)", background: "#fff" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ marginBottom: 40 }}>
          <Text style={{ color: "#be123c", fontWeight: 600, fontSize: 14 }}>
            {t("especialidades.seccionEtiqueta")}
          </Text>
          <Title level={2} style={{ marginTop: 8, fontSize: "clamp(24px, 4vw, 36px)" }}>
            {t("especialidades.tituloLinea1")}<br />{t("especialidades.tituloLinea2")}
          </Title>
        </div>

        <Input
          size="large"
          allowClear
          prefix={<SearchOutlined />}
          placeholder={t("especialidades.placeholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          suffix={
            <Text type="secondary" style={{ fontSize: 12 }}>
              {filtradas.length} {filtradas.length === 1 ? t("especialidades.resultadoUno") : t("especialidades.resultadosMultiples")}
            </Text>
          }
          style={{ marginBottom: 32, maxWidth: 720 }}
        />

        {filtradas.length === 0 ? (
          <Empty description={t("especialidades.noResultados", { query })} />
        ) : (
          <Row gutter={[24, 24]}>
            {filtradas.map((e) => (
              <Col xs={24} sm={12} lg={8} key={e.id}>
                <Card hoverable style={{ height: "100%", borderRadius: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <span style={{ fontSize: 28 }}>
                      {e.emoji || ICONO_DEFAULT}
                    </span>
                    <Tag color="pink">{e.medicos} {t("especialidades.medicosEtiqueta")}</Tag>
                  </div>
                  <Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>{e.nombre}</Title>
                  <Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 16 }}>
                    {e.descripcion}
                  </Paragraph>
                  <Button
                    type="link"
                    style={{ padding: 0 }}
                    disabled={!e.medicos}
                    onClick={() => setEspecialidadSeleccionada(e)}
                  >
                    {t("especialidades.verMedicos")} →
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      <Modal
        open={Boolean(especialidadSeleccionada)}
        onCancel={() => setEspecialidadSeleccionada(null)}
        footer={null}
        width={680}
        title={
          especialidadSeleccionada && (
            <Space size={8}>
              <span style={{ fontSize: 22 }}>
                {especialidadSeleccionada.emoji || ICONO_DEFAULT}
              </span>
              <span>{especialidadSeleccionada.nombre}</span>
            </Space>
          )
        }
      >
        {medicosDeEspecialidad.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("especialidades.sinMedicos")}
          />
        ) : (
          <Row gutter={[16, 16]}>
            {medicosDeEspecialidad.map((m) => (
              <Col xs={24} sm={12} key={m._id || m.id}>
                <Card size="small" style={{ borderRadius: 12, height: "100%" }}>
                  <Space align="start" size={12}>
                    <Avatar
                      size={44}
                      style={{ background: colorAvatar(m.nombre), fontWeight: 700, flex: "0 0 auto" }}
                    >
                      {iniciales(m.nombre)}
                    </Avatar>
                    <Space direction="vertical" size={2}>
                      <Text strong>{m.nombre}</Text>
                      <Space size={6}>
                        <EnvironmentOutlined style={{ color: "#94a3b8" }} />
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {m.sedes?.[0]?.nombre || "—"}
                        </Text>
                      </Space>
                      <Space size={6}>
                        <IdcardOutlined style={{ color: "#94a3b8" }} />
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {m.matricula || "—"}
                        </Text>
                      </Space>
                    </Space>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Modal>
    </section>
  );
}
