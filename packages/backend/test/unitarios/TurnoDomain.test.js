import { describe, expect, test } from '@jest/globals';

import { Turno } from '../../domain/Turno/Turno.js';
import { CambioEstadoTurno } from '../../domain/Turno/CambioEstadoTurno.js';
import { Agenda } from '../../domain/Turno/Agenda.js';
import { EstadoTurno } from '../../domain/Enumerados/EstadoTurno.js';
import { BadRequestError, UnprocessableEntityError } from '../../errors/AppErrors.js';

const createMedico = () => ({ _id: 'medico-1', nombre: 'Dr. House' , usuario: '1', matricula: "891823981239"});
const createSede = () => ({ _id: 'sede-1', nombre: 'Sede Central' , direccion:"Av avenida 123"});
const createUsuario = () => ({ _id: 'usuario-1', nombreUsuario: 'house', password: "contrasena123"});

const createTurno = ({
  medico = createMedico(),
  fechaHora = new Date('2026-06-01T10:00:00Z'),
  sede = createSede(),
  practica = null,
  especialidad = null,
  disponibilidad = { _id: 'disp-1', diaSemana: 1, horaDesde:"19:00", horaHasta: "23:00", sede:"1"}
} = {}) => new Turno({ medico, fechaHora, sede, practica, especialidad, disponibilidad });

describe('Turno domain', () => {
  test('constructor inicializa estado en DISPONIBLE y campos por defecto', () => {
    const turno = createTurno();

    expect(turno.estado).toBe(EstadoTurno.DISPONIBLE);
    expect(turno.paciente).toBeNull();
    expect(turno.costo).toBeNull();
    expect(turno.modificado).toBe(false);
    expect(turno.historialEstados).toEqual([]);
  });

  test('constructor lanza error si falta el medico', () => {
    expect(() =>
      new Turno({
        medico: null,
        fechaHora: new Date('2026-06-01T10:00:00Z'),
        sede: createSede()
      })
    ).toThrow();
  });

  test('constructor lanza error si la fechaHora no es Date ni number', () => {
    expect(() =>
      new Turno({
        medico: createMedico(),
        fechaHora: 'no-es-fecha',
        sede: createSede()
      })
    ).toThrow();
  });

  test('actualizarEstado agrega entrada al historial y cambia el estado', () => {
    const turno = createTurno();
    const usuario = createUsuario();

    turno.actualizarEstado(EstadoTurno.RESERVADO, usuario, 'reservado por paciente');

    expect(turno.estado).toBe(EstadoTurno.RESERVADO);
    expect(turno.historialEstados).toHaveLength(1);
    expect(turno.historialEstados[0]).toBeInstanceOf(CambioEstadoTurno);
    expect(turno.historialEstados[0].estado).toBe(EstadoTurno.DISPONIBLE);
    expect(turno.historialEstados[0].motivo).toBe('reservado por paciente');
  });

  test('actualizarEstado lanza BadRequestError si el turno ya está CANCELADO', () => {
    const turno = createTurno();
    const usuario = createUsuario();

    turno.actualizarEstado(EstadoTurno.CANCELADO, usuario, 'cancelado');

    expect(() =>
      turno.actualizarEstado(EstadoTurno.RESERVADO, usuario, 'otra vez')
    ).toThrow(BadRequestError);
  });

  test('actualizarEstado lanza BadRequestError si el turno ya está REALIZADO', () => {
    const turno = createTurno();
    const usuario = createUsuario();

    turno.actualizarEstado(EstadoTurno.RESERVADO, usuario, 'reservado');
    turno.actualizarEstado(EstadoTurno.REALIZADO, usuario, 'realizado');

    expect(() =>
      turno.actualizarEstado(EstadoTurno.CANCELADO, usuario, 'tarde')
    ).toThrow(BadRequestError);
  });

  test('ultimoHistorialEstado devuelve el último cambio registrado', () => {
    const turno = createTurno();
    const usuario = createUsuario();

    turno.actualizarEstado(EstadoTurno.RESERVADO, usuario, 'primer cambio');
    turno.actualizarEstado(EstadoTurno.CANCELADO, usuario, 'segundo cambio');

    expect(turno.ultimoHistorialEstado().motivo).toBe('segundo cambio');
  });

  test('sePuedeCancelar devuelve false si se intenta dentro del límite', () => {
    const fechaTurno = new Date('2026-06-01T10:00:00Z');
    const turno = createTurno({ fechaHora: fechaTurno });
    const ahora = new Date('2026-06-01T09:30:00Z'); // 30 min antes
    const resultado = turno.sePuedeCancelar(ahora, 1)
    expect(resultado).toBeFalsy();
  });

  test('sePuedeCancelar no lanza si está fuera del límite', () => {
    const fechaTurno = new Date('2026-06-01T10:00:00Z');
    const turno = createTurno({ fechaHora: fechaTurno });
    const ahora = new Date('2026-06-01T08:00:00Z'); // 2hs antes

    expect(() => turno.sePuedeCancelar(ahora, 1)).not.toThrow();
  });

  test('esTipoTurno retorna practica cuando hay practica asignada', () => {
    const turno = createTurno({ practica: { _id: 'prac-1', nombre: "practica1", codigo:"10012X2" , practicaGenerica: '65f1a9b8c3d2e10a4b5c6d82', costo: 700, duracionTurnoEnMins: 60 } });
    expect(turno.esTipoTurno()).toBe('practica');
  });

  test('esTipoTurno retorna especialidad cuando no hay practica', () => {
    const turno = createTurno({ especialidad: { _id: 'esp-1', nombre: "especialdiad1", especialidadGenerica: '65f1a9b8c3d2e10a4b5c6d81', costo: 700, duracionTurnoEnMins: 60} });
    expect(turno.esTipoTurno()).toBe('especialidad');
  });
});

