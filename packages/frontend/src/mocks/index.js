// Punto de entrada único de los mocks que simulan los endpoints del backend.
// Los nombres de los archivos siguen la convención del dominio
// (packages/backend/domain/*) y exponen tanto los datos crudos como
// funciones async que imitan las respuestas que tendría una API REST.

export * from "./enumerados.js";

export * from "./especialidadesGenericas.js";
export * from "./especialidades.js";
export * from "./practicas.js";
export * from "./sedes.js";

export * from "./medicos.js";

export * from "./obrasSociales.js";
export * from "./planes.js";

export * from "./pacientes.js";

export * from "./turnos.js";
export * from "./notificaciones.js";
