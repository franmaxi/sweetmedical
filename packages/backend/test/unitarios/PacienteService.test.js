import { describe, expect, test, beforeEach, jest } from '@jest/globals';

import { PacienteService } from '../../services/PacienteService.js';
import { NotFoundError } from '../../errors/AppErrors.js';

const createMocks = () => ({
  pacienteRepository: {
    findPaginados: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  usuarioService: {
    save: jest.fn(),
    crear: jest.fn()
  },
  planRepository: {
    findById: jest.fn()
  },
  obraSocialRepository: {
    findById: jest.fn()
  }
});

describe('PacienteService', () => {
  let mocks;
  let service;

  beforeEach(() => {
    mocks = createMocks();
    service = new PacienteService(mocks);
  });

  describe('obtenerTodos', () => {
    test('retorna pacientes con totalPaginas calculado', async () => {
      mocks.pacienteRepository.findPaginados.mockResolvedValue({
        pacientes: [{ _id: 'p1' }, { _id: 'p2' }],
        totalPacientes: 12
      });

      const resultado = await service.obtenerTodos({ numeroPagina: 1, limitePorPagina: 5 });

      expect(resultado.pacientes).toHaveLength(2);
      expect(resultado.totalPacientes).toBe(12);
      expect(resultado.totalPaginas).toBe(3);
    });

    test('totalPaginas es 0 cuando no hay pacientes', async () => {
      mocks.pacienteRepository.findPaginados.mockResolvedValue({
        pacientes: [],
        totalPacientes: 0
      });

      const resultado = await service.obtenerTodos();

      expect(resultado.totalPaginas).toBe(0);
    });
  });

  describe('obtenerPorId', () => {
    test('retorna el paciente cuando existe', async () => {
      const paciente = { _id: 'p1', nombre: 'Juan' };
      mocks.pacienteRepository.findById.mockResolvedValue(paciente);

      const resultado = await service.obtenerPorId('p1');

      expect(resultado).toBe(paciente);
    });

    test('lanza NotFoundError cuando no existe', async () => {
      mocks.pacienteRepository.findById.mockResolvedValue(null);

      await expect(service.obtenerPorId('p1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('crear', () => {
    const datosPaciente = () => ({
      planId: 'plan-1',
      obraSocialId: 'os-1',
      usuario: { nombreUsuario: 'juan', password: 'pass123' },
      dni: 12345678,
      nombre: 'Juan Pérez'
    });

    test('lanza NotFoundError si el plan no existe', async () => {
      mocks.planRepository.findById.mockResolvedValue(null);

      await expect(service.crear(datosPaciente())).rejects.toThrow(NotFoundError);
    });

    test('lanza NotFoundError si la obra social no existe', async () => {
      mocks.planRepository.findById.mockResolvedValue({ _id: 'plan-1', nombre: 'Premium' });
      mocks.obraSocialRepository.findById.mockResolvedValue(null);

      await expect(service.crear(datosPaciente())).rejects.toThrow(NotFoundError);
    });

    test('crea y persiste el paciente cuando los datos son válidos', async () => {
      const datos = datosPaciente();
      const plan = { _id: 'plan-1', nombre: 'Premium' };
      const obraSocial = { _id: 'os-1', nombre: 'OSDE' };
      const usuarioGuardado = { _id: 'usr-1', nombreUsuario: 'juan' };

      mocks.planRepository.findById.mockResolvedValue(plan);
      mocks.obraSocialRepository.findById.mockResolvedValue(obraSocial);
      mocks.usuarioService.save.mockResolvedValue(usuarioGuardado);
      mocks.pacienteRepository.save.mockImplementation(p => Promise.resolve(p));

      const resultado = await service.crear(datos);

      expect(resultado.dni).toBe(datos.dni);
      expect(resultado.nombre).toBe(datos.nombre);
      expect(resultado.usuario).toBe(usuarioGuardado);
      expect(resultado.plan).toBe(plan);
      expect(resultado.obraSocial).toBe(obraSocial);
      expect(mocks.pacienteRepository.save).toHaveBeenCalled();
    });
  });

  describe('actualizar', () => {
    test('lanza NotFoundError si el paciente no existe', async () => {
      mocks.pacienteRepository.findById.mockResolvedValue(null);

      await expect(service.actualizar('p1', {})).rejects.toThrow(NotFoundError);
    });

    test('delega en pacienteRepository.update cuando existe', async () => {
      mocks.pacienteRepository.findById.mockResolvedValue({ _id: 'p1' });
      mocks.pacienteRepository.update.mockResolvedValue({ _id: 'p1', nombre: 'Nuevo' });

      const resultado = await service.actualizar('p1', { nombre: 'Nuevo' });

      expect(resultado).toEqual({ _id: 'p1', nombre: 'Nuevo' });
      expect(mocks.pacienteRepository.update).toHaveBeenCalledWith('p1', { nombre: 'Nuevo' });
    });
  });

  describe('eliminar', () => {
    test('lanza NotFoundError si el paciente no existe', async () => {
      mocks.pacienteRepository.findById.mockResolvedValue(null);

      await expect(service.eliminar('p1')).rejects.toThrow(NotFoundError);
    });

    test('delega en pacienteRepository.delete', async () => {
      mocks.pacienteRepository.findById.mockResolvedValue({ _id: 'p1' });
      mocks.pacienteRepository.delete.mockResolvedValue({ _id: 'p1', eliminado: true });

      const resultado = await service.eliminar('p1');

      expect(resultado).toEqual({ _id: 'p1', eliminado: true });
    });
  });
});
