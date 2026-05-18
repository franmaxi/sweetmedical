import { describe, expect, test } from '@jest/globals';

import { Paciente } from '../../domain/Paciente/Paciente.js';
import { ObraSocial } from '../../domain/Paciente/ObraSocial.js';
import { Plan } from '../../domain/Plan/Plan.js';
import { CoberturaEspecialidad } from '../../domain/Plan/CoberturaEspecialidad.js';
import { CoberturaPractica } from '../../domain/Plan/CoberturaPractica.js';
import { NivelCobertura } from '../../domain/Enumerados/NivelCobertura.js';

const datosPacienteValidos = () => ({
  usuario: { _id: 'usr-1', nombreUsuario: 'juan' },
  dni: 12345678,
  nombre: 'Juan Pérez',
  obraSocial: { _id: 'os-1', nombre: 'OSDE' },
  plan: { _id: 'plan-1', nombre: 'Premium' }
});

describe('Paciente domain', () => {
  test('constructor inicializa los campos con datos válidos', () => {
    const datos = datosPacienteValidos();

    const paciente = new Paciente(datos);

    expect(paciente.dni).toBe(datos.dni);
    expect(paciente.nombre).toBe('Juan Pérez');
    expect(paciente.usuario).toBe(datos.usuario);
    expect(paciente.obraSocial).toBe(datos.obraSocial);
    expect(paciente.plan).toBe(datos.plan);
    expect(paciente.eliminado).toBe(false);
  });

  test('constructor lanza si el DNI no es positivo', () => {
    const datos = datosPacienteValidos();
    datos.dni = -1;

    expect(() => new Paciente(datos)).toThrow();
  });

  test('constructor lanza si el nombre está vacío', () => {
    const datos = datosPacienteValidos();
    datos.nombre = '   ';

    expect(() => new Paciente(datos)).toThrow();
  });
});

describe('ObraSocial domain', () => {
  test('constructor inicializa con lista de planes vacía', () => {
    const os = new ObraSocial({ nombre: 'OSDE' });

    expect(os.nombre).toBe('OSDE');
    expect(os.planes).toEqual([]);
  });

  test('constructor lanza si el nombre está vacío', () => {
    expect(() => new ObraSocial({ nombre: '' })).toThrow();
  });

  test('agregarPlanes apila múltiples planes', () => {
    const os = new ObraSocial({ nombre: 'OSDE' });
    const plan1 = { _id: 'p1' };
    const plan2 = { _id: 'p2' };

    os.agregarPlanes(plan1, plan2);

    expect(os.planes).toEqual([plan1, plan2]);
  });
});

describe('Plan domain', () => {
  test('constructor inicializa con coberturas vacías', () => {
    const plan = new Plan({ nombre: 'Premium' });

    expect(plan.nombre).toBe('Premium');
    expect(plan.coberturaEspecialidad).toEqual([]);
    expect(plan.coberturaPractica).toEqual([]);
  });

  test('obtenerCoberturaEspecialidad retorna el nivel cuando existe', () => {
    const plan = new Plan({ nombre: 'Premium' });
    const especialidad = { _id: 'esp-1' };
    plan.coberturaEspecialidad.push({ especialidad, nivel: NivelCobertura.TOTAL });

    expect(plan.obtenerCoberturaEspecialidad(especialidad)).toBe(NivelCobertura.TOTAL);
  });

  test('obtenerCoberturaEspecialidad retorna null si no hay cobertura', () => {
    const plan = new Plan({ nombre: 'Premium' });

    expect(plan.obtenerCoberturaEspecialidad({ _id: 'esp-1' })).toBeNull();
  });

  test('obtenerCoberturaPractica retorna el nivel cuando existe', () => {
    const plan = new Plan({ nombre: 'Premium' });
    const practica = { _id: 'prac-1' };
    plan.coberturaPractica.push({ practica, nivel: NivelCobertura.PARCIAL });

    expect(plan.obtenerCoberturaPractica(practica)).toBe(NivelCobertura.PARCIAL);
  });

  test('obtenerCoberturaPractica retorna null si no hay cobertura', () => {
    const plan = new Plan({ nombre: 'Premium' });

    expect(plan.obtenerCoberturaPractica({ _id: 'prac-1' })).toBeNull();
  });
});

describe('CoberturaEspecialidad domain', () => {
  test('constructor con datos válidos', () => {
    const cob = new CoberturaEspecialidad({
      especialidadGenerica: 'esp-gen-1',
      nivel: NivelCobertura.TOTAL
    });

    expect(cob.especialidadGenerica).toBe('esp-gen-1');
    expect(cob.nivel).toBe(NivelCobertura.TOTAL);
  });

  test('constructor lanza si el nivel no es válido', () => {
    expect(() =>
      new CoberturaEspecialidad({
        especialidadGenerica: 'esp-gen-1',
        nivel: 'INEXISTENTE'
      })
    ).toThrow();
  });
});

describe('CoberturaPractica domain', () => {
  test('constructor con datos válidos', () => {
    const cob = new CoberturaPractica({
      practicaGenerica: 'prac-gen-1',
      nivel: NivelCobertura.PARCIAL
    });

    expect(cob.practicaGenerica).toBe('prac-gen-1');
    expect(cob.nivel).toBe(NivelCobertura.PARCIAL);
  });

  test('constructor lanza si el nivel no es válido', () => {
    expect(() =>
      new CoberturaPractica({
        practicaGenerica: 'prac-gen-1',
        nivel: 'X'
      })
    ).toThrow();
  });
});
