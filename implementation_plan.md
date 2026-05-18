# Plan Integral de Corrección y Auditoría del Backend

Este plan aborda de manera sistemática y exhaustiva todos los fallos críticos de arranque (compilación/ESM/Zod), de ejecución (runtime/referencias rotas/operadores) y de arquitectura identificados durante la auditoría completa del backend.

## User Review Required

> [!IMPORTANT]
> Se instalará y agregará la dependencia `node-cron` al `package.json` de `backend`, la cual es requerida por `cronTurnos.js` pero no se encontraba declarada en el `package.json`.

## Open Questions

No hay preguntas abiertas. La auditoría previa y la inspección exhaustiva actual brindan el contexto total para corregir todos los errores reportados de forma segura.

## Proposed Changes

### Dependencias y Configuración
#### [MODIFY] packages/backend/package.json
- Añadir `"node-cron": "^3.0.3"` a las dependencias.

---

### Capa de Esquemas y Validaciones (Schemas & Validations)

#### [MODIFY] packages/backend/validations/turnoValidation.js
- Importar las clases `Usuario` (`domain/Usuario.js`) y `Turno` (`domain/Turno/Turno.js`) necesarias en `solicitudCambioSchema`.
- Reemplazar la redefinición local de `objectId` por `objectIdSchema` importada de `commonValidations.js`.
- Corregir el uso indebido de `objectId(...)` como función pasándolo a `objectIdSchema` en `solicitudFechaCambioBodySchema` y `responderCambioDeFecha`.
- Exportar `responderCambioDeFecha` también como `respuestaFechaCambioBodySchema` para resolver la importación en `TurnoController.js`.

#### [MODIFY] packages/backend/schemas/notificacionSchema.js
- Corregir error tipográfico en la línea 11: `moongse.Schema` -> `mongoose.Schema`.
- Modificar el campo `remitente` (línea 10) para que sea tipo `ObjectId` con `default: null` en lugar de `required: true`, alineándose con `FactoryNotificacion`.
- Modificar el campo `fechaHoraLeida` para inicializar en `default: null`.

#### [MODIFY] packages/backend/schemas/turnoSchema.js
- Importar `solicitudCambioSchema` desde su esquema de Mongoose en `./solicitudCambioSchema.js` en lugar de importar el validador de Zod desde `turnoValidation.js`.

#### [MODIFY] packages/backend/schemas/solicitudCambioSchema.js
- Eliminar las importaciones no utilizadas e incorrectas (sin extensión `.js`) de `Usuario` y `Turno`, dado que Mongoose utiliza strings para sus referencias (`ref: 'Usuario'`).

---

### Capa de Dominio (Domain)

#### [MODIFY] packages/backend/domain/Turno/SolicitudCambio.js
- Agregar la extensión `.js` al import de `turnoValidation`.

#### [MODIFY] packages/backend/domain/Medico/Medico.js
- Corregir el método `tienePracticasConNombre` para que itere sobre `this.practicas` en lugar de `this.especialidades` y compare `prac.nombre`.

---

### Capa de Tareas Programadas (Crons)

#### [MODIFY] packages/backend/crons/cronTurnos.js
- Corregir el import de `TurnoService` a `../services/TurnoService.js` (respetando mayúsculas y named export).
- Reemplazar `turnoService.refrescarTurnos()` por el método existente `turnoService.refrescarTurnosBatch()`.
- Corregir el error de sintaxis en la exportación: cambiar `export default = iniciarTurnosCron;` por `export default iniciarTurnosCron;`.

---

### Capa de Repositorios y Servicios (Repositories & Services)

#### [MODIFY] packages/backend/repositories/TurnoRespository.js
- En `obtenerCombinados` (línea 125), corregir el acceso a la propiedad `turno.fechahora` por `turno.fechaHora` (camelCase).

#### [MODIFY] packages/backend/services/TurnoService.js
- En `solicitudCambioDeFecha` (líneas 241, 280, 284): corregir `turno.medico.usuario_id` por `turno.medico.usuario`. Cambiar la asignación `=` por comparación estricta `===` dentro del `some` y corregir el typo `practicaGene.ica_id` por `practicaGenerica._id`.
- En `refrescarTurnoCancelado` (líneas 452, 453): cambiar `disponibilidad.especialidad` y `disponibilidad.practica` (singular) por `disponibilidad.especialidades` y `disponibilidad.practicas` (plural).
- En `refrescarTurnosBatch` y `refrescarTurnosAnteriores` (líneas 557, 580): corregir `turnoCopia.medico._id` por `t.medico._id`.

---

### Capa de Controladores y Rutas (Controllers & Routes)

#### [MODIFY] packages/backend/controllers/TurnoController.js
- En `solicitudCambioDeFecha` y `responderCambioDeFecha`: corregir `const { turnoId: turnoId } = paramsIdSchema.parse(req.params)` por `const { id: turnoId } = paramsIdSchema.parse(req.params)`.
- En `consultarAgenda`: corregir la validación del parámetro de ruta `/medico/:medicoId` usando `const medicoId = objectIdSchema.parse(req.params.medicoId)`.

#### [MODIFY] packages/backend/routes/EspecialidadRouter.js
- Mover las rutas específicas `/genericas` y `/genericas/:id` antes de la ruta dinámica `/:id` para evitar colisiones en Express.

#### [MODIFY] packages/backend/routes/PracticaRouter.js
- Mover las rutas específicas `/genericas` y `/genericas/:id` antes de la ruta dinámica `/:id` para evitar colisiones en Express.

## Verification Plan

### Automated Tests
1. Ejecutar la suite completa de tests unitarios y de integración del backend:
   ```bash
   npm test --workspace=backend
   ```
2. Validar que la compilación y ejecución de la suite finalice correctamente sin errores de sintaxis, imports faltantes ni fallos de Zod.

### Manual Verification
1. Probar el arranque en modo dev para verificar que la aplicación de Express levante de manera estable junto con los crons:
   ```bash
   npm run dev:backend
   ```
