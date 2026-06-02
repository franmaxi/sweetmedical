// Mock de GET /obras-sociales
// Modelo backend: packages/backend/domain/Paciente/ObraSocial.js
// Campos: { id, nombre, planes: number[] (ids) }

import { ok } from "./_helpers.js";

export const obrasSocialesMock = [
  { id: 1, nombre: "OSDE",          planes: [1, 2, 3] },
  { id: 2, nombre: "Swiss Medical", planes: [4, 5] },
  { id: 3, nombre: "Galeno",        planes: [6, 7] },
  { id: 4, nombre: "Medicus",       planes: [8, 9] },
  { id: 5, nombre: "OMINT",         planes: [10] },
  { id: 6, nombre: "Particular",    planes: [] },
];

export const getObrasSociales = () => ok(obrasSocialesMock);
