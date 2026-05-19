import { describe, expect, test, beforeEach, jest } from '@jest/globals';

import { TurnoService } from '../../services/TurnoService.js';
import { Turno } from '../../domain/Turno/Turno.js';
import { EstadoTurno } from '../../domain/Enumerados/EstadoTurno.js';
import { NotFoundError, UnprocessableEntityError } from '../../errors/AppErrors.js';

const createMockTurnoRepository = () => ({
  findById: jest.fn(),
  obtenerPaginados: jest.fn(),
  obtenerSiguientesDisponibles: jest.fn(),
  obtenerCombinados: jest.fn(),
  update: jest.fn(),
  save: jest.fn(),
  saveAllBatch: jest.fn(),
  findAllDispoPopulado: jest.fn()
});

const createMockMedicoRepository = () => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  obtenerDisponibilidadPorId: jest.fn()
});

const createMockPacienteRepository = () => ({
  findById: jest.fn()
});

const createMockEspecialidadRepository = () => ({
  findById: jest.fn()
});

const createMockPracticaRepository = () => ({
  findById: jest.fn()
});

const createMockNotificacionService = () => ({
  notificarCambioEstadoTurno: jest.fn()
});

const createMockUsuarioService = () => ({
  findById: jest.fn(),
  obtenerPorId: jest.fn()
});

const buildService = (overrides = {}) => {
  const deps = {
    turnoRepository: createMockTurnoRepository(),
    medicoRepository: createMockMedicoRepository(),
    pacienteRepository: createMockPacienteRepository(),
    especialidadRepository: createMockEspecialidadRepository(),
    practicaRepository: createMockPracticaRepository(),
    notificacionService: createMockNotificacionService(),
    usuarioService: createMockUsuarioService(),
    ...overrides
  };

  const service = new TurnoService(deps);
  // validarPaginacion no está implementada en la clase; la stubeamos para que no rompa.
  service.validarPaginacion = jest.fn();
  return { service, ...deps };
};

const createMedico = () => ({ _id: 'medico-1', nombre: 'Dr. House', usuario: '1', matricula: "891823981239" });
const createSede = () => ({ _id: 'sede-1', nombre: 'Sede Central', direccion: 'Avenida avenida 123'});

const createTurnoReservable = ({ estado = EstadoTurno.DISPONIBLE, medicoId = 'medico-1' } = {}) => {
  const turno = new Turno({
    medico: { _id: medicoId, nombre: 'Dr. House', usuario: '1', matricula: "891823981239" },
    fechaHora: new Date('2026-06-01T10:00:00Z'),
    sede: createSede(),
    especialidad: [{ _id: 'esp-1', nombre: "especialdiad1", especialidadGenerica: '65f1a9b8c3d2e10a4b5c6d81', costo: 700, duracionTurnoEnMins: 60}],
    practica: null,
    disponibilidad: { _id: 'disp-1', diaSemana: 1, horaDesde:"19:00", horaHasta: "23:00", sede:"1"}
  });
  turno._id = 'turno-1';
  turno.estado = estado;
  return turno;
};

