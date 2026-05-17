import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { Types } from 'mongoose';

import { NotificacionService } from '../../services/NotificacionService.js';
import { Notificacion } from '../../domain/Notificacion/Notificacion.js';
import { ForbiddenError, NotFoundError } from '../../errors/AppErrors.js';

const VALID_NOTIF_ID = new Types.ObjectId().toString();
const VALID_USUARIO_ID = new Types.ObjectId().toString();
const OTRO_USUARIO_ID = new Types.ObjectId().toString();

describe('NotificacionService', () => {
  let notificacionRepository;
  let usuarioService;
  let service;

  beforeEach(() => {
    notificacionRepository = {
      obtenerPaginados: jest.fn(),
      obtenerPorId: jest.fn(),
      save: jest.fn(),
      crear: jest.fn()
    };
    usuarioService = {
      obtenerPorId: jest.fn()
    };
    service = new NotificacionService({ notificacionRepository, usuarioService });
  });

  describe('obtenerTodos', () => {
    test('valida que el usuario exista cuando viene en filtros', async () => {
      usuarioService.obtenerPorId.mockResolvedValue({ _id: VALID_USUARIO_ID });
      notificacionRepository.obtenerPaginados.mockResolvedValue({
        notificaciones: [],
        totalNotificaciones: 0,
        totalPaginas: 0
      });

      await service.obtenerTodos({
        numeroPagina: 1,
        limitePorPagina: 10,
        filtros: { usuarioId: VALID_USUARIO_ID }
      });

      expect(usuarioService.obtenerPorId).toHaveBeenCalledWith(VALID_USUARIO_ID);
    });

    test('propaga el resultado del repositorio', async () => {
      notificacionRepository.obtenerPaginados.mockResolvedValue({
        notificaciones: [{ _id: 'n1' }],
        totalNotificaciones: 1,
        totalPaginas: 1
      });

      const resultado = await service.obtenerTodos();

      expect(resultado.notificaciones).toHaveLength(1);
      expect(resultado.totalNotificaciones).toBe(1);
    });
  });

  describe('obtenerPorId', () => {
    test('retorna la notificación si existe', async () => {
      const noti = { _id: VALID_NOTIF_ID };
      notificacionRepository.obtenerPorId.mockResolvedValue(noti);

      const resultado = await service.obtenerPorId(VALID_NOTIF_ID);

      expect(resultado).toBe(noti);
    });

    test('lanza NotFoundError si no existe', async () => {
      notificacionRepository.obtenerPorId.mockResolvedValue(null);

      await expect(service.obtenerPorId(VALID_NOTIF_ID)).rejects.toThrow(NotFoundError);
    });
  });

  describe('marcarComoLeida', () => {
    const createNotificacionMock = (destinatarioId) => {
      const noti = new Notificacion({
        destinatario: { _id: destinatarioId },
        remitente: null,
        mensaje: 'Mensaje de prueba'
      });
      return noti;
    };

    test('lanza ForbiddenError si la notificación no le pertenece al usuario', async () => {
      const noti = createNotificacionMock(OTRO_USUARIO_ID);
      notificacionRepository.obtenerPorId.mockResolvedValue(noti);

      await expect(
        service.marcarComoLeida(VALID_NOTIF_ID, VALID_USUARIO_ID)
      ).rejects.toThrow(ForbiddenError);
    });

    test('marca como leída si pertenece al usuario', async () => {
      const noti = createNotificacionMock(VALID_USUARIO_ID);
      notificacionRepository.obtenerPorId.mockResolvedValue(noti);
      notificacionRepository.save.mockImplementation(n => Promise.resolve(n));

      const resultado = await service.marcarComoLeida(VALID_NOTIF_ID, VALID_USUARIO_ID);

      expect(resultado.leida).toBe(true);
      expect(resultado.fechaHoraLeida).not.toBeNull();
      expect(notificacionRepository.save).toHaveBeenCalled();
    });
  });

  describe('notificarCambioEstadoTurno', () => {
    test('no llama al repositorio cuando la factory devuelve undefined', async () => {
      service.factory = { crearSegunEstadoTurno: jest.fn().mockReturnValue(undefined) };

      await service.notificarCambioEstadoTurno({ estado: 'DISPONIBLE' });

      expect(notificacionRepository.crear).not.toHaveBeenCalled();
    });

    test('persiste la notificación creada por la factory', async () => {
      const fakeNoti = { mensaje: 'algo' };
      service.factory = { crearSegunEstadoTurno: jest.fn().mockReturnValue(fakeNoti) };

      await service.notificarCambioEstadoTurno({ estado: 'RESERVADO' });

      expect(notificacionRepository.crear).toHaveBeenCalledWith(fakeNoti);
    });
  });
});
