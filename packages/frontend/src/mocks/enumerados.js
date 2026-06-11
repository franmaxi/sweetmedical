// Espejo de packages/backend/domain/Enumerados/*

export const DiaSemana = Object.freeze({
  LUNES: 0,
  MARTES: 1,
  MIERCOLES: 2,
  JUEVES: 3,
  VIERNES: 4,
  SABADO: 5,
  DOMINGO: 6,
});

export const EstadoTurno = Object.freeze({
  DISPONIBLE: 0,
  RESERVADO: 1,
  CONFIRMADO: 2,
  CANCELADO: 3,
  REALIZADO: 4,
  RECHAZADO:5,
});

export const NivelCobertura = Object.freeze({
  TOTAL: 0,
  PARCIAL: 1,
  NO_CUBIERTA: 2,
});


// Funciones para convertir valores numéricos a sus nombres legibles (hacen el camino inverso)
export const nombreDia = (valor) =>
  Object.entries(DiaSemana).find(([, v]) => v === valor)?.[0] ?? "DESCONOCIDO";

export const nombreEstado = (valor) =>
  Object.entries(EstadoTurno).find(([, v]) => v === valor)?.[0] ?? "DESCONOCIDO";
