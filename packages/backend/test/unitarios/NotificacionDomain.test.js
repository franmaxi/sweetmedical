import { describe, expect, test, beforeEach } from '@jest/globals';

import { Notificacion } from '../../domain/Notificacion/Notificacion.js';
import { FactoryNotificacion } from '../../domain/Notificacion/FactoryNotificacion.js';
import { EstadoTurno } from '../../domain/Enumerados/EstadoTurno.js';

describe('Notificacion domain', () => {
  test('constructor inicializa con leida=false y sin fechaHoraLeida', () => {
    const antes = Date.now();

    const noti = new Notificacion({
      destinatario: { _id: 'usr-1' },
      remitente: null,
      mensaje: 'Hola'
    });

    expect(noti.destinatario).toEqual({ _id: 'usr-1' });
    expect(noti.remitente).toBeNull();
    expect(noti.mensaje).toBe('Hola');
    expect(noti.leida).toBe(false);
    expect(noti.fechaHoraLeida).toBeNull();
    expect(typeof noti.fechaHoraCreacion).toBe('number');
    expect(noti.fechaHoraCreacion).toBeGreaterThanOrEqual(antes);
  });

  test('constructor lanza si el mensaje está vacío', () => {
    expect(() =>
      new Notificacion({
        destinatario: { _id: 'usr-1' },
        remitente: null,
        mensaje: '   '
      })
    ).toThrow();
  });

  test('marcarComoLeida actualiza leida y fechaHoraLeida', () => {
    const noti = new Notificacion({
      destinatario: { _id: 'usr-1' },
      remitente: null,
      mensaje: 'Hola'
    });

    const antes = Date.now();
    noti.marcarComoLeida();

    expect(noti.leida).toBe(true);
    expect(noti.fechaHoraLeida).toBeGreaterThanOrEqual(antes);
  });
});

const idMongoLike = (id) => ({
  toString: () => id,
  equals: (other) => (other?.toString?.() ?? other) === id
});

describe('FactoryNotificacion', () => {
  let factory;

  beforeEach(() => {
    factory = new FactoryNotificacion();
  });

  test('devuelve undefined para estados no manejados', () => {
    const turno = { estado: EstadoTurno.DISPONIBLE };
    expect(factory.crearSegunEstadoTurno(turno)).toBeUndefined();
  });

  test('para estado RESERVADO genera notificación al médico', () => {
    const turno = {
      estado: EstadoTurno.RESERVADO,
      fechaHora: new Date('2026-06-01T10:00:00Z'),
      medico: { nombre: 'Dr. House', usuario: { _id: 'usr-medico', idioma: 'es' } },
      paciente: { nombre: 'Juan' }
    };

    const noti = factory.crearSegunEstadoTurno(turno);

    expect(noti).toBeInstanceOf(Notificacion);
    expect(noti.destinatario).toBe(turno.medico.usuario);
    expect(noti.mensaje).toContain('Dr. House');
    expect(noti.mensaje).toContain('Juan');
  });

  test('para estado CANCELADO usa el contrario al que generó el cambio', () => {
    const pacienteUsuarioId = idMongoLike('usr-paciente');
    const medicoUsuario = { _id: 'usr-medico', idioma: 'es' };
    const paciente = {
      nombreUsuario: 'juan',
      nombre: 'Juan',
      usuario: { _id: pacienteUsuarioId, idioma: 'es' }
    };
    const medico = { nombre: 'Dr. House', nombreUsuario: 'house', usuario: medicoUsuario };

    const turno = {
      estado: EstadoTurno.CANCELADO,
      fechaHora: new Date('2026-06-01T10:00:00Z'),
      medico,
      paciente,
      // el último cambio lo hizo el paciente -> notificar al médico
      ultimoHistorialEstado: () => ({
        usuario: { _id: pacienteUsuarioId },
        motivo: 'No puedo asistir'
      })
    };

    const noti = factory.crearSegunEstadoTurno(turno);

    expect(noti).toBeInstanceOf(Notificacion);
    expect(noti.destinatario).toBe(medicoUsuario);
    expect(noti.mensaje).toContain('No puedo asistir');
  });

  test('obtenerContrario devuelve paciente si el cambio lo hizo el médico', () => {
    const medicoUsuarioId = idMongoLike('usr-medico');
    const pacienteUsuarioId = idMongoLike('usr-paciente');
    const turno = {
      medico: { usuario: { _id: medicoUsuarioId } },
      paciente: { usuario: { _id: pacienteUsuarioId } },
      ultimoHistorialEstado: () => ({ usuario: { _id: medicoUsuarioId } })
    };

    expect(factory.obtenerContrario(turno)).toBe(turno.paciente);
  });
});
