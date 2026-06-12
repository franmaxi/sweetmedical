import { useTranslation } from "react-i18next";
import { Card, Form, Select, Input, DatePicker, Button } from "antd";
import { ClearOutlined, SearchOutlined } from "@ant-design/icons";

export default function FiltrosTurnos({
  especialidadesGenericas,
  sedes,
  practicasGenericas,
  filtros,
  setFiltros,
  onAplicar,
  onLimpiar,
}) {
  const { t } = useTranslation();

  const set = (campo) => (valor) =>
    setFiltros((prev) => ({ ...prev, [campo]: valor }));

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
            value={filtros.especialidadGenericaId}
            onChange={set("especialidadGenericaId")}
            options={especialidadesGenericas.map((e) => ({ value: e.id, label: e.nombre }))}
          />
        </Form.Item>

        <Form.Item label={t("buscarTurnos.labelPractica")}>
          <Select
            placeholder={t("buscarTurnos.placeholderTodas")}
            allowClear
            value={filtros.practicaGenericaId}
            onChange={set("practicaGenericaId")}
            options={practicasGenericas.map((e) => ({ value: e.id, label: e.nombre }))}
          />
        </Form.Item>

        <Form.Item label={t("buscarTurnos.labelMedico")}>
          <Input
            placeholder={t("buscarTurnos.placeholderMedico")}
            value={filtros.medicoQuery}
            onChange={(e) => set("medicoQuery")(e.target.value)}
            allowClear
          />
        </Form.Item>

        <Form.Item label={t("buscarTurnos.labelSede")}>
          <Select
            placeholder={t("buscarTurnos.placeholderTodas")}
            allowClear
            value={filtros.sedeId}
            onChange={set("sedeId")}
            options={sedes.map((s) => ({ value: s.id, label: s.nombre }))}
          />
        </Form.Item>

        <Form.Item
          label={t("buscarTurnos.labelFechaDesde")}
          validateStatus={
            filtros.fechaDesde && filtros.fechaHasta && filtros.fechaDesde.isAfter(filtros.fechaHasta)
              ? "error"
              : ""
          }
        >
          <DatePicker
            style={{ width: "100%" }}
            value={filtros.fechaDesde}
            onChange={set("fechaDesde")}
            format="DD/MM/YYYY"
            disabledDate={(current) =>
              filtros.fechaHasta ? current && current.isAfter(filtros.fechaHasta, "day") : false
            }
          />
        </Form.Item>

        <Form.Item
          label={t("buscarTurnos.labelFechaHasta")}
          validateStatus={
            filtros.fechaDesde && filtros.fechaHasta && filtros.fechaDesde.isAfter(filtros.fechaHasta)
              ? "error"
              : ""
          }
          help={
            filtros.fechaDesde && filtros.fechaHasta && filtros.fechaDesde.isAfter(filtros.fechaHasta)
              ? t("buscarTurnos.errorFechaRango")
              : ""
          }
        >
          <DatePicker
            style={{ width: "100%" }}
            value={filtros.fechaHasta}
            onChange={set("fechaHasta")}
            format="DD/MM/YYYY"
            disabledDate={(current) =>
              filtros.fechaDesde ? current && current.isBefore(filtros.fechaDesde, "day") : false
            }
          />
        </Form.Item>
        <Form.Item label={t("buscarTurnos.labelOrdenarPor")  }>
          <Select
            value={`${filtros.ordenarPor},${filtros.direccion}`}
            onChange={(val) => {
              const [ordenarPor, direccion] = val.split(",");
              setFiltros(prev => ({ ...prev, ordenarPor, direccion }));
            }}
            options={[
              { value: "fechaHora,asc", label: t("buscarTurnos.ordenarPorFechaHoraAsc") },
              { value: "fechaHora,desc", label: t("buscarTurnos.ordenarPorFechaHoraDesc") },
              { value: "costoFinal,asc", label: t("buscarTurnos.ordenarPorPrecioAsc") },
              { value: "costoFinal,desc", label: t("buscarTurnos.ordenarPorPrecioDesc") }
            ]}
          />
      </Form.Item>

        <Button type="primary" block icon={<SearchOutlined />} onClick={onAplicar}>
          {t("buscarTurnos.buscar")}
        </Button>
      </Form>
    </Card>
  );
}