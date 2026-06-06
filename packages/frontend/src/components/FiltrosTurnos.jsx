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
  return (
    <Card
      title="Filtros"
      extra={
        <Button type="link" size="small" icon={<ClearOutlined />} onClick={onLimpiar}>
          Limpiar
        </Button>
      }
    >
      <Form layout="vertical">
        <Form.Item label="Especialidad">
          <Select
            placeholder="Todas"
            allowClear
            value={especialidadGenericaId}
            onChange={setEspecialidadGenericaId}
            options={especialidadesGenericas.map((e) => ({ value: e.id, label: e.nombre }))}
          />
        </Form.Item>
        <Form.Item label="Médico">
          <Input
            placeholder="Buscar por nombre"
            value={medicoQuery}
            onChange={(e) => setMedicoQuery(e.target.value)}
            allowClear
          />
        </Form.Item>
        <Form.Item label="Sede">
          <Select
            placeholder="Todas"
            allowClear
            value={sedeId}
            onChange={setSedeId}
            options={sedes.map((s) => ({ value: s.id, label: s.nombre }))}
          />
        </Form.Item>
        <Form.Item label="Fecha desde">
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
