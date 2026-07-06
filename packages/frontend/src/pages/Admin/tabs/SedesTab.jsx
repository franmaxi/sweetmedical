import { useTranslation } from "react-i18next";
import CrudTab from "../components/CrudTab";
import { getSedes, crearSede, actualizarSede } from "../../../api/api";
import { buildTextos } from "../utils";

export default function SedesTab({ onChanged }) {
  const { t } = useTranslation();
  return (
    <CrudTab
      loadFn={() => getSedes({ limit: 100 })}
      createFn={crearSede}
      updateFn={actualizarSede}
      onChanged={onChanged}
      fields={[
        {
          name: "nombre",
          label: t("admin.campos.nombre"),
          rules: [{ required: true, message: t("admin.validacion.nombreRequerido") }],
        },
        {
          name: "direccion",
          label: t("admin.campos.direccion"),
          rules: [{ required: true, message: t("admin.validacion.direccionRequerida") }],
        },
      ]}
      textos={buildTextos(t, "sedes")}
    />
  );
}
