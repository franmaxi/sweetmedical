import { useTranslation } from "react-i18next";
import CrudTab from "../components/CrudTab";
import {
  getPracticasGenericas,
  crearPracticaGenerica,
  actualizarPracticaGenerica,
} from "../../../api/api";
import { buildTextos } from "../utils";
import { validarUnicoEmoji } from "../../../utils/emojis";

export default function PracticasTab({ onChanged }) {
  const { t } = useTranslation();
  return (
    <CrudTab
      loadFn={() => getPracticasGenericas({ limit: 100 })}
      createFn={crearPracticaGenerica}
      updateFn={actualizarPracticaGenerica}
      onChanged={onChanged}
      fields={[
        {
          name: "nombre",
          label: t("admin.campos.nombre"),
          rules: [{ required: true, message: t("admin.validacion.nombreRequerido") }],
        },
        {
          name: "codigo",
          label: t("admin.campos.codigo"),
          width: 140,
          rules: [{ required: true, message: t("admin.validacion.codigoRequerido") }],
        },
        {
          name: "emoji",
          label: t("admin.campos.emoji"),
          width: 90,
          type: "emoji",
          extra: t("admin.hints.emoji"),
          rules: [
            { required: true, message: t("admin.validacion.emojiRequerido") },
            { validator: validarUnicoEmoji }
          ],
        },
      ]}
      textos={buildTextos(t, "practicas")}
    />
  );
}
