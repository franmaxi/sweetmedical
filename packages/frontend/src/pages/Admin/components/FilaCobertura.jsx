import { Button, Form, InputNumber, Select, Tag } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

export const NIVELES_COBERTURA = [
  { value: "TOTAL", color: "green", label: "TOTAL" },
  { value: "PARCIAL", color: "gold", label: "PARCIAL" },
  { value: "NO CUBIERTA", color: "red", label: "NO CUBIERTA" }
];

export const getColorPorNivel = (nivel) => {
  const n = NIVELES_COBERTURA.find(x => x.value === nivel);
  return n ? n.color : "default";
};

/**
 * Fila individual de cobertura (especialidad o práctica).
 * Props:
 *   item      – { id, especialidadGenerica|practicaGenerica, nivel, pocentajeDescuento }
 *   opciones  – [{ label, value }]
 *   loading   – boolean
 *   onChange  – (id, campo, valor) => void
 *   onRemove  – (id) => void
 *   labelSelect – string
 *   keyGenerica – "especialidadGenerica" | "practicaGenerica"
 *   t         – función de traducción
 */
export default function FilaCobertura({ item, opciones, loading, onChange, onRemove, labelSelect, keyGenerica, t }) {
  const isParcial = item.nivel === "PARCIAL";

  const handleNivelChange = (val) => {
    onChange(item.id, "nivel", val);
    if (val === "TOTAL") {
      onChange(item.id, "pocentajeDescuento", 100);
    } else if (val === "NO CUBIERTA") {
      onChange(item.id, "pocentajeDescuento", 0);
    } else if (val === "PARCIAL") {
      // Limpiamos el valor o lo dejamos null si no es un número válido para parcial
      if (item.pocentajeDescuento === 100 || item.pocentajeDescuento === 0) {
        onChange(item.id, "pocentajeDescuento", null);
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        width: "100%",
        boxSizing: "border-box",
        background: "#f8fafc",
        borderRadius: 10,
        padding: "10px 12px",
        border: "1px solid #e2e8f0",
        marginBottom: 8,
      }}
    >
      {/* Select especialidad o práctica */}
      <Form.Item
        style={{ margin: 0, flex: 2 }}
        validateStatus={!item[keyGenerica] ? "error" : ""}
        help={!item[keyGenerica] ? t("admin.validacion." + (keyGenerica === "especialidadGenerica" ? "especialidadRequerida" : "practicaRequerida")) : null}
      >
        <Select
          placeholder={labelSelect}
          options={opciones}
          loading={loading}
          value={item[keyGenerica] || undefined}
          onChange={(val) => onChange(item.id, keyGenerica, val)}
          style={{ width: "100%" }}
          showSearch
          optionFilterProp="label"
        />
      </Form.Item>

      {/* Select nivel */}
      <Form.Item
        style={{ margin: 0, flex: 1.5 }}
        validateStatus={!item.nivel ? "error" : ""}
        help={!item.nivel ? t("admin.validacion.nivelRequerido") : null}
      >
        <Select
          placeholder={t("admin.campos.nivel")}
          value={item.nivel || undefined}
          onChange={handleNivelChange}
          style={{ width: "100%" }}
          options={NIVELES_COBERTURA.map((n) => ({
            label: <Tag color={n.color} style={{ margin: 0, display: "block", textAlign: "center" }}>{n.label}</Tag>,
            value: n.value
          }))}
        />
      </Form.Item>

      {/* Input porcentaje */}
      <Form.Item
        style={{ margin: 0, flex: 1 }}
        validateStatus={isParcial && (item.pocentajeDescuento == null || item.pocentajeDescuento < 1 || item.pocentajeDescuento > 99) ? "error" : ""}
        help={isParcial && (item.pocentajeDescuento == null || item.pocentajeDescuento < 1 || item.pocentajeDescuento > 99) ? t("admin.validacion.porcentajeInvalido") : null}
      >
        <InputNumber
          placeholder="%"
          min={1}
          max={99}
          step={1}
          disabled={!isParcial}
          value={item.pocentajeDescuento}
          onChange={(val) => onChange(item.id, "pocentajeDescuento", val)}
          style={{ width: "100%" }}
          addonAfter="%"
        />
      </Form.Item>

      {/* Botón eliminar */}
      <Button
        type="text"
        danger
        icon={<DeleteOutlined />}
        onClick={() => onRemove(item.id)}
      />
    </div>
  );
}
