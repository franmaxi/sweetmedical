import { useTranslation } from "react-i18next";
import { Card, Form, Select, Input, DatePicker, Button } from "antd";
import { ClearOutlined } from "@ant-design/icons";

// card de filtros de la pantalla BuscarTurnos.
export default function FiltrosTurnos({
  especialidadesGenericas,
  sedes,
  especialidadGenericaId,
  setEspecialidadGenericaId,
  sedeId,
  setSedeId,
  medicoQuery,
  setMedicoQuery,
  fechaDesde,
  setFechaDesde,
  onLimpiar,
}) {
  const { t } = useTranslation();

  return (
    <Card
      title={t("buscarTurnos.filtrosTitulo")}
      extra={
        <Button type="link" size="small" icon={<ClearOutlined />} onClick={onLimpiar}>
          {t("buscarTurnos.limpiar")}
        </Button>
      }
    >
      <Form layout="vertical">
        <Form.Item label={t("buscarTurnos.labelEspecialidad")}>
          <Select
            placeholder={t("buscarTurnos.placeholderTodas")}
            allowClear
            value={especialidadGenericaId}
            onChange={setEspecialidadGenericaId}
            options={especialidadesGenericas.map((e) => ({ value: e.id, label: e.nombre }))}
          />
        </Form.Item>
        <Form.Item label={t("buscarTurnos.labelMedico")}>
          <Input
            placeholder={t("buscarTurnos.placeholderMedico")}
            value={medicoQuery}
            onChange={(e) => setMedicoQuery(e.target.value)}
            allowClear
          />
        </Form.Item>
        <Form.Item label={t("buscarTurnos.labelSede")}>
          <Select
            placeholder={t("buscarTurnos.placeholderTodas")}
            allowClear
            value={sedeId}
            onChange={setSedeId}
            options={sedes.map((s) => ({ value: s.id, label: s.nombre }))}
          />
        </Form.Item>
        <Form.Item label={t("buscarTurnos.labelFechaDesde")}>
          <DatePicker
            style={{ width: "100%" }}
            value={fechaDesde}
            onChange={setFechaDesde}
            format="DD/MM/YYYY"
          />
        </Form.Item>
      </Form>
    </Card>
  );
}