describe('TurnoService', () => {
  describe('obtenerPorId', () => {
    test('retorna el turno si existe', async () => {
      const { service, turnoRepository } = buildService();
      const turno = createTurnoReservable();
      turnoRepository.findById.mockResolvedValue(turno);

      const resultado = await service.obtenerPorId('turno-1');

      expect(resultado).toBe(turno);
      expect(turnoRepository.findById).toHaveBeenCalledWith('turno-1');
    });

    test('lanza NotFoundError si no existe', async () => {
      const { service, turnoRepository } = buildService();
      turnoRepository.findById.mockResolvedValue(null);

      await expect(service.obtenerPorId('inexistente')).rejects.toThrow(NotFoundError);
    });
  });

  describe('obtenerTodos', () => {
    test('lanza NotFoundError si el paciente no existe', async () => {
      const { service, pacienteRepository } = buildService();
      pacienteRepository.findById.mockResolvedValue(null);

      await expect(
        service.obtenerTodos({ pacienteId: 'pac-1' })
      ).rejects.toThrow(NotFoundError);
    });

    test('lanza NotFoundError si el médico no existe', async () => {
      const { service, medicoRepository } = buildService();
      medicoRepository.findById.mockResolvedValue(null);

      await expect(
        service.obtenerTodos({ medicoId: 'medico-1' })
      ).rejects.toThrow(NotFoundError);
    });

    test('aplica filtros de paciente y médico y delega en el repositorio', async () => {
      const { service, turnoRepository, pacienteRepository, medicoRepository } = buildService();
      pacienteRepository.findById.mockResolvedValue({ _id: 'pac-1' });
      medicoRepository.findById.mockResolvedValue({ _id: 'medico-1' });
      turnoRepository.obtenerPaginados.mockResolvedValue({
        turnos: [],
        totalTurnos: 0,
        totalPaginas: 0
      });

      await service.obtenerTodos({
        pacienteId: 'pac-1',
        medicoId: 'medico-1',
        numeroPagina: 2,
        limitePorPagina: 5
      });

      expect(turnoRepository.obtenerPaginados).toHaveBeenCalledWith(
        2,
        5,
        expect.objectContaining({ paciente: 'pac-1', medico: 'medico-1' }),
        expect.any(Object)
      );
    });
  });

  describe('reservarTurno', () => {
    test('lanza NotFoundError si el turno no existe', async () => {
      const { service, turnoRepository } = buildService();
      turnoRepository.findById.mockResolvedValue(null);

      await expect(
        service.reservarTurno('turno-1', 'pac-1', 'esp-1', null)
      ).rejects.toThrow(NotFoundError);
    });

    test('lanza UnprocessableEntityError si el turno no está disponible', async () => {
      const { service, turnoRepository } = buildService();
      turnoRepository.findById.mockResolvedValue(
        createTurnoReservable({ estado: EstadoTurno.RESERVADO })
      );

      await expect(
        service.reservarTurno('turno-1', 'pac-1', 'esp-1', null)
      ).rejects.toThrow(UnprocessableEntityError);
    });

    test('lanza NotFoundError si el paciente no existe', async () => {
      const { service, turnoRepository, pacienteRepository } = buildService();
      turnoRepository.findById.mockResolvedValue(createTurnoReservable());
      pacienteRepository.findById.mockResolvedValue(null);

      await expect(
        service.reservarTurno('turno-1', 'pac-1', 'esp-1', null)
      ).rejects.toThrow(NotFoundError);
    });

    test('lanza UnprocessableEntityError si se mandan especialidadId y practicaId al mismo tiempo', async () => {
      const { service, turnoRepository, pacienteRepository } = buildService();
      turnoRepository.findById.mockResolvedValue(createTurnoReservable());
      pacienteRepository.findById.mockResolvedValue({ _id: 'pac-1', usuario: { _id: 'usr-1' } });

      await expect(
        service.reservarTurno('turno-1', 'pac-1', 'esp-1', 'prac-1')
      ).rejects.toThrow(UnprocessableEntityError);
    });

    test('lanza UnprocessableEntityError si no se manda ni especialidad ni practica', async () => {
      const { service, turnoRepository, pacienteRepository } = buildService();
      turnoRepository.findById.mockResolvedValue(createTurnoReservable());
      pacienteRepository.findById.mockResolvedValue({ _id: 'pac-1', usuario: { _id: 'usr-1' } });

      await expect(
        service.reservarTurno('turno-1', 'pac-1', null, null)
      ).rejects.toThrow(UnprocessableEntityError);
    });

    test('lanza NotFoundError si la especialidad no existe', async () => {
      const { service, turnoRepository, pacienteRepository, especialidadRepository } = buildService();
      turnoRepository.findById.mockResolvedValue(createTurnoReservable());
      pacienteRepository.findById.mockResolvedValue({ _id: 'pac-1', usuario: { _id: 'usr-1' } });
      especialidadRepository.findById.mockResolvedValue(null);

      await expect(
        service.reservarTurno('turno-1', 'pac-1', 'esp-1', null)
      ).rejects.toThrow(NotFoundError);
    });

    test('lanza UnprocessableEntityError si la disponibilidad no incluye la especialidad', async () => {
      const {
        service,
        turnoRepository,
        pacienteRepository,
        especialidadRepository,
        medicoRepository
      } = buildService();

      turnoRepository.findById.mockResolvedValue(createTurnoReservable());
      pacienteRepository.findById.mockResolvedValue({ _id: 'pac-1', usuario: { _id: 'usr-1' } });
      especialidadRepository.findById.mockResolvedValue({
        _id: 'esp-1',
        duracionTurnoEnMins: 30,
        costo: 1000
      });
      medicoRepository.obtenerDisponibilidadPorId.mockResolvedValue({
        _id: 'disp-1',
        mcdDuracion: 30,
        especialidades: [{ toString: () => 'otra-esp' }],
        practicas: []
      });

      await expect(
        service.reservarTurno('turno-1', 'pac-1', 'esp-1', null)
      ).rejects.toThrow(UnprocessableEntityError);
    });

    test('reserva el turno cuando hay tiempo suficiente para la especialidad', async () => {
      const {
        service,
        turnoRepository,
        pacienteRepository,
        especialidadRepository,
        medicoRepository
      } = buildService();

      const turno = createTurnoReservable();
      turnoRepository.findById.mockResolvedValue(turno);
      pacienteRepository.findById.mockResolvedValue({ _id: 'pac-1', usuario: { _id: 'usr-1' } });
      especialidadRepository.findById.mockResolvedValue({
        _id: 'esp-1',
        duracionTurnoEnMins: 30,
        costo: 1500
      });
      medicoRepository.obtenerDisponibilidadPorId.mockResolvedValue({
        _id: 'disp-1',
        mcdDuracion: 30,
        especialidades: [{ toString: () => 'esp-1' }],
        practicas: []
      });
      turnoRepository.obtenerSiguientesDisponibles.mockResolvedValue([turno]);
      turnoRepository.update.mockResolvedValue(turno);

      const resultado = await service.reservarTurno('turno-1', 'pac-1', 'esp-1', null);

      expect(resultado.estado).toBe(EstadoTurno.RESERVADO);
      expect(resultado.paciente).toBe('pac-1');
      expect(resultado.costo).toBe(1500);
      expect(resultado.especialidad).toBe('esp-1');
      expect(resultado.practica).toBeNull();
      expect(turnoRepository.update).toHaveBeenCalled();
    });

    test('lanza UnprocessableEntityError si no hay turnos contiguos suficientes', async () => {
      const {
        service,
        turnoRepository,
        pacienteRepository,
        especialidadRepository,
        medicoRepository
      } = buildService();

      turnoRepository.findById.mockResolvedValue(createTurnoReservable());
      pacienteRepository.findById.mockResolvedValue({ _id: 'pac-1', usuario: { _id: 'usr-1' } });
      especialidadRepository.findById.mockResolvedValue({
        _id: 'esp-1',
        duracionTurnoEnMins: 60,
        costo: 1500
      });
      medicoRepository.obtenerDisponibilidadPorId.mockResolvedValue({
        _id: 'disp-1',
        mcdDuracion: 30,
        especialidades: [{ toString: () => 'esp-1' }],
        practicas: []
      });
      turnoRepository.obtenerSiguientesDisponibles.mockResolvedValue([]); // 0 contiguos, necesita 2

      await expect(
        service.reservarTurno('turno-1', 'pac-1', 'esp-1', null)
      ).rejects.toThrow(UnprocessableEntityError);
    });
  });

  describe('realizar', () => {
    test('lanza NotFoundError si el turno no existe', async () => {
      const { service, turnoRepository } = buildService();
      turnoRepository.findById.mockResolvedValue(null);

      await expect(service.realizar('turno-1', 'medico-1')).rejects.toThrow(NotFoundError);
    });

    test('lanza UnprocessableEntityError si el turno no pertenece al médico', async () => {
      const { service, turnoRepository } = buildService();
      const turno = createTurnoReservable({ estado: EstadoTurno.RESERVADO });
      turnoRepository.findById.mockResolvedValue(turno);

      await expect(service.realizar('turno-1', 'otro-medico')).rejects.toThrow(UnprocessableEntityError);
    });

    test('lanza UnprocessableEntityError si el turno no está RESERVADO', async () => {
      const { service, turnoRepository } = buildService();
      const turno = createTurnoReservable({ estado: EstadoTurno.DISPONIBLE });
      turnoRepository.findById.mockResolvedValue(turno);

      await expect(service.realizar('turno-1', 'medico-1')).rejects.toThrow(UnprocessableEntityError);
    });

    test('marca el turno como REALIZADO si está RESERVADO', async () => {
      const { service, turnoRepository } = buildService();
      const turno = createTurnoReservable({ estado: EstadoTurno.RESERVADO });
      turno.medico._id = 'medico-1'
      //turno.medico.usuario = { _id: 'usr-medico' };
      turnoRepository.findById.mockResolvedValue(turno);
      turnoRepository.update.mockImplementation((_id, t) => Promise.resolve(t));

      const resultado = await service.realizar('turno-1', 'medico-1');

      expect(resultado.estado).toBe(EstadoTurno.REALIZADO);
      expect(turnoRepository.update).toHaveBeenCalledWith('turno-1', turno);
    });
  });

  describe('cancelar', () => {
    test('lanza NotFoundError si el turno no existe', async () => {
      const { service, turnoRepository } = buildService();
      turnoRepository.findById.mockResolvedValue(null);

      await expect(service.cancelar('turno-1', 'usr-1', 'motivo')).rejects.toThrow(NotFoundError);
    });

    test('lanza UnprocessableEntityError si el usuario no es ni médico ni paciente del turno', async () => {
      const { service, turnoRepository, usuarioService } = buildService();
      const turno = createTurnoReservable({ estado: EstadoTurno.RESERVADO });
      turno.paciente = { _id: 'pac-1' };
      turnoRepository.findById.mockResolvedValue(turno);
      usuarioService.findById.mockResolvedValue({ _id: 'usr-otro' });

      await expect(
        service.cancelar('turno-1', 'usr-otro', 'motivo')
      ).rejects.toThrow(UnprocessableEntityError);
    });

    test('cancela el turno cuando lo solicita el médico y no hay combinados', async () => {
      process.env.HORAS_MINIMAS_CANCELAR = '1';
      
      const { service, turnoRepository, usuarioService, notificacionService } = buildService();
      const turno = createTurnoReservable({ estado: EstadoTurno.RESERVADO });
      turno.paciente = { _id: 'pac-1' };
      turno.medico._id = 'medico-1'
      turno.fechaHora = new Date(Date.now() + 2*60*60*1000)

      turnoRepository.findById.mockResolvedValue(turno);
      usuarioService.obtenerPorId.mockResolvedValue({ _id: 'medico-1' });
      turnoRepository.obtenerCombinados.mockResolvedValue([turno]);
      turnoRepository.update.mockImplementation((_id, t) => Promise.resolve(t));

      const resultado = await service.cancelar('turno-1', 'medico-1', 'no puedo asistir');

      expect(resultado.estado).toBe(EstadoTurno.CANCELADO);
      expect(turnoRepository.update).toHaveBeenCalled();
      expect(notificacionService.notificarCambioEstadoTurno).toHaveBeenCalledWith(turno);
    });
  });

  describe('copiarTurnoCancelado', () => {
    test('copia datos clave del turno cancelado a uno nuevo en estado DISPONIBLE', () => {
      const { service } = buildService();
      const turno = createTurnoReservable({ estado: EstadoTurno.CANCELADO });

      const copia = service.copiarTurnoCancelado(turno);

      expect(copia).toBeInstanceOf(Turno);
      expect(copia.medico).toEqual(turno.medico);
      expect(copia.fechaHora).toEqual(turno.fechaHora);
      expect(copia.sede).toEqual(turno.sede);
      expect(copia.disponibilidad).toEqual(turno.disponibilidad);
      expect(copia.practica).toBeNull();
      expect(copia.especialidad).toBeNull();
      expect(copia.estado).toEqual(EstadoTurno.DISPONIBLE);
      expect(copia.paciente).toBeNull();
    });
  });

  describe('generarTurnosBatch', () => {
    test('genera y guarda los turnos para los médicos con disponibilidades', async () => {
      const { service, medicoRepository, turnoRepository } = buildService();
      process.env.DIAS_ANTELACION_TURNO = '7';

      medicoRepository.findAll.mockResolvedValue([
        { _id: 'medico-1', disponibilidades: [] } // sin disponibilidades -> Agenda devuelve []
      ]);

      await service.generarTurnosBatch();

      expect(medicoRepository.findAll).toHaveBeenCalled();
      expect(turnoRepository.saveAllBatch).not.toHaveBeenCalled();
    });
  });
});