describe('CambioEstadoTurno domain', () => {
  test('constructor registra estado, usuario, motivo y fechaHoraIngreso', () => {
    const turno = createTurno();
    const usuario = createUsuario();
    const antes = Date.now();

    const cambio = new CambioEstadoTurno({
      estado: EstadoTurno.DISPONIBLE,
      turno,
      usuario,
      motivo: 'creado'
    });

    expect(cambio.estado).toBe(EstadoTurno.DISPONIBLE);
    expect(cambio.usuario).toBe(usuario);
    expect(cambio.motivo).toBe('creado');
    expect(cambio.fechaHoraIngreso).toBeInstanceOf(Date);
    expect(cambio.fechaHoraIngreso.getTime()).toBeGreaterThanOrEqual(antes);
  });

  test('constructor aplica motivo por defecto si no se pasa', () => {
    const turno = createTurno();
    const usuario = createUsuario();

    const cambio = new CambioEstadoTurno({
      estado: EstadoTurno.RESERVADO,
      turno,
      usuario,
      motivo: undefined
    });

    expect(cambio.motivo).toBe('Sin motivo');
  });

  test('constructor lanza si el estado no pertenece al enum', () => {
    const turno = createTurno();
    const usuario = createUsuario();

    expect(() =>
      new CambioEstadoTurno({
        estado: 'INEXISTENTE',
        turno,
        usuario,
        motivo: 'x'
      })
    ).toThrow();
  });

  test('constructor lanza si falta el usuario', () => {
    const turno = createTurno();

    expect(() =>
      new CambioEstadoTurno({
        estado: EstadoTurno.DISPONIBLE,
        turno,
        usuario: null,
        motivo: 'x'
      })
    ).toThrow();
  });
});

describe('Agenda domain', () => {
  let agenda;

  beforeEach(() => {
    agenda = new Agenda();
  });

  describe('obtenerMasCercanoMenor', () => {
    test('retorna el mayor número menor o igual al solicitado', () => {
      expect(agenda.obtenerMasCercanoMenor(45, [15, 30, 60])).toBe(30);
      expect(agenda.obtenerMasCercanoMenor(60, [15, 30, 60])).toBe(60);
      expect(agenda.obtenerMasCercanoMenor(15, [15, 30, 60])).toBe(15);
    });

    test('lanza UnprocessableEntityError si no hay ninguno menor o igual', () => {
      expect(() => agenda.obtenerMasCercanoMenor(10, [15, 30, 60])).toThrow(UnprocessableEntityError);
    });
  });

  describe('obtenerMatrizEspecialidadPracticaDuracion', () => {
    test('agrupa especialidades y prácticas por duración acumulada', () => {
      const especialidades = [
        { _id: 'e15', duracionTurnoEnMins: 15 },
        { _id: 'e30', duracionTurnoEnMins: 30 }
      ];
      const practicas = [
        { _id: 'p60', duracionTurnoEnMins: 60 }
      ];

      const matriz = agenda.obtenerMatrizEspecialidadPracticaDuracion(
        especialidades,
        practicas,
        [15, 30, 60]
      );

      expect(matriz.get(15).especialidades).toHaveLength(1);
      expect(matriz.get(15).practicas).toHaveLength(0);

      expect(matriz.get(30).especialidades).toHaveLength(2);
      expect(matriz.get(30).practicas).toHaveLength(0);

      expect(matriz.get(60).especialidades).toHaveLength(2);
      expect(matriz.get(60).practicas).toHaveLength(1);
    });
  });

  describe('generarTurnos', () => {
    test('retorna lista vacía cuando el médico no tiene disponibilidades', () => {
      const medico = { _id: 'medico-1', disponibilidades: [] };
      const inicio = new Date('2026-06-01T00:00:00Z');
      const fin = new Date('2026-06-07T23:59:59Z');

      expect(agenda.generarTurnos(medico, inicio, fin)).toEqual([]);
    });

    test('retorna lista vacía cuando disponibilidades es undefined', () => {
      const medico = { _id: 'medico-1' };
      const inicio = new Date('2026-06-01T00:00:00Z');
      const fin = new Date('2026-06-07T23:59:59Z');

      expect(agenda.generarTurnos(medico, inicio, fin)).toEqual([]);
    });

    test('lanza BadRequestError si las fechas son inválidas', () => {
      const medico = { _id: 'medico-1', disponibilidades: [{ _id: 'd1' }] };
      const fechaInvalida = new Date('no-valida');
      const fechaValida = new Date('2026-06-07T23:59:59Z');

      expect(() => agenda.generarTurnos(medico, fechaInvalida, fechaValida)).toThrow(BadRequestError);
    });

    test('lanza RangeError si fecha inicial >= fecha final', () => {
      const medico = { _id: 'medico-1', disponibilidades: [{ _id: 'd1' }] };
      const fecha = new Date('2026-06-07T00:00:00Z');

      expect(() => agenda.generarTurnos(medico, fecha, fecha)).toThrow(RangeError);
    });
  });
});
