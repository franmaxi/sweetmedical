// Mock de GET /turnos, GET /turnos/:id, POST /turnos, PATCH /turnos/:id/estado, etc.
// Modelo backend: packages/backend/domain/Turno/Turno.js + CambioEstadoTurno.js
//
// Campos por turno:
//   { id, medicoId, pacienteId, fechaHora (ISO string),
//     sedeId, practicaId, especialidadId, estado, costo, historialEstados[] }
//
// `pacienteId` puede ser null cuando el turno aún está DISPONIBLE.
// `historialEstados` se carga al cambiar de estado.

import { ok, delay } from "./_helpers.js";
import { EstadoTurno } from "./enumerados.js";
import { especialidadesMock } from "./especialidades.js";

export const turnosMock = [
  // Disponibles (sin paciente todavía). Fechas futuras respecto a 2026-06-05.
  // Incluyo médicos con prácticas variadas para que el modal de reserva
  // muestre varias opciones de precio (Consulta + Práctica).

  // Dra. Rebecca Rose (5) — Ginecología + Papanicolaou
  { id: 1, medicoId: 5, pacienteId: null, fechaHora: "2026-06-08T09:00:00", sedeId: 1, practicaId: null, especialidadId: 105, estado: EstadoTurno.DISPONIBLE, costo: 11500, historialEstados: [] },
  { id: 2, medicoId: 5, pacienteId: null, fechaHora: "2026-06-08T09:30:00", sedeId: 1, practicaId: null, especialidadId: 105, estado: EstadoTurno.DISPONIBLE, costo: 11500, historialEstados: [] },

  // Dr. Martín Ríos (9) — Cardiología + ECG
  { id: 3, medicoId: 9, pacienteId: null, fechaHora: "2026-06-09T08:00:00", sedeId: 1, practicaId: null, especialidadId: 109, estado: EstadoTurno.DISPONIBLE, costo: 12000, historialEstados: [] },
  { id: 4, medicoId: 9, pacienteId: null, fechaHora: "2026-06-09T08:30:00", sedeId: 1, practicaId: null, especialidadId: 109, estado: EstadoTurno.DISPONIBLE, costo: 12000, historialEstados: [] },

  // Dra. Carolina Méndez (10) — Pediatría (sin prácticas)
  { id: 5, medicoId: 10, pacienteId: null, fechaHora: "2026-06-09T09:00:00", sedeId: 4, practicaId: null, especialidadId: 110, estado: EstadoTurno.DISPONIBLE, costo: 9800, historialEstados: [] },

  // Dra. Alexandra Pérez (2) — Gastroenterología + Ecografía + Endoscopía
  { id: 12, medicoId: 2, pacienteId: null, fechaHora: "2026-06-10T08:00:00", sedeId: 2, practicaId: null, especialidadId: 102, estado: EstadoTurno.DISPONIBLE, costo: 13000, historialEstados: [] },
  { id: 13, medicoId: 2, pacienteId: null, fechaHora: "2026-06-10T08:30:00", sedeId: 2, practicaId: null, especialidadId: 102, estado: EstadoTurno.DISPONIBLE, costo: 13000, historialEstados: [] },

  // Dr. Tomás Carol (4) — Obstetricia + Radiografía
  { id: 14, medicoId: 4, pacienteId: null, fechaHora: "2026-06-10T09:00:00", sedeId: 1, practicaId: null, especialidadId: 104, estado: EstadoTurno.DISPONIBLE, costo: 12500, historialEstados: [] },

  // Dra. Penélope Cruz (7) — Fisioterapia + Sesión de kinesiología
  { id: 15, medicoId: 7, pacienteId: null, fechaHora: "2026-06-11T14:00:00", sedeId: 3, practicaId: null, especialidadId: 107, estado: EstadoTurno.DISPONIBLE, costo: 8000, historialEstados: [] },
  { id: 16, medicoId: 7, pacienteId: null, fechaHora: "2026-06-11T15:00:00", sedeId: 3, practicaId: null, especialidadId: 107, estado: EstadoTurno.DISPONIBLE, costo: 8000, historialEstados: [] },

  // Dra. Jessica Joan (1) — Nefrología + Análisis de laboratorio
  { id: 17, medicoId: 1, pacienteId: null, fechaHora: "2026-06-12T09:00:00", sedeId: 1, practicaId: null, especialidadId: 101, estado: EstadoTurno.DISPONIBLE, costo: 12000, historialEstados: [] },

  // Dra. Stephanie Sue (6) — Hematología + Lab
  { id: 18, medicoId: 6, pacienteId: null, fechaHora: "2026-06-12T13:00:00", sedeId: 2, practicaId: null, especialidadId: 106, estado: EstadoTurno.DISPONIBLE, costo: 13500, historialEstados: [] },

  // Reservados / confirmados (turnos futuros con paciente)
  { id: 6,  medicoId: 1, pacienteId: 1, fechaHora: "2026-06-15T09:00:00", sedeId: 1, practicaId: null, especialidadId: 101, estado: EstadoTurno.RESERVADO,  costo: 12000, historialEstados: [
      { estadoAnterior: EstadoTurno.DISPONIBLE, fechaHora: "2026-05-30T12:00:00", usuarioId: 201, motivo: "Reserva online" },
    ] },
  { id: 7,  medicoId: 2, pacienteId: 2, fechaHora: "2026-06-16T08:30:00", sedeId: 2, practicaId: 2,    especialidadId: 102, estado: EstadoTurno.CONFIRMADO, costo: 14000, historialEstados: [
      { estadoAnterior: EstadoTurno.DISPONIBLE, fechaHora: "2026-05-28T18:10:00", usuarioId: 202, motivo: "Reserva online" },
      { estadoAnterior: EstadoTurno.RESERVADO,  fechaHora: "2026-05-30T10:00:00", usuarioId: 102, motivo: "Confirmado por el médico" },
    ] },
  { id: 8,  medicoId: 3, pacienteId: 3, fechaHora: "2026-06-17T11:00:00", sedeId: 3, practicaId: null, especialidadId: 103, estado: EstadoTurno.RESERVADO,  costo: 15000, historialEstados: [
      { estadoAnterior: EstadoTurno.DISPONIBLE, fechaHora: "2026-05-29T15:30:00", usuarioId: 203, motivo: "Reserva online" },
    ] },
  { id: 9,  medicoId: 4, pacienteId: 4, fechaHora: "2026-06-18T09:30:00", sedeId: 1, practicaId: null, especialidadId: 104, estado: EstadoTurno.CONFIRMADO, costo: 12500, historialEstados: [
      { estadoAnterior: EstadoTurno.DISPONIBLE, fechaHora: "2026-05-27T09:00:00", usuarioId: 204, motivo: "Reserva online" },
      { estadoAnterior: EstadoTurno.RESERVADO,  fechaHora: "2026-05-28T16:00:00", usuarioId: 104, motivo: "Confirmado" },
    ] },

  // Turnos del médico activo de la demo (Rebecca Rose, id 5) para que su
  // agenda médica tenga turnos por confirmar / por realizar.
  { id: 19, medicoId: 5, pacienteId: 1, fechaHora: "2026-06-19T08:00:00", sedeId: 1, practicaId: null, especialidadId: 105, estado: EstadoTurno.RESERVADO,  costo: 11500, historialEstados: [
      { estadoAnterior: EstadoTurno.DISPONIBLE, fechaHora: "2026-06-01T10:00:00", usuarioId: 201, motivo: "Reserva online" },
    ] },
  { id: 20, medicoId: 5, pacienteId: 4, fechaHora: "2026-06-20T08:30:00", sedeId: 1, practicaId: null, especialidadId: 105, estado: EstadoTurno.CONFIRMADO, costo: 11500, historialEstados: [
      { estadoAnterior: EstadoTurno.DISPONIBLE, fechaHora: "2026-05-25T11:00:00", usuarioId: 204, motivo: "Reserva online" },
      { estadoAnterior: EstadoTurno.RESERVADO,  fechaHora: "2026-05-26T09:00:00", usuarioId: 105, motivo: "Confirmado" },
    ] },

  // Cancelado y realizado
  { id: 10, medicoId: 6,  pacienteId: 1, fechaHora: "2026-05-20T13:00:00", sedeId: 2, practicaId: null, especialidadId: 106, estado: EstadoTurno.CANCELADO, costo: 13500, historialEstados: [
      { estadoAnterior: EstadoTurno.DISPONIBLE, fechaHora: "2026-05-10T12:00:00", usuarioId: 201, motivo: "Reserva online" },
      { estadoAnterior: EstadoTurno.RESERVADO,  fechaHora: "2026-05-19T10:00:00", usuarioId: 201, motivo: "El paciente canceló por agenda" },
    ] },
  { id: 11, medicoId: 7,  pacienteId: 3, fechaHora: "2026-05-15T14:00:00", sedeId: 3, practicaId: 8,    especialidadId: 107, estado: EstadoTurno.REALIZADO, costo:  8000, historialEstados: [
      { estadoAnterior: EstadoTurno.DISPONIBLE, fechaHora: "2026-05-01T08:00:00", usuarioId: 203, motivo: "Reserva online" },
      { estadoAnterior: EstadoTurno.RESERVADO,  fechaHora: "2026-05-10T09:00:00", usuarioId: 107, motivo: "Confirmado" },
      { estadoAnterior: EstadoTurno.CONFIRMADO, fechaHora: "2026-05-15T15:00:00", usuarioId: 107, motivo: "Atención finalizada" },
    ] },
];

// GET /turnos — soporta los filtros típicos de la pantalla "Buscar turnos".
export const getTurnos = ({
  medicoId,
  pacienteId,
  sedeId,
  especialidadId,
  especialidadGenericaId,
  estado,
  fechaDesde,
  fechaHasta,
} = {}) => {
  let lista = turnosMock;
  if (medicoId != null)       lista = lista.filter((t) => t.medicoId === Number(medicoId));
  if (pacienteId != null)     lista = lista.filter((t) => t.pacienteId === Number(pacienteId));
  if (sedeId != null)         lista = lista.filter((t) => t.sedeId === Number(sedeId));
  if (especialidadId != null) lista = lista.filter((t) => t.especialidadId === Number(especialidadId));
  if (especialidadGenericaId != null) {
    const idsPersonalizadas = especialidadesMock
      .filter((e) => e.especialidadGenericaId === Number(especialidadGenericaId))
      .map((e) => e.id);
    lista = lista.filter((t) => idsPersonalizadas.includes(t.especialidadId));
  }
  if (estado != null)         lista = lista.filter((t) => t.estado === Number(estado));
  if (fechaDesde)             lista = lista.filter((t) => t.fechaHora >= fechaDesde);
  if (fechaHasta)             lista = lista.filter((t) => t.fechaHora <= fechaHasta);
  return ok(lista);
};

