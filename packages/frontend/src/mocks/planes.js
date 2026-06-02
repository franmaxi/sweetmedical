// Mock de GET /planes, GET /planes/:id, GET /planes/:id/coberturas
// Modelo backend: packages/backend/domain/Plan/Plan.js
// Cada plan tiene coberturas por especialidad (genérica) y por práctica,
// referenciadas por id + NivelCobertura.
//
// Forma de la respuesta:
//   { id, obraSocialId, nombre,
//     coberturaEspecialidad: [ { especialidadGenericaId, nivel } ],
//     coberturaPractica:     [ { practicaId, nivel } ] }

import { ok } from "./_helpers.js";
import { NivelCobertura } from "./enumerados.js";

export const planesMock = [
  {
    id: 1, obraSocialId: 1, nombre: "OSDE 210",
    coberturaEspecialidad: [
      { especialidadGenericaId: 1,  nivel: NivelCobertura.TOTAL },
      { especialidadGenericaId: 2,  nivel: NivelCobertura.TOTAL },
      { especialidadGenericaId: 6,  nivel: NivelCobertura.TOTAL },
      { especialidadGenericaId: 12, nivel: NivelCobertura.PARCIAL },
    ],
    coberturaPractica: [
      { practicaId: 1, nivel: NivelCobertura.TOTAL },
      { practicaId: 2, nivel: NivelCobertura.PARCIAL },
    ],
  },
  {
    id: 2, obraSocialId: 1, nombre: "OSDE 310",
    coberturaEspecialidad: [
      { especialidadGenericaId: 1,  nivel: NivelCobertura.TOTAL },
      { especialidadGenericaId: 2,  nivel: NivelCobertura.TOTAL },
      { especialidadGenericaId: 12, nivel: NivelCobertura.TOTAL },
    ],
    coberturaPractica: [
      { practicaId: 1,  nivel: NivelCobertura.TOTAL },
      { practicaId: 10, nivel: NivelCobertura.TOTAL },
    ],
  },
  {
    id: 3, obraSocialId: 1, nombre: "OSDE 410",
    coberturaEspecialidad: [
      { especialidadGenericaId: 1,  nivel: NivelCobertura.TOTAL },
      { especialidadGenericaId: 10, nivel: NivelCobertura.TOTAL },
      { especialidadGenericaId: 12, nivel: NivelCobertura.TOTAL },
    ],
    coberturaPractica: [
      { practicaId: 1,  nivel: NivelCobertura.TOTAL },
      { practicaId: 2,  nivel: NivelCobertura.TOTAL },
      { practicaId: 10, nivel: NivelCobertura.TOTAL },
    ],
  },
  {
    id: 4, obraSocialId: 2, nombre: "Swiss Medical SMG02",
    coberturaEspecialidad: [
      { especialidadGenericaId: 1, nivel: NivelCobertura.TOTAL },
      { especialidadGenericaId: 6, nivel: NivelCobertura.TOTAL },
      { especialidadGenericaId: 8, nivel: NivelCobertura.TOTAL },
    ],
    coberturaPractica: [
      { practicaId: 5, nivel: NivelCobertura.TOTAL },
    ],
  },
  {
    id: 5, obraSocialId: 2, nombre: "Swiss Medical SMG30",
    coberturaEspecialidad: [
      { especialidadGenericaId: 1,  nivel: NivelCobertura.TOTAL },
      { especialidadGenericaId: 12, nivel: NivelCobertura.PARCIAL },
      { especialidadGenericaId: 14, nivel: NivelCobertura.PARCIAL },
    ],
    coberturaPractica: [
      { practicaId: 5, nivel: NivelCobertura.TOTAL },
      { practicaId: 8, nivel: NivelCobertura.PARCIAL },
    ],
  },
  {
    id: 6, obraSocialId: 3, nombre: "Galeno Azul",
    coberturaEspecialidad: [
      { especialidadGenericaId: 1, nivel: NivelCobertura.TOTAL },
      { especialidadGenericaId: 2, nivel: NivelCobertura.TOTAL },
    ],
    coberturaPractica: [
      { practicaId: 1, nivel: NivelCobertura.TOTAL },
    ],
  },
  {
    id: 7, obraSocialId: 3, nombre: "Galeno Plata",
    coberturaEspecialidad: [
      { especialidadGenericaId: 1, nivel: NivelCobertura.TOTAL },
      { especialidadGenericaId: 6, nivel: NivelCobertura.TOTAL },
      { especialidadGenericaId: 9, nivel: NivelCobertura.PARCIAL },
    ],
    coberturaPractica: [
      { practicaId: 9, nivel: NivelCobertura.PARCIAL },
    ],
  },
  {
    id: 8, obraSocialId: 4, nombre: "Medicus Azul",
    coberturaEspecialidad: [
      { especialidadGenericaId: 1, nivel: NivelCobertura.TOTAL },
      { especialidadGenericaId: 6, nivel: NivelCobertura.TOTAL },
    ],
    coberturaPractica: [],
  },
  {
    id: 9, obraSocialId: 4, nombre: "Medicus Integra",
    coberturaEspecialidad: [
      { especialidadGenericaId: 1,  nivel: NivelCobertura.TOTAL },
      { especialidadGenericaId: 11, nivel: NivelCobertura.TOTAL },
      { especialidadGenericaId: 14, nivel: NivelCobertura.PARCIAL },
    ],
    coberturaPractica: [
      { practicaId: 2, nivel: NivelCobertura.PARCIAL },
    ],
  },
  {
    id: 10, obraSocialId: 5, nombre: "OMINT Classic",
    coberturaEspecialidad: [
      { especialidadGenericaId: 1, nivel: NivelCobertura.TOTAL },
      { especialidadGenericaId: 8, nivel: NivelCobertura.TOTAL },
    ],
    coberturaPractica: [],
  },
];

export const getPlanes = ({ obraSocialId } = {}) => {
  let lista = planesMock;
  if (obraSocialId != null) {
    lista = lista.filter((p) => p.obraSocialId === Number(obraSocialId));
  }
  return ok(lista);
};
