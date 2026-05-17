import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { Types } from 'mongoose';

import { EspecialidadService } from '../../services/EspecialidadService.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError
} from '../../errors/AppErrors.js';

const VALID_ID = new Types.ObjectId().toString();
const VALID_ID_2 = new Types.ObjectId().toString();

describe('EspecialidadService', () => {
  let especialidadRepository;
  let especialidadGenericaRepository;
  let service;

  beforeEach(() => {
    especialidadRepository = {
      findPaginados: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByNombre: jest.fn(),
      findByIdEspecialidadGenerica: jest.fn(),
      updateManyNombres: jest.fn()
    };
    especialidadGenericaRepository = {
      findPaginados: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      findOneByNombre: jest.fn()
    };
    service = new EspecialidadService({ especialidadRepository, especialidadGenericaRepository });
  });

  describe('obtenerPorId', () => {
    test('retorna la especialidad si existe', async () => {
      const esp = { _id: VALID_ID, nombre: 'Cardiología' };
      especialidadRepository.findById.mockResolvedValue(esp);

      const resultado = await service.obtenerPorId(VALID_ID);

      expect(resultado).toBe(esp);
    });

    test('lanza NotFoundError si no existe', async () => {
      especialidadRepository.findById.mockResolvedValue(null);

      await expect(service.obtenerPorId(VALID_ID)).rejects.toThrow(NotFoundError);
    });
  });

  describe('crear', () => {
    const datos = () => ({
      nombre: 'Cardiología',
      duracionTurnoEnMins: 30,
      costo: 1500
    });

    test('lanza BadRequestError si no existe la genérica con ese nombre', async () => {
      especialidadGenericaRepository.findOneByNombre.mockResolvedValue(null);

      await expect(service.crear(datos())).rejects.toThrow(BadRequestError);
    });

    test('crea la especialidad cuando la genérica existe', async () => {
      especialidadGenericaRepository.findOneByNombre.mockResolvedValue({
        _id: VALID_ID,
        nombre: 'Cardiología'
      });
      especialidadRepository.save.mockImplementation(e => Promise.resolve({ ...e, _id: VALID_ID_2 }));

      const resultado = await service.crear(datos());

      expect(resultado.nombre).toBe('Cardiología');
      expect(resultado.duracionTurnoEnMins).toBe(30);
      expect(resultado.costo).toBe(1500);
      expect(especialidadRepository.save).toHaveBeenCalled();
    });
  });

  describe('actualizar', () => {
    test('lanza BadRequestError si se intenta cambiar el nombre', async () => {
      especialidadRepository.findById.mockResolvedValue({
        _id: VALID_ID,
        nombre: 'Cardiología',
        duracionTurnoEnMins: 30,
        costo: 1000
      });

      await expect(
        service.actualizar(VALID_ID, {
          nombre: 'Otro Nombre',
          duracionTurnoEnMins: 45,
          costo: 2000
        })
      ).rejects.toThrow(BadRequestError);
    });

    test('actualiza duración y costo si el nombre coincide', async () => {
      const esp = {
        _id: VALID_ID,
        nombre: 'Cardiología',
        duracionTurnoEnMins: 30,
        costo: 1000
      };
      especialidadRepository.findById.mockResolvedValue(esp);
      especialidadRepository.update.mockImplementation((_id, e) => Promise.resolve(e));

      const resultado = await service.actualizar(VALID_ID, {
        nombre: 'Cardiología',
        duracionTurnoEnMins: 45,
        costo: 2000
      });

      expect(resultado.duracionTurnoEnMins).toBe(45);
      expect(resultado.costo).toBe(2000);
    });
  });

  describe('eliminar', () => {
    test('lanza NotFoundError si no existe', async () => {
      especialidadRepository.findById.mockResolvedValue(null);

      await expect(service.eliminar(VALID_ID)).rejects.toThrow(NotFoundError);
    });

    test('elimina si existe', async () => {
      especialidadRepository.findById.mockResolvedValue({ _id: VALID_ID, nombre: 'X' });
      especialidadRepository.delete.mockResolvedValue({ _id: VALID_ID, eliminado: true });

      const resultado = await service.eliminar(VALID_ID);

      expect(resultado).toEqual({ _id: VALID_ID, eliminado: true });
    });
  });

  describe('validarExistenciaPorId', () => {
    test('retorna true si existe', async () => {
      especialidadRepository.findById.mockResolvedValue({ _id: VALID_ID });
      await expect(service.validarExistenciaPorId(VALID_ID)).resolves.toBe(true);
    });

    test('retorna false si no existe', async () => {
      especialidadRepository.findById.mockResolvedValue(null);
      await expect(service.validarExistenciaPorId(VALID_ID)).resolves.toBe(false);
    });
  });

  describe('crearGenerica', () => {
    test('lanza ConflictError si ya existe una con ese nombre', async () => {
      especialidadGenericaRepository.findOneByNombre.mockResolvedValue({ _id: VALID_ID });

      await expect(
        service.crearGenerica({ nombre: 'Cardiología' })
      ).rejects.toThrow(ConflictError);
    });

    test('crea genérica nueva', async () => {
      especialidadGenericaRepository.findOneByNombre.mockResolvedValue(null);
      especialidadGenericaRepository.save.mockImplementation(g => Promise.resolve({ ...g, _id: VALID_ID }));

      const resultado = await service.crearGenerica({ nombre: 'Cardiología' });

      expect(resultado.nombre).toBe('Cardiología');
    });
  });

  describe('actualizarGenerica', () => {
    test('lanza ConflictError si ya existe una con el nuevo nombre', async () => {
      especialidadGenericaRepository.findOneByNombre.mockResolvedValue({ _id: VALID_ID_2 });

      await expect(
        service.actualizarGenerica(VALID_ID, { nombre: 'Pediatría' })
      ).rejects.toThrow(ConflictError);
    });

    test('actualiza la genérica y propaga el cambio a las hijas', async () => {
      especialidadGenericaRepository.findOneByNombre.mockResolvedValue(null);
      especialidadGenericaRepository.findById.mockResolvedValue({ _id: VALID_ID, nombre: 'Viejo' });
      especialidadRepository.findByIdEspecialidadGenerica.mockResolvedValue([
        { _id: 'esp-1' },
        { _id: 'esp-2' }
      ]);
      especialidadGenericaRepository.update.mockImplementation((_id, g) => Promise.resolve(g));

      const resultado = await service.actualizarGenerica(VALID_ID, { nombre: 'Nuevo' });

      expect(resultado.nombre).toBe('Nuevo');
      expect(especialidadRepository.updateManyNombres).toHaveBeenCalledWith(
        ['esp-1', 'esp-2'],
        'Nuevo'
      );
    });
  });
});
