import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Space, Typography, Radio, Divider, Tag, Tooltip } from "antd";
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined, SafetyCertificateOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const fmtFecha = (iso) => iso.slice(0, 10);
const fmtHora = (iso) => iso.slice(11, 16);
const fmtMoneda = (n) => {
  if (n === 0 || n === "Sin costo" || !n) return "Sin costo";
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
};

const COBERTURA_CONFIG = {
  TOTAL: { color: "success", labelKey: "buscarTurnos.cobertura.total" },
  PARCIAL: { color: "warning", labelKey: "buscarTurnos.cobertura.parcial" },
  "NO CUBIERTA": { color: "error", labelKey: "buscarTurnos.cobertura.noCubierta" },
};

function CoberturaTag({ nivel, t }) {
  const config = nivel ? COBERTURA_CONFIG[nivel] : null;
  const label = config ? t(config.labelKey) : t("buscarTurnos.cobertura.noCubierta");
  const tooltip = config ? t(`${config.labelKey}Tooltip`) : t("buscarTurnos.cobertura.noCubiertaTooltip");
  const color = config ? config.color : "error";
  return (
    <Tooltip title={tooltip}>
      <Tag color={color} icon={<SafetyCertificateOutlined />}>
        {label}
      </Tag>
    </Tooltip>
  );
}

/* Modal para reservar un turno. Recibe el turno, el médico (con sus prácticas
 y especialidad personalizada resuelta) y dispara onReservar(motivoElegido)
cuando el usuario confirma */
export default function ModalReservaTurno({
  turno,
  medico,
  especialidadPersonalizada,
  practicasById,
  onCancel,
  onReservar,
  reservando,
}) {
  // Guardamos el ÍNDICE de la opción elegida para evitar cualquier problema
  // de comparación de ObjectIds o strings.
  const [motivoIdx, setMotivoIdx] = useState(null);

  // Cada vez que cambia el turno (se abre el modal con otro) reseteo la opción seleccionada.
  useEffect(() => { setMotivoIdx(null); }, [turno]);

  // opciones de motivo: las especialidades + prácticas del turno.
  const opciones = useMemo(() => {
    if (!turno) return [];
    const arr = [];
    const especialidadesTurno = Array.isArray(turno.especialidad) ? turno.especialidad : [];
    for (const especialidad of especialidadesTurno) {
      if (especialidad) arr.push({
        tipo: "esp",
        id: especialidad.id || especialidad._id,
        nombre: `Consulta · ${especialidad.nombre}`,
        precio: especialidad.costo || 0,
        cobertura: especialidad.cobertura ?? null,
      });
    }
    const practicasTurno = Array.isArray(turno.practica) ? turno.practica : [];
    for (const practica of practicasTurno) {
      if (practica) arr.push({
        tipo: "prac",
        id: practica.id || practica._id,
        nombre: `Práctica · ${practica.nombre}`,
        precio: practica.costo || 0,
        cobertura: practica.cobertura ?? null,
      });
    }
    return arr;
  }, [turno]);

  // La opción elegida se deriva del índice guardado en el estado.
  const motivoElegido = motivoIdx !== null ? opciones[motivoIdx] ?? null : null;

  const { t } = useTranslation();

  return (
    <Modal
      title={t("buscarTurnos.confirm.title")}
      open={!!turno}
      onCancel={onCancel}
      onOk={() => onReservar(motivoElegido)}
      okText={t("buscarTurnos.confirm.ok")}
      cancelText={t("buscarTurnos.confirm.cancel")}
      confirmLoading={reservando}
      okButtonProps={{ disabled: !motivoElegido }}
    >
      {turno && (
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>

          <div>
            <Text strong style={{ fontSize: 16 }}>{turno.medicoNombre}</Text>
            <br />
            <Text type="secondary">
              <CalendarOutlined /> {fmtFecha(turno.fechaHora)} · <ClockCircleOutlined /> {fmtHora(turno.fechaHora)} · <EnvironmentOutlined /> {turno.sede?.nombre}{turno.sede?.direccion ? `, ${turno.sede.direccion}` : ""}
            </Text>
          </div>

          <Divider style={{ margin: 0 }} />

          <div>
            <Text strong>{t("buscarTurnos.modalMotivoLabel")}</Text>
            <Paragraph type="secondary" style={{ fontSize: 12, margin: "4px 0 8px" }}>
              {t("buscarTurnos.modalPriceInfo")}
            </Paragraph>
            <Radio.Group
              value={motivoIdx}
              onChange={(e) => setMotivoIdx(e.target.value)}
              style={{ width: "100%" }}
            >
              <Space direction="vertical" size="small" style={{ width: "100%" }}>
                {opciones.map((o, idx) => (
                  <Radio key={idx} value={idx} style={{ width: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", gap: 8, flexWrap: "wrap" }}>
                      <span>{o.nombre}</span>
                      <Space size={6}>
                        <CoberturaTag nivel={o.cobertura} t={t} />
                        <Text type="secondary" style={{ minWidth: 70, textAlign: "right" }}>{fmtMoneda(o.precio)}</Text>
                      </Space>
                    </div>
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </div>

          {motivoElegido && (
            <>
              <Divider style={{ margin: 0 }} />
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Text strong>{t("buscarTurnos.total")}</Text>
                <Title level={4} style={{ margin: 0, color: "#be123c" }}>
                  {fmtMoneda(motivoElegido.precio)}
                </Title>
              </Space>
            </>
          )}
        </Space>
      )}
    </Modal>
  );
}
