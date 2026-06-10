// Mock de GET /especialidades — especialidad PERSONALIZADA de cada médico.
// Refleja Especialidad.js del dominio: nombre + duración + costo, pero el
// "nombre" canónico se toma de una EspecialidadGenerica (catálogo).
// Cada Medico tiene UNA especialidad personalizada (especialidadId).
// Campos: { id, especialidadGenericaId, nombre, duracionTurnoEnMins, costoConsulta }
//
// El `nombre` se incluye desnormalizado para que el front pueda renderizar
// sin tener que joinear con el catálogo en cada llamada (igual que haría
// un endpoint pensado para listados).

import { ok } from "./_helpers.js";

export const especialidadesMock = [
  { id: 101, especialidadGenericaId: 16, nombre: "Nefrología",         duracionTurnoEnMins: 30, costoConsulta: 12000 },
  { id: 102, especialidadGenericaId: 15, nombre: "Gastroenterología",  duracionTurnoEnMins: 30, costoConsulta: 13000 },
  { id: 103, especialidadGenericaId: 10, nombre: "Neurología",         duracionTurnoEnMins: 40, costoConsulta: 15000 },
  { id: 104, especialidadGenericaId: 11, nombre: "Obstetricia",        duracionTurnoEnMins: 30, costoConsulta: 12500 },
  { id: 105, especialidadGenericaId:  2, nombre: "Ginecología",        duracionTurnoEnMins: 30, costoConsulta: 11500 },
  { id: 106, especialidadGenericaId: 13, nombre: "Hematología",        duracionTurnoEnMins: 30, costoConsulta: 13500 },
  { id: 107, especialidadGenericaId: 14, nombre: "Fisioterapia",       duracionTurnoEnMins: 45, costoConsulta:  8000 },
  { id: 108, especialidadGenericaId: 12, nombre: "Oncología",          duracionTurnoEnMins: 45, costoConsulta: 16000 },
  { id: 109, especialidadGenericaId:  1, nombre: "Cardiología",        duracionTurnoEnMins: 30, costoConsulta: 12000 },
  { id: 110, especialidadGenericaId:  6, nombre: "Pediatría",          duracionTurnoEnMins: 30, costoConsulta:  9800 },
];

export const getEspecialidades = ({ especialidadGenericaId } = {}) => {
  let lista = especialidadesMock;
  if (especialidadGenericaId != null) {
    lista = lista.filter(
      (e) => e.especialidadGenericaId === Number(especialidadGenericaId),
    );
  }
  return ok(lista);
};
