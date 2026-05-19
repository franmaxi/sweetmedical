import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { Types } from 'mongoose';

import { PracticaService } from '../../services/PracticaService.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError
} from '../../errors/AppErrors.js';

const VALID_ID = new Types.ObjectId().toString();
const VALID_ID_2 = new Types.ObjectId().toString();

describe('PracticaService', () => {
  let practicaRepository;
  let practicaGenericaRepository;
  let service;

  beforeEach(() => {
    practicaRepository = {
      findPaginados: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByNombre: jest.fn(),
      findByPracticaGenerica: jest.fn(),
      updateMany: jest.fn()
    };
    practicaGenericaRepository = {
      findPaginados: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      findOneByNombre: jest.fn(),
      findByCodigo: jest.fn()
    };
    service = new PracticaService({ practicaRepository, practicaGenericaRepository });
  });

  describe('obtenerPorId', () => {
    test('retorna la práctica si existe', async () => {
      const prac = { _id: VALID_ID, nombre: 'Radiografía' };
      practicaRepository.findById.mockResolvedValue(prac);

      const resultado = await service.obtenerPorId(VALID_ID);

      expect(resultado).toBe(prac);
    });

    test('lanza NotFoundError si no existe', async () => {
      practicaRepository.findById.mockResolvedValue(null);

      await expect(service.obtenerPorId(VALID_ID)).rejects.toThrow(NotFoundError);
    });
  });

  describe('crear', () => {
    const datos = () => ({
      codigo: 'RX-01',
      nombre: 'Radiografía',
      duracionTurnoEnMins: 30,
      costo: 5000
    });

    test('lanza NotFoundError si la genérica no existe', async () => {
      practicaGenericaRepository.findByCodigo.mockResolvedValue(null);

      await expect(service.crear(datos())).rejects.toThrow(NotFoundError);
    });

    test('lanza NotFoundError si el nombre no coincide con el código', async () => {
      practicaGenericaRepository.findByCodigo.mockResolvedValue({
        _id: VALID_ID,
        codigo: 'RX-01',
        nombre: 'Tomografía'
      });

      await expect(service.crear(datos())).rejects.toThrow(NotFoundError);
    });

    test('crea la práctica cuando los datos coinciden con la genérica', async () => {
      practicaGenericaRepository.findByCodigo.mockResolvedValue({
        _id: VALID_ID,
        codigo: 'RX-01',
        nombre: 'Radiografía'
      });
      practicaRepository.save.mockImplementation(p => Promise.resolve({ ...p, _id: VALID_ID_2 }));

      const resultado = await service.crear(datos());

      expect(resultado.nombre).toBe('Radiografía');
      expect(resultado.codigo).toBe('RX-01');
      expect(practicaRepository.save).toHaveBeenCalled();
    });
  });

  describe('actualizar', () => {
    test('lanza NotFoundError si la práctica no existe', async () => {
      practicaRepository.findById.mockResolvedValue(null);

      await expect(
        service.actualizar(VALID_ID, {
          codigo: 'RX-01',
          nombre: 'Radiografía',
          duracionTurnoEnMins: 30,
          costo: 5000
        })
      ).rejects.toThrow(NotFoundError);
    });

    test('lanza BadRequestError si se intenta cambiar el nombre', async () => {
      practicaRepository.findById.mockResolvedValue({
        _id: VALID_ID,
        codigo: 'RX-01',
        nombre: 'Radiografía',
        practicaGenerica: VALID_ID_2
      });
      practicaGenericaRepository.findById.mockResolvedValue({
        _id: VALID_ID_2,
        codigo: 'RX-01',
        nombre: 'Radiografía'
      });

      await expect(
        service.actualizar(VALID_ID, {
          codigo: 'RX-01',
          nombre: 'Otro',
          duracionTurnoEnMins: 30,
          costo: 5000
        })
      ).rejects.toThrow(BadRequestError);
    });

    test('actualiza costo y duración si nombre y código coinciden', async () => {
      const practica = {
        _id: VALID_ID,
        codigo: 'RX-01',
        nombre: 'Radiografía',
        practicaGenerica: VALID_ID_2,
        duracionTurnoEnMins: 30,
        costo: 5000
      };
      practicaRepository.findById.mockResolvedValue(practica);
      practicaGenericaRepository.findById.mockResolvedValue({
        _id: VALID_ID_2,
        codigo: 'RX-01',
        nombre: 'Radiografía'
      });
      practicaRepository.update.mockImplementation((_id, p) => Promise.resolve(p));

      const resultado = await service.actualizar(VALID_ID, {
        codigo: 'RX-01',
        nombre: 'Radiografía',
        duracionTurnoEnMins: 45,
        costo: 7000
      });

      expect(resultado.costo).toBe(7000);
      expect(resultado.duracionTurnoEnMins).toBe(45);
    });
  });

  describe('eliminar', () => {
    test('lanza NotFoundError si no existe', async () => {
      practicaRepository.findById.mockResolvedValue(null);

      await expect(service.eliminar(VALID_ID)).rejects.toThrow(NotFoundError);
    });

    test('elimina si existe', async () => {
      practicaRepository.findById.mockResolvedValue({ _id: VALID_ID });
      practicaRepository.delete.mockResolvedValue({ _id: VALID_ID, eliminado: true });

      const resultado = await service.eliminar(VALID_ID);

      expect(resultado).toEqual({ _id: VALID_ID, eliminado: true });
    });
  });

  describe('crearGenerica', () => {
    const datos = () => ({ nombre: 'Radiografía', codigo: 'RX-01' });

    test('lanza ConflictError si ya existe una con ese nombre', async () => {
      practicaGenericaRepository.findOneByNombre.mockResolvedValue({ _id: VALID_ID });

      await expect(service.crearGenerica(datos())).rejects.toThrow(ConflictError);
    });

    test('lanza ConflictError si ya existe una con ese código', async () => {
      practicaGenericaRepository.findOneByNombre.mockResolvedValue(null);
      practicaGenericaRepository.findByCodigo.mockResolvedValue({ _id: VALID_ID });

      await expect(service.crearGenerica(datos())).rejects.toThrow(ConflictError);
    });

    test('crea la práctica genérica cuando nombre y código son únicos', async () => {
      practicaGenericaRepository.findOneByNombre.mockResolvedValue(null);
      practicaGenericaRepository.findByCodigo.mockResolvedValue(null);
      practicaGenericaRepository.save.mockImplementation(g => Promise.resolve({ ...g, _id: VALID_ID }));

      const resultado = await service.crearGenerica(datos());

      expect(resultado.nombre).toBe('Radiografía');
      expect(resultado.codigo).toBe('RX-01');
    });
  });
});
