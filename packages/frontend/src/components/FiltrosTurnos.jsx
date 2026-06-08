<<<<<<< HEAD
import { useTranslation } from "react-i18next";
=======
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
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
<<<<<<< HEAD
  const { t } = useTranslation();

  return (
    <Card
      title={t("buscarTurnos.filtrosTitulo")}
      extra={
        <Button type="link" size="small" icon={<ClearOutlined />} onClick={onLimpiar}>
          {t("buscarTurnos.limpiar")}
=======
  return (
    <Card
      title="Filtros"
      extra={
        <Button type="link" size="small" icon={<ClearOutlined />} onClick={onLimpiar}>
          Limpiar
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
        </Button>
      }
    >
      <Form layout="vertical">
<<<<<<< HEAD
        <Form.Item label={t("buscarTurnos.labelEspecialidad")}>
          <Select
            placeholder={t("buscarTurnos.placeholderTodas")}
=======
        <Form.Item label="Especialidad">
          <Select
            placeholder="Todas"
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
            allowClear
            value={especialidadGenericaId}
            onChange={setEspecialidadGenericaId}
            options={especialidadesGenericas.map((e) => ({ value: e.id, label: e.nombre }))}
          />
        </Form.Item>
<<<<<<< HEAD
        <Form.Item label={t("buscarTurnos.labelMedico")}>
          <Input
            placeholder={t("buscarTurnos.placeholderMedico")}
=======
        <Form.Item label="Médico">
          <Input
            placeholder="Buscar por nombre"
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
            value={medicoQuery}
            onChange={(e) => setMedicoQuery(e.target.value)}
            allowClear
          />
        </Form.Item>
<<<<<<< HEAD
        <Form.Item label={t("buscarTurnos.labelSede")}>
          <Select
            placeholder={t("buscarTurnos.placeholderTodas")}
=======
        <Form.Item label="Sede">
          <Select
            placeholder="Todas"
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
            allowClear
            value={sedeId}
            onChange={setSedeId}
            options={sedes.map((s) => ({ value: s.id, label: s.nombre }))}
          />
        </Form.Item>
<<<<<<< HEAD
        <Form.Item label={t("buscarTurnos.labelFechaDesde")}>
=======
        <Form.Item label="Fecha desde">
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
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
