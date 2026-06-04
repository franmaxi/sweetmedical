import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Row, Col, Card, Input, Typography, Tag, Empty, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { getEspecialidadesGenericas, medicosMock, especialidadesMock } from "../mocks";

const { Title, Text, Paragraph } = Typography;

// Mapa visual: nombre de especialidad → icono.
const ICONO_POR_ESPECIALIDAD = {
  "Cardiología": "♥️",
  "Ginecología": "🌸",
  "Traumatología": "🦴",
  "Neumonología": "☁️",
  "Oftalmología": "👁",
  "Pediatría": "🧸",
  "Dermatología": "✦",
  "Clínica Médica": "🩺",
  "Odontología": "🦷",
  "Neurología": "🧠",
  "Obstetricia": "🤰",
  "Psiquiatría": "🧘",
  "Oncología": "🎗",
  

};
const ICONO_DEFAULT = "+";

// Cuenta cuántos médicos atienden cada especialidad genérica.
const contarMedicosPorGenerica = () => {
  const conteo = new Map();
  for (const m of medicosMock) {
    const personalizada = especialidadesMock.find((e) => e.id === m.especialidadId);
    if (!personalizada) continue;
    const key = personalizada.especialidadGenericaId;
    conteo.set(key, (conteo.get(key) ?? 0) + 1);
  }
  return conteo;
};

export default function Especialidades() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [especialidades, setEspecialidades] = useState([]);

  useEffect(() => {
    getEspecialidadesGenericas().then((data) => {
      const conteo = contarMedicosPorGenerica();
      setEspecialidades(data.map((e) => ({ ...e, medicos: conteo.get(e.id) ?? 0 })));
    });
  }, []);

  const filtradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return especialidades;
    return especialidades.filter(
      (e) => e.nombre.toLowerCase().includes(q) || e.descripcion.toLowerCase().includes(q),
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
                      {ICONO_POR_ESPECIALIDAD[e.nombre] ?? ICONO_DEFAULT}
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
