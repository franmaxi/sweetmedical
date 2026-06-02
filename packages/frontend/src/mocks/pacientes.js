// Mock de GET /pacientes y POST /pacientes.
// Modelo backend: packages/backend/domain/Paciente/Paciente.js
// Campos: { id, usuarioId, dni, nombre, obraSocialId, planId }

import { ok, nextId } from "./_helpers.js";

export const pacientesMock = [
  { id: 1, usuarioId: 201, dni: "30123456", nombre: "Ana García",     obraSocialId: 1, planId: 2 },
  { id: 2, usuarioId: 202, dni: "28456789", nombre: "Luis Fernández", obraSocialId: 2, planId: 4 },
  { id: 3, usuarioId: 203, dni: "35987654", nombre: "María López",    obraSocialId: 3, planId: 6 },
  { id: 4, usuarioId: 204, dni: "32145678", nombre: "John Smith",     obraSocialId: 1, planId: 3 },
  { id: 5, usuarioId: null, dni: "40555111", nombre: "Carlos Ramírez", obraSocialId: 6, planId: null },
];

export const getPacientes = () => ok(pacientesMock);

export const crearPaciente = (data) => {
  const nuevo = { id: nextId(pacientesMock), ...data };
  pacientesMock.push(nuevo);
  return ok(nuevo);
};
