import { useMemo, useState, useEffect } from "react";
<<<<<<< HEAD
import { useTranslation } from "react-i18next";
=======
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
import { Modal, Space, Typography, Radio, Divider } from "antd";
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const fmtFecha = (iso) => iso.slice(0, 10);
const fmtHora = (iso) => iso.slice(11, 16);
const fmtMoneda = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

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
  const [motivoElegido, setMotivoElegido] = useState(null);

  // Cada vez que cambia el turno (se abre el modal con otro) reseteo la opción seleccionada.
  useEffect(() => { setMotivoElegido(null); }, [turno?.id]);

  // opciones de motivo: la especialidad del medico + todas sus prácticas.
  // nota: useMemo es un hook de React que sirve para memoizar un valor calculado, evitando recalcularlo innecesariamente si las dependencias no cambian.
  const opciones = useMemo(() => {
    if (!medico) return [];
    const arr = [];
    if (especialidadPersonalizada) {
      arr.push({
        tipo: "esp",
        id: especialidadPersonalizada.id,
        nombre: `Consulta · ${especialidadPersonalizada.nombre}`,
        precio: especialidadPersonalizada.costoConsulta,
      });
    }
    for (const practicaId of medico.practicas ?? []) {
      const prac = practicasById.get(practicaId);
      if (prac) arr.push({
        tipo: "prac",
        id: prac.id,
        nombre: `Práctica · ${prac.nombre}`,
        precio: prac.costo,
      });
    }
    return arr;
  }, [medico, especialidadPersonalizada, practicasById]);

<<<<<<< HEAD
  const { t } = useTranslation();

  return (
    <Modal
      title={t("buscarTurnos.confirm.title")}
      open={!!turno}
      onCancel={onCancel}
      onOk={() => onReservar(motivoElegido)}
      okText={t("buscarTurnos.confirm.ok")}
      cancelText={t("buscarTurnos.confirm.cancel")}
=======
  return (
    <Modal
      title="Reservar turno"
      open={!!turno}
      onCancel={onCancel}
      onOk={() => onReservar(motivoElegido)}
      okText="Confirmar reserva"
      cancelText="Cancelar"
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
      confirmLoading={reservando}
      okButtonProps={{ disabled: !motivoElegido }}
    >
      {turno && (
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          
          <div>
            <Text strong style={{ fontSize: 16 }}>{turno.medicoNombre}</Text>
            <br />
            <Text type="secondary">
              <CalendarOutlined /> {fmtFecha(turno.fechaHora)} · <ClockCircleOutlined /> {fmtHora(turno.fechaHora)} · <EnvironmentOutlined /> {turno.sedeNombre}
            </Text>
          </div>

          <Divider style={{ margin: 0 }} />

          <div>
<<<<<<< HEAD
            <Text strong>{t("buscarTurnos.modalMotivoLabel")}</Text>
            <Paragraph type="secondary" style={{ fontSize: 12, margin: "4px 0 8px" }}>
              {t("buscarTurnos.modalPriceInfo")}
=======
            <Text strong>Motivo de la consulta</Text>
            <Paragraph type="secondary" style={{ fontSize: 12, margin: "4px 0 8px" }}>
              El precio depende de la especialidad o práctica seleccionada.
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
            </Paragraph>
            <Radio.Group
            // el value del radio group concatena el tipo y el id para poder identificar la opción elegida, 
            // o sea hace algo como "esp-3" o "prac-5". 
            // En resuemen, es para no confundir las especialidades y practicas en caso que el id sea el mismo
            // todo: validar
              value={motivoElegido ? `${motivoElegido.tipo}-${motivoElegido.id}` : null}
              onChange={(e) => {
                const [tipo, id] = e.target.value.split("-");
                setMotivoElegido(opciones.find((o) => o.tipo === tipo && String(o.id) === id));
              }}
              style={{ width: "100%" }}

            >
              <Space direction="vertical" size="small" style={{ width: "100%" }}>
                {opciones.map((o) => (
                  <Radio key={`${o.tipo}-${o.id}`} value={`${o.tipo}-${o.id}`} style={{ width: "100%" }}>
                    <Space style={{ justifyContent: "space-between", width: "100%" }}>
                      <span>{o.nombre}</span>
                      <Text type="secondary">{fmtMoneda(o.precio)}</Text>
                    </Space>
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </div>

          {motivoElegido && (
            <>
              <Divider style={{ margin: 0 }} />
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
<<<<<<< HEAD
                <Text strong>{t("buscarTurnos.total")}</Text>
=======
                <Text strong>Total</Text>
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
                <Title level={4} color="#be123c" style={{ margin: 0, color: "#be123c" }}>
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
