import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  App as AntApp,
  Alert,
  Button,
  Card,
  Empty,
  Layout,
  List,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useCart } from "../../context/CartContext";
import { reservarTurno } from "../../api/api";

const { Title, Text } = Typography;
const { Content } = Layout;

const fmtFecha = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleString("es-AR", {
    weekday: "short", day: "2-digit", month: "short",
  });
};
const fmtHora = (iso) => (iso ? new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) : "");
const fmtMoneda = (n) =>
  !n ? "Sin costo" : new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

export default function Carrito() {
  return (
    <AntApp>
      <CarritoInner />
    </AntApp>
  );
}

function CarritoInner() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, quitar, vaciar, total } = useCart();

  const [procesando, setProcesando] = useState(false);
  // { reservados: [nombres], conflictos: [nombres], errores: [nombres] }
  const [resultado, setResultado] = useState(null);

  const confirmar = async () => {
    setProcesando(true);
    setResultado(null);

    const reservados = [];
    const conflictos = [];
    const errores = [];

    // Reservamos uno por uno. El backend hace la reserva ATÓMICA (DISPONIBLE -> RESERVADO),
    // así que si otro paciente tomó el turno primero, devuelve 409 y lo marcamos como conflicto.
    for (const item of items) {
      const params = { turnoId: item.turnoId };
      if (item.motivoTipo === "esp") params.especialidadId = item.motivoId;
      if (item.motivoTipo === "prac") params.practicaId = item.motivoId;

      try {
        await reservarTurno(params);
        reservados.push(item);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 409 || status === 400 || status === 422) {
          conflictos.push(item);
        } else {
          errores.push(item);
        }
      }
    }

    // Sacamos del carrito los que se reservaron y los que ya no están disponibles (conflicto).
    // Los que fallaron por error transitorio quedan para reintentar.
    [...reservados, ...conflictos].forEach((i) => quitar(i.turnoId));

    setResultado({
      reservados: reservados.map(nombreItem),
      conflictos: conflictos.map(nombreItem),
      errores: errores.map(nombreItem),
    });
    setProcesando(false);
  };

  const nombreItem = (i) =>
    `${i.medicoNombre || "Médico"} · ${fmtFecha(i.fechaHora)} ${fmtHora(i.fechaHora)}`;

  return (
    <Layout style={{ background: "#fafafa", minHeight: "100vh" }}>
      <Navbar />
      <Content style={{ maxWidth: 820, margin: "0 auto", padding: "clamp(20px, 4vw, 36px) clamp(12px, 4vw, 24px)", width: "100%" }}>
        <Space align="center" size={10} style={{ marginBottom: 4 }}>
          <ShoppingCartOutlined style={{ fontSize: 24, color: "#be123c" }} />
          <Title level={2} style={{ margin: 0 }}>{t("carrito.titulo")}</Title>
        </Space>
        <Text type="secondary">{t("carrito.subtitulo")}</Text>

        {resultado && (
          <Space direction="vertical" size={8} style={{ width: "100%", margin: "16px 0" }}>
            {resultado.reservados.length > 0 && (
              <Alert
                type="success"
                showIcon
                message={t("carrito.resultadoReservados", { count: resultado.reservados.length })}
                description={resultado.reservados.join(" · ")}
              />
            )}
            {resultado.conflictos.length > 0 && (
              <Alert
                type="warning"
                showIcon
                message={t("carrito.resultadoConflictos", { count: resultado.conflictos.length })}
                description={resultado.conflictos.join(" · ")}
              />
            )}
            {resultado.errores.length > 0 && (
              <Alert
                type="error"
                showIcon
                message={t("carrito.resultadoErrores", { count: resultado.errores.length })}
                description={resultado.errores.join(" · ")}
              />
            )}
            {resultado.reservados.length > 0 && (
              <Button type="primary" onClick={() => navigate("/mis-turnos")}>
                {t("carrito.verMisTurnos")}
              </Button>
            )}
          </Space>
        )}

        <Card style={{ marginTop: 16, borderRadius: 16 }} bodyStyle={{ padding: items.length ? 8 : 24 }}>
          {items.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("carrito.vacio")}
            >
              <Button type="primary" onClick={() => navigate("/buscar")}>
                {t("carrito.buscarTurnos")}
              </Button>
            </Empty>
          ) : (
            <List
              dataSource={items}
              renderItem={(item) => (
                <List.Item
                  key={item.turnoId}
                  actions={[
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => quitar(item.turnoId)}
                      disabled={procesando}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    title={item.medicoNombre || "Médico"}
                    description={
                      <Space direction="vertical" size={2}>
                        <Text type="secondary">
                          <CalendarOutlined /> {fmtFecha(item.fechaHora)} · <ClockCircleOutlined /> {fmtHora(item.fechaHora)}
                          {item.sedeNombre ? <> · <EnvironmentOutlined /> {item.sedeNombre}</> : null}
                        </Text>
                        {item.motivoNombre && <Tag color="pink">{item.motivoNombre}</Tag>}
                      </Space>
                    }
                  />
                  <Text strong style={{ marginRight: 12 }}>{fmtMoneda(item.precio)}</Text>
                </List.Item>
              )}
            />
          )}
        </Card>

        {items.length > 0 && (
          <Card style={{ marginTop: 16, borderRadius: 16 }}>
            <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 12 }}>
              <Text strong style={{ fontSize: 16 }}>{t("carrito.total")}</Text>
              <Title level={3} style={{ margin: 0, color: "#be123c" }}>{fmtMoneda(total)}</Title>
            </Space>
            <Space wrap style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={vaciar} disabled={procesando}>{t("carrito.vaciar")}</Button>
              <Button type="primary" onClick={confirmar} loading={procesando}>
                {t("carrito.confirmar")}
              </Button>
            </Space>
          </Card>
        )}
      </Content>
      <Footer />
    </Layout>
  );
}
