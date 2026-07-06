import { useTranslation } from "react-i18next";
import CrudTab from "../components/CrudTab";
import { getObrasSociales, crearObraSocial } from "../../../api/api";
import { buildTextos } from "../utils";

export default function ObrasSocialesTab({ onChanged }) {
  const { t } = useTranslation();
  return (
    <CrudTab
      loadFn={getObrasSociales}
      createFn={crearObraSocial}
      onChanged={onChanged}
      fields={[
        {
          name: "nombre",
          label: t("admin.campos.nombre"),
          rules: [{ required: true, message: t("admin.validacion.nombreRequerido") }],
        },
      ]}
      textos={buildTextos(t, "obrasSociales")}
    />
  );
}
