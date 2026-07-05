import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, Avatar, Typography, Button, Space, Tag, Carousel, Empty, Input } from "antd";
import { IdcardOutlined, LeftOutlined, RightOutlined, SearchOutlined } from "@ant-design/icons";
import { getMedicosFull } from "../api/api";

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

// Cuántas tarjetas se muestran a la vez según el ancho (breakpoints max-width de slick).
const CAROUSEL_RESPONSIVE = [
  { breakpoint: 1200, settings: { slidesToShow: 3 } },
  { breakpoint: 768, settings: { slidesToShow: 2 } },
  { breakpoint: 576, settings: { slidesToShow: 1 } },
];

const flechaStyle = (lado) => ({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  [lado]: -8,
  zIndex: 2,
  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.12)",
});

export default function Medicos() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [medicos, setMedicos] = useState([]);
  const [query, setQuery] = useState("");
  const carouselRef = useRef(null);

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return medicos;
    return medicos.filter(
      (m) =>
        m.nombre?.toLowerCase().includes(q) ||
        m.especialidadNombre?.toLowerCase().includes(q),
    );
  }, [query, medicos]);

  const verAgenda = (medico) => {
    const id = medico._id || medico.id;
    if (!id) return;
    navigate(`/buscar?medicoId=${encodeURIComponent(id)}`);
  };

  useEffect(() => {
    getMedicosFull()
      .then((res) => {
        const listaMedicos = res?.data || [];
        setMedicos(
          listaMedicos.map((m) => ({
            ...m,
            especialidadNombre: m.especialidades?.map((e) => e.nombre).join(", ") || "—",
          })),
        );
      })
      .catch((err) => {
        console.error("Error al obtener médicos desde el backend", err);
      });
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

        {medicos.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
            <Input
              size="large"
              allowClear
              prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
              placeholder={t("doctor.buscarPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ maxWidth: 480, width: "100%" }}
            />
          </div>
        )}

        {filtrados.length === 0 ? (
          <Empty description={query ? t("doctor.noResultados", { query }) : t("doctor.subtitulo")} />
        ) : (
          <div style={{ position: "relative", padding: "0 8px" }}>
            <Button
              shape="circle"
              icon={<LeftOutlined />}
              onClick={() => carouselRef.current?.prev()}
              style={flechaStyle("left")}
              aria-label="Anterior"
            />
            <Button
              shape="circle"
              icon={<RightOutlined />}
              onClick={() => carouselRef.current?.next()}
              style={flechaStyle("right")}
              aria-label="Siguiente"
            />
            <Carousel
              key={filtrados.length}
              ref={carouselRef}
              draggable
              dots
              infinite={filtrados.length > 4}
              slidesToShow={4}
              slidesToScroll={1}
              responsive={CAROUSEL_RESPONSIVE}
              style={{ paddingBottom: 32 }}
            >
            {filtrados.map((m) => (
              <div key={m._id || m.id}>
                <div style={{ padding: "0 10px" }}>
                  <Card style={{ height: "100%", borderRadius: 16 }} hoverable>
                    <Space direction="vertical" size={8} style={{ width: "100%", alignItems: "flex-start" }}>
                      <Avatar size={56} style={{ background: colorAvatar(m), fontWeight: 700 }}>
                        {iniciales(m.nombre)}
                      </Avatar>
                      <Title level={5} style={{ margin: 0 }}>{m.nombre}</Title>
                      <Tag color="pink">{m.especialidadNombre}</Tag>
                      <Space size={6}>
                        <IdcardOutlined style={{ color: "#94a3b8" }} />
                        <Text type="secondary" style={{ fontSize: 13 }}>{m.matricula}</Text>
                      </Space>
                      <Button type="primary" block style={{ marginTop: 12 }} onClick={() => verAgenda(m)}>
                        {t("doctor.verAgenda")}
                      </Button>
                    </Space>
                  </Card>
                </div>
              </div>
            ))}
            </Carousel>
          </div>
        )}
      </div>
    </section>
  );
}
