import { describe, expect, test } from '@jest/globals';
import { ZodError } from 'zod';
import { Paciente } from '../../domain/Paciente/Paciente.js';

const validUsuario = {
  username: 'paciente1',
  email: 'paciente1@example.com'
};

const validObraSocial = { _id: 'obra-social-1', nombre: 'OSDE' };
const validPlan = { _id: 'plan-1', nombre: 'Plan 100' };

const createPaciente = (overrides = {}) => new Paciente({
  usuario: validUsuario,
  dni: 12345678,
  nombre: 'Juan Pérez',
  obraSocial: validObraSocial,
  plan: validPlan,
  ...overrides
});

describe('Paciente domain', () => {
  test('constructor crea paciente con datos validos', () => {
    const paciente = createPaciente();

    expect(paciente.usuario).toBe(validUsuario);
    expect(paciente.dni).toBe(12345678);
    expect(paciente.nombre).toBe('Juan Pérez');
    expect(paciente.obraSocial).toBe(validObraSocial);
    expect(paciente.plan).toBe(validPlan);
    expect(paciente.eliminado).toBe(false);
  });


  test('constructor lanza ZodError cuando el dni es invalido', () => {
    expect(() => createPaciente({ dni: -1 })).toThrow(ZodError);
  });

  test('constructor lanza ZodError cuando el nombre esta vacio', () => {
    expect(() => createPaciente({ nombre: ' ' })).toThrow(ZodError);
  });

  // Nota: pacienteDomainSchema usa z.any() para obraSocial y plan, por lo que aceptan undefined.
  // Validamos que al menos los campos queden seteados con lo que se pasó (undefined).
  test('constructor no exige obraSocial (acepta undefined por z.any)', () => {
    const paciente = new Paciente({
      usuario: validUsuario,
      dni: 12345678,
      nombre: 'Juan Pérez',
      plan: validPlan
    });
    expect(paciente.obraSocial).toBeUndefined();
  });

  test('constructor no exige plan (acepta undefined por z.any)', () => {
    const paciente = new Paciente({
      usuario: validUsuario,
      dni: 12345678,
      nombre: 'Juan Pérez',
      obraSocial: validObraSocial
    });
    expect(paciente.plan).toBeUndefined();
  });
});
