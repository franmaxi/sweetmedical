// Mock de GET /notificaciones y PATCH /notificaciones/:id/leida.
// Modelo backend: packages/backend/domain/Notificacion/Notificacion.js
// Campos: { id, destinatarioId, remitenteId, mensaje, fechaHoraCreacion,
//           leida, fechaHoraLeida }

import { ok, delay } from "./_helpers.js";

export const notificacionesMock = [
  {
    id: 1, destinatarioId: 201, remitenteId: null,
    mensaje: "Hola Ana, te confirmamos tu turno con Dra. Jessica Joan el 03/06 a las 09:00.",
    fechaHoraCreacion: "2026-05-30T12:00:05",
    leida: true,  fechaHoraLeida: "2026-05-30T12:30:00",
  },
  {
    id: 2, destinatarioId: 202, remitenteId: null,
    mensaje: "Hola Luis, tu turno con Dra. Alexandra Pérez fue confirmado.",
    fechaHoraCreacion: "2026-05-30T10:00:01",
    leida: false, fechaHoraLeida: null,
  },
  {
    id: 3, destinatarioId: 102, remitenteId: null,
    mensaje: "Tenés una nueva reserva: Luis Fernández, 04/06 08:30 hs.",
    fechaHoraCreacion: "2026-05-28T18:10:02",
    leida: true,  fechaHoraLeida: "2026-05-28T18:15:00",
  },
  {
    id: 4, destinatarioId: 203, remitenteId: null,
    mensaje: "Recordatorio: tenés turno mañana 05/06 11:00 con Dra. Kimberly López.",
    fechaHoraCreacion: "2026-06-04T08:00:00",
    leida: false, fechaHoraLeida: null,
  },
  {
    id: 5, destinatarioId: 201, remitenteId: null,
    mensaje: "Tu turno del 20/05 con Dra. Stephanie Sue fue cancelado. Motivo: agenda del paciente.",
    fechaHoraCreacion: "2026-05-19T10:00:30",
    leida: true,  fechaHoraLeida: "2026-05-19T10:05:00",
  },
];

export const getNotificaciones = ({ destinatarioId } = {}) => {
  let lista = notificacionesMock;
  if (destinatarioId != null) {
    lista = lista.filter((n) => n.destinatarioId === Number(destinatarioId));
  }
  // Más recientes primero.
  return ok([...lista].sort((a, b) => b.fechaHoraCreacion.localeCompare(a.fechaHoraCreacion)));
};

export const marcarComoLeida = async (id) => {
  await delay();
  const n = notificacionesMock.find((x) => x.id === Number(id));
  n.leida = true;
  n.fechaHoraLeida = new Date().toISOString();
  return ok(n);
};

export const marcarTodasComoLeidas = async (destinatarioId) => {
  await delay();
  const ahora = new Date().toISOString();
  notificacionesMock
    .filter((n) => n.destinatarioId === Number(destinatarioId) && !n.leida)
    .forEach((n) => { n.leida = true; n.fechaHoraLeida = ahora; });
  return getNotificaciones({ destinatarioId });
};
