import { useTranslation } from "react-i18next";
import CrudTab from "../components/CrudTab";
import {
  getEspecialidadesGenericas,
  crearEspecialidadGenerica,
  actualizarEspecialidadGenerica,
} from "../../../api/api";
import { buildTextos } from "../utils";
import { validarUnicoEmoji } from "../../../utils/emojis";

export default function EspecialidadesTab({ onChanged }) {
  const { t } = useTranslation();
  return (
    <CrudTab
      loadFn={() => getEspecialidadesGenericas({ limit: 100 })}
      createFn={crearEspecialidadGenerica}
      updateFn={actualizarEspecialidadGenerica}
      onChanged={onChanged}
      fields={[
        {
          name: "nombre",
          label: t("admin.campos.nombre"),
          rules: [{ required: true, message: t("admin.validacion.nombreRequerido") }],
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
      textos={buildTextos(t, "especialidades")}
    />
  );
}
