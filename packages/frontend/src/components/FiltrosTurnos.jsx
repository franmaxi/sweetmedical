import { useTranslation } from "react-i18next";
import { Card, Form, Select, DatePicker, Button, Tooltip } from "antd";
import { ClearOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export default function FiltrosTurnos({
  especialidadesGenericas,
  sedes,
  practicasGenericas,
  medicos = [],
  filtros,
  setFiltros,
  onAplicar,
  onLimpiar,
}) {
  const { t } = useTranslation();

  const set = (campo) => (valor) =>
    setFiltros((prev) => {
      const next = { ...prev, [campo]: valor };

      // Exclusividad mutua: elegir especialidad limpia práctica y viceversa
      if (campo === "especialidadGenericaId" && valor) next.practicaGenericaId = undefined;
      if (campo === "practicaGenericaId"     && valor) next.especialidadGenericaId = undefined;

      // Si se deselecciona especialidad o práctica y el ordenamiento es por costo, lo reseteamos
      const limpiaFiltroServicio =
        (campo === "especialidadGenericaId" || campo === "practicaGenericaId") && !valor;
      const ordenaPorCosto = next.ordenarPor === "costoFinal";
      const quedaSinServicio = !next.especialidadGenericaId && !next.practicaGenericaId;
      if (limpiaFiltroServicio && ordenaPorCosto && quedaSinServicio) {
        next.ordenarPor = "fechaHora";
        next.direccion = "asc";
      }
      return next;
    });

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
          <Tooltip
            title={filtros.practicaGenericaId ? t("buscarTurnos.ayudaEspecialidadBloqueada", "Ya filtraste por práctica. Limpiá ese filtro para buscar por especialidad.") : null}
            placement="right"
          >
            <Select
              placeholder={t("buscarTurnos.placeholderTodas")}
              allowClear
              showSearch
              disabled={!!filtros.practicaGenericaId}
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              value={filtros.especialidadGenericaId}
              onChange={set("especialidadGenericaId")}
              options={especialidadesGenericas.map((m) => ({ value: m._id ?? m.id, label: m.nombre }))}
            />
          </Tooltip>
        </Form.Item>

        <Form.Item label={t("buscarTurnos.labelPractica")}>
          <Tooltip
            title={filtros.especialidadGenericaId ? t("buscarTurnos.ayudaPracticaBloqueada", "Ya filtraste por especialidad. Limpiá ese filtro para buscar por práctica.") : null}
            placement="right"
          >
            <Select
              placeholder={t("buscarTurnos.placeholderTodas")}
              allowClear
              showSearch
              disabled={!!filtros.especialidadGenericaId}
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              value={filtros.practicaGenericaId}
              onChange={set("practicaGenericaId")}
              options={practicasGenericas.map((m) => ({ value: m._id ?? m.id, label: m.nombre }))}
            />
          </Tooltip>
        </Form.Item>

        <Form.Item label={t("buscarTurnos.labelMedico")}>
          <Select
            placeholder={t("buscarTurnos.placeholderMedico")}
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            value={filtros.medicoId}
            onChange={set("medicoId")}
            options={medicos.map((m) => ({ value: m._id ?? m.id, label: m.nombre }))}
          />
        </Form.Item>

        <Form.Item label={t("buscarTurnos.labelSede")}>
          <Select
            placeholder={t("buscarTurnos.placeholderTodas")}
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            value={filtros.sedeId}
            onChange={set("sedeId")}
            options={sedes.map((s) => ({ value: s._id ?? s.id, label: s.nombre }))}
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
            disabledDate={(current) => {
                const antesDeHoy = current && current.isBefore(dayjs().startOf("day"));
                const despuesDeFechaHasta = filtros.fechaHasta ? current && current.isAfter(filtros.fechaHasta, "day") : false;
                return antesDeHoy || despuesDeFechaHasta;
              }}
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
        <Form.Item label={t("buscarTurnos.labelOrdenarPor")}>
          <Select
            value={`${filtros.ordenarPor},${filtros.direccion}`}
            onChange={(val) => {
              const [ordenarPor, direccion] = val.split(",");
              setFiltros(prev => ({ ...prev, ordenarPor, direccion }));
            }}
            options={[
              { value: "fechaHora,asc",  label: t("buscarTurnos.ordenarPorFechaHoraAsc") },
              { value: "fechaHora,desc", label: t("buscarTurnos.ordenarPorFechaHoraDesc") },
              {
                value: "costoFinal,asc",
                disabled: !filtros.especialidadGenericaId && !filtros.practicaGenericaId,
                label: (
                  <Tooltip
                    title={!filtros.especialidadGenericaId && !filtros.practicaGenericaId
                      ? t("buscarTurnos.ayudaOrdenarPorPrecio")
                      : null
                    }
                    placement="right"
                  >
                    <span style={{ display: "block", width: "100%" }}>
                      {t("buscarTurnos.ordenarPorPrecioAsc")}
                    </span>
                  </Tooltip>
                ),
              },
              {
                value: "costoFinal,desc",
                disabled: !filtros.especialidadGenericaId && !filtros.practicaGenericaId,
                label: (
                  <Tooltip
                    title={!filtros.especialidadGenericaId && !filtros.practicaGenericaId
                      ? t("buscarTurnos.ayudaOrdenarPorPrecio")
                      : null
                    }
                    placement="right"
                  >
                    <span style={{ display: "block", width: "100%" }}>
                      {t("buscarTurnos.ordenarPorPrecioDesc")}
                    </span>
                  </Tooltip>
                ),
              },
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