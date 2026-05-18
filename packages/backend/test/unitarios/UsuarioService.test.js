import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { Types } from 'mongoose';

import { UsuarioService } from '../../services/UsuarioService.js';
import { BadRequestError, NotFoundError } from '../../errors/AppErrors.js';

const VALID_ID = new Types.ObjectId().toString();

describe('UsuarioService', () => {
  let usuarioRepository;
  let service;

  beforeEach(() => {
    usuarioRepository = {
      findById: jest.fn(),
      findByNombre: jest.fn(),
      save: jest.fn(),
      update: jest.fn()
    };
    service = new UsuarioService({ usuarioRepository });
  });

  describe('obtenerPorId', () => {
    test('lanza si el id no es ObjectId válido', async () => {
      await expect(service.obtenerPorId('no-valido')).rejects.toThrow();
    });

    test('retorna el usuario cuando existe', async () => {
      const usuario = { _id: VALID_ID, nombreUsuario: 'juan' };
      usuarioRepository.findById.mockResolvedValue(usuario);

      const resultado = await service.obtenerPorId(VALID_ID);

      expect(resultado).toBe(usuario);
    });

    test('lanza NotFoundError cuando no existe', async () => {
      usuarioRepository.findById.mockResolvedValue(null);

      await expect(service.obtenerPorId(VALID_ID)).rejects.toThrow(NotFoundError);
    });
  });

  describe('obtenerPorNombre', () => {
    test('delega en el repositorio', async () => {
      const usuario = { _id: VALID_ID, nombreUsuario: 'juan' };
      usuarioRepository.findByNombre.mockResolvedValue(usuario);

      const resultado = await service.obtenerPorNombre('juan');

      expect(resultado).toBe(usuario);
      expect(usuarioRepository.findByNombre).toHaveBeenCalledWith('juan');
    });
  });

  describe('crear', () => {
    test('lanza BadRequestError si el nombre de usuario ya existe', async () => {
      usuarioRepository.findByNombre.mockResolvedValue({ _id: VALID_ID });

      await expect(
        service.crear({ nombreUsuario: 'juan', password: 'pass123' })
      ).rejects.toThrow(BadRequestError);
    });

    test('persiste y retorna el usuario nuevo', async () => {
      usuarioRepository.findByNombre.mockResolvedValue(null);
      usuarioRepository.save.mockResolvedValue({ _id: VALID_ID, nombreUsuario: 'juan' });

      const resultado = await service.crear({ nombreUsuario: 'juan', password: 'pass123' });

      expect(resultado).toEqual({ _id: VALID_ID, nombreUsuario: 'juan' });
      expect(usuarioRepository.save).toHaveBeenCalledWith({
        nombreUsuario: 'juan',
        password: 'pass123'
      });
    });

    test('lanza si falta password', async () => {
      await expect(service.crear({ nombreUsuario: 'juan' })).rejects.toThrow();
    });
  });

  describe('actualizar', () => {
    test('lanza NotFoundError si no existe', async () => {
      usuarioRepository.findById.mockResolvedValue(null);

      await expect(
        service.actualizar(VALID_ID, { nombreUsuario: 'juan', password: 'pass123' })
      ).rejects.toThrow(NotFoundError);
    });

    test('actualiza y retorna el usuario cuando existe', async () => {
      usuarioRepository.findById.mockResolvedValue({ _id: VALID_ID });
      usuarioRepository.update.mockResolvedValue({ _id: VALID_ID, nombreUsuario: 'juanX' });

      const resultado = await service.actualizar(VALID_ID, {
        nombreUsuario: 'juanX',
        password: 'nueva123'
      });

      expect(resultado).toEqual({ _id: VALID_ID, nombreUsuario: 'juanX' });
      expect(usuarioRepository.update).toHaveBeenCalledWith(VALID_ID, {
        nombreUsuario: 'juanX',
        password: 'nueva123'
      });
    });
  });
});
