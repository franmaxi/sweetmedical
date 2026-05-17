import { describe, expect, test } from '@jest/globals';

import { Medico } from '../../domain/Medico/Medico.js';
import { DisponibilidadHoraria } from '../../domain/Medico/DisponibilidadHoraria.js';
import { Especialidad } from '../../domain/Medico/Servicios/Especialidad.js';
import { Practica } from '../../domain/Medico/Servicios/Practica.js';
import { BadRequestError, ConflictError, NotFoundError } from '../../errors/AppErrors.js';

const createMedico = () => new Medico({ usuario: 'user-1', matricula: 'M-123', nombre: 'Dr. House' });

const createSede = () => ({ _id: 'sede-1', nombre: 'Sede Central' });

const createEspecialidad = () => {
  const especialidad = new Especialidad({
    especialidadGenerica: 'esp-gen-1',
    nombre: 'Cardiología',
    duracionTurnoEnMins: 30,
    costo: 1200
  });
  especialidad._id = 'esp-1';
  return especialidad;
};

const createPractica = () => {
  const practica = new Practica({
    practicaGenerica: 'prac-gen-1',
    codigo: 'RX-01',
    nombre: 'Radiografía',
    duracionTurnoEnMins: 60,
    costo: 5000
  });
  practica._id = 'prac-1';
  return practica;
};

describe('Medico domain', () => {
  test('constructor crea medico con datos validos', () => {
    const medico = createMedico();

    expect(medico.usuario).toBe('user-1');
    expect(medico.matricula).toBe('M-123');
    expect(medico.nombre).toBe('Dr. House');
    expect(medico.especialidades).toEqual([]);
    expect(medico.practicas).toEqual([]);
    expect(medico.sedes).toEqual([]);
    expect(medico.disponibilidades).toEqual([]);
    expect(medico.eliminado).toBe(false);
  });

  test('definirDisponibilidad agrega disponibilidad valida', () => {
    const medico = createMedico();
    const sede = createSede();
    const especialidad = createEspecialidad();
    const practica = createPractica();

    medico.sedes.push(sede);
    medico.especialidades.push(especialidad);
    medico.practicas.push(practica);

    const disponibilidad = new DisponibilidadHoraria({
      diaSemana: 1,
      horaDesde: '10:00',
      horaHasta: '11:00',
      sede
    });
    disponibilidad.especialidades.push(especialidad);
    disponibilidad.practicas.push(practica);
    disponibilidad._id = 'disp-1';

    medico.definirDisponibilidad(disponibilidad);

    expect(medico.disponibilidades).toHaveLength(1);
    expect(medico.disponibilidades[0]).toBe(disponibilidad);
  });

  test('definirDisponibilidad lanza ConflictError cuando hay solapamiento', () => {
    const medico = createMedico();
    const sede = createSede();
    const especialidad = createEspecialidad();
    const practica = createPractica();

    medico.sedes.push(sede);
    medico.especialidades.push(especialidad);
    medico.practicas.push(practica);

    const primeraDisponibilidad = new DisponibilidadHoraria({
      diaSemana: 1,
      horaDesde: '10:00',
      horaHasta: '11:00',
      sede
    });
    primeraDisponibilidad.especialidades.push(especialidad);
    primeraDisponibilidad.practicas.push(practica);
    primeraDisponibilidad._id = 'disp-1';

    const segundaDisponibilidad = new DisponibilidadHoraria({
      diaSemana: 1,
      horaDesde: '10:30',
      horaHasta: '11:30',
      sede
    });
    segundaDisponibilidad.especialidades.push(especialidad);
    segundaDisponibilidad.practicas.push(practica);
    segundaDisponibilidad._id = 'disp-2';

    medico.definirDisponibilidad(primeraDisponibilidad);

    expect(() => medico.definirDisponibilidad(segundaDisponibilidad)).toThrow(ConflictError);
  });

  test('definirDisponibilidad lanza BadRequestError si la sede no pertenece', () => {
    const medico = createMedico();
    const sede = createSede();
    const otraSede = { _id: 'sede-2', nombre: 'Otra Sede' };
    const especialidad = createEspecialidad();
    const practica = createPractica();

    medico.sedes.push(sede);
    medico.especialidades.push(especialidad);
    medico.practicas.push(practica);

    const disponibilidad = new DisponibilidadHoraria({
      diaSemana: 2,
      horaDesde: '14:00',
      horaHasta: '15:00',
      sede: otraSede
    });
    disponibilidad.especialidades.push(especialidad);
    disponibilidad.practicas.push(practica);
    disponibilidad._id = 'disp-3';

    expect(() => medico.definirDisponibilidad(disponibilidad)).toThrow(BadRequestError);
  });

  test('eliminarDisponibilidad remueve disponibilidad existente', () => {
    const medico = createMedico();
    const sede = createSede();
    const especialidad = createEspecialidad();
    const practica = createPractica();

    medico.sedes.push(sede);
    medico.especialidades.push(especialidad);
    medico.practicas.push(practica);

    const disponibilidad = new DisponibilidadHoraria({
      diaSemana: 3,
      horaDesde: '08:00',
      horaHasta: '09:00',
      sede
    });
    disponibilidad.especialidades.push(especialidad);
    disponibilidad.practicas.push(practica);
    disponibilidad._id = 'disp-4';

    medico.definirDisponibilidad(disponibilidad);
    medico.eliminarDisponibilidad({ _id: 'disp-4' });

    expect(medico.disponibilidades).toHaveLength(0);
  });

  test('eliminarEspecialidad lanza NotFoundError si la especialidad no existe', () => {
    const medico = createMedico();
    medico.especialidades.push({ _id: 'esp-999', nombre: 'Neurología' });

    expect(() => medico.eliminarEspecialidad('esp-123')).toThrow(NotFoundError);
  });

  test('especialidadGenericaPertenece identifica especialidad por id padre', () => {
    const medico = createMedico();
    medico.especialidades.push({ especialidadGenerica: 'gen-1', _id: 'esp-1' });

    expect(medico.especialidadGenericaPertenece('gen-1')).toBe(true);
    expect(medico.especialidadGenericaPertenece('otro')).toBe(false);
  });

  test('practicaGenericaPertenece identifica practica por id padre', () => {
    const medico = createMedico();
    medico.practicas.push({ practicaGenerica: 'gen-2', _id: 'prac-2' });

    expect(medico.practicaGenericaPertenece('gen-2')).toBe(true);
    expect(medico.practicaGenericaPertenece('otro')).toBe(false);
  });
});