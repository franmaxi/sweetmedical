import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Row, Col, Card, Input, Typography, Tag, Empty, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { getEspecialidadesGenericas, getMedicosFull } from "../api/api";

const { Title, Text, Paragraph } = Typography;

const ICONO_DEFAULT = "🩺";

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

  useEffect(() => {
    Promise.all([getEspecialidadesGenericas(), getMedicosFull()])
      .then(([espRes, medRes]) => {
        const listaEsp = espRes?.data || [];
        const listaMedicos = medRes?.data || [];
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
                  <Button type="link" style={{ padding: 0 }}>
                    {t("especialidades.verMedicos")} →
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </section>
  );
}