export const getTurnosDisponibles = (filtros = {}) =>
  getTurnos({ ...filtros, estado: EstadoTurno.DISPONIBLE });

// POST /turnos/:id/reservar — un turno disponible pasa a RESERVADO.
export const reservarTurno = async (id, { pacienteId, usuarioId }) => {
  await delay();
  const turno = turnosMock.find((t) => t.id === Number(id));
  turno.historialEstados.push({
    estadoAnterior: turno.estado,
    fechaHora: new Date().toISOString(),
    usuarioId,
    motivo: "Reserva online",
  });
  turno.pacienteId = pacienteId;
  turno.estado = EstadoTurno.RESERVADO;
  return ok(turno);
};

// PATCH /turnos/:id/estado — transición genérica con motivo.
const cambiarEstadoTurno = async (id, { nuevoEstado, usuarioId, motivo }) => {
  await delay();
  const turno = turnosMock.find((t) => t.id === Number(id));
  turno.historialEstados.push({
    estadoAnterior: turno.estado,
    fechaHora: new Date().toISOString(),
    usuarioId,
    motivo,
  });
  turno.estado = nuevoEstado;
  return ok(turno);
};

export const cancelarTurno = (id, { usuarioId, motivo }) =>
  cambiarEstadoTurno(id, { nuevoEstado: EstadoTurno.CANCELADO, usuarioId, motivo });

export const confirmarTurno = (id, { usuarioId }) =>
  cambiarEstadoTurno(id, { nuevoEstado: EstadoTurno.CONFIRMADO, usuarioId, motivo: "Confirmado" });

export const marcarRealizado = (id, { usuarioId }) =>
  cambiarEstadoTurno(id, { nuevoEstado: EstadoTurno.REALIZADO, usuarioId, motivo: "Atención finalizada" });
