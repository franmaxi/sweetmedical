export const idDe = (x) => String(x?._id ?? x?.id ?? x);

// Textos compartidos + específicos por entidad
export function buildTextos(t, entidad) {
  return {
    nuevo: t("admin.acciones.nuevo"),
    editar: t("admin.acciones.editar"),
    guardar: t("admin.acciones.guardar"),
    cancelar: t("admin.acciones.cancelar"),
    acciones: t("admin.acciones.acciones"),
    creado: t("admin.mensajes.creado"),
    actualizado: t("admin.mensajes.actualizado"),
    errorCargar: t("admin.mensajes.errorCargar"),
    errorGuardar: t("admin.mensajes.errorGuardar"),
    vacio: t(`admin.vacio.${entidad}`),
    crearTitle: t(`admin.modal.crear.${entidad}`),
    editarTitle: t(`admin.modal.editar.${entidad}`),
  };
}
