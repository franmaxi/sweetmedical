import { describe, expect, jest, test, beforeEach } from '@jest/globals';
import { Types } from 'mongoose';
import { MedicoService } from '../../services/MedicoService.js';
import { Medico } from '../../domain/Medico/Medico.js';
import { DisponibilidadHoraria } from '../../domain/Medico/DisponibilidadHoraria.js';
import { Especialidad } from '../../domain/Medico/Servicios/Especialidad.js';
import { Practica } from '../../domain/Medico/Servicios/Practica.js';
import { BadRequestError, ConflictError, NotFoundError } from '../../errors/AppErrors.js';

const MEDICO_ID = new Types.ObjectId().toString();
const MEDICO_ID_INEXISTENTE = new Types.ObjectId().toString();
const DISP_ID = new Types.ObjectId().toString();
const DISP_ID_INEXISTENTE = new Types.ObjectId().toString();
const ESP_ID = new Types.ObjectId().toString();

// Mocks
const createMockMedicoRepository = () => ({
  obtenerPaginados: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  obtenerPorMatricula: jest.fn(),
  addDisponibilidad: jest.fn(),
  getDisponibilidades: jest.fn(),
  obtenerDisponibilidadPorId: jest.fn(),
  updateDisponibilidad: jest.fn()
});

const createMockUsuarioService = () => ({
  crear: jest.fn(),
  actualizar: jest.fn(),
  delete: jest.fn()
});

const createMockEspecialidadService = () => ({
  findById: jest.fn(),
  crear: jest.fn(),
  actualizar: jest.fn(),
  eliminar: jest.fn(),
  obtenerPorNombreGenerica: jest.fn()
});

const createMockPracticaService = () => ({
  findById: jest.fn(),
  crear: jest.fn(),
  actualizar: jest.fn(),
  eliminar: jest.fn(),
  obtenerPorCodigoGenerica: jest.fn()
});

const createMockTurnoService = () => ({});

const createMedico = () => ({
  _id: 'medico-1',
  usuario: { _id: 'usuario-1' },
  matricula: 'M-123',
  nombre: 'Dr. House',
  especialidades: [],
  practicas: [],
  sedes: [],
  disponibilidades: [],
  eliminado: false
});

describe('MedicoService', () => {
  let medicoService;
  let mockMedicoRepository;
  let mockUsuarioService;
  let mockEspecialidadService;
  let mockPracticaService;

  beforeEach(() => {
    mockMedicoRepository = createMockMedicoRepository();
    mockUsuarioService = createMockUsuarioService();
    mockEspecialidadService = createMockEspecialidadService();
    mockPracticaService = createMockPracticaService();

    medicoService = new MedicoService({
      medicoRepository: mockMedicoRepository,
      usuarioService: mockUsuarioService,
      especialidadService: mockEspecialidadService,
      practicaService: mockPracticaService,
      turnoService: createMockTurnoService()
    });
  });

  test('obtenerTodos retorna lista paginada de médicos', async () => {
    const medicos = [createMedico(), { ...createMedico(), _id: 'medico-2', matricula: 'M-456' }];
    mockMedicoRepository.obtenerPaginados.mockResolvedValue({
      medicos,
      totalMedicos: 2
    });

    const resultado = await medicoService.obtenerTodos({ numeroPagina: 1, limitePorPagina: 10 });

    expect(resultado.medicos).toEqual(medicos);
    expect(resultado.totalMedicos).toBe(2);
    expect(resultado.totalPaginas).toBe(1);
  });

  test('obtenerPorId lanza NotFoundError cuando no existe', async () => {
    mockMedicoRepository.findById.mockResolvedValue(null);

    await expect(medicoService.obtenerPorId(MEDICO_ID_INEXISTENTE)).rejects.toThrow(NotFoundError);
  });

  test('obtenerPorId retorna médico existente', async () => {
    const medico = createMedico();
    mockMedicoRepository.findById.mockResolvedValue(medico);

    const resultado = await medicoService.obtenerPorId(MEDICO_ID);

    expect(resultado).toEqual(medico);
  });

  test('crear lanza ConflictError si la matrícula ya existe', async () => {
    mockMedicoRepository.obtenerPorMatricula.mockResolvedValue(createMedico());

    await expect(
      medicoService.crear({
        nombreUsuario: 'house',
        password: 'password123',
        matricula: 'M-123',
        nombre: 'Dr. House'
      })
    ).rejects.toThrow(ConflictError);
  });

  test('crear nuevo médico exitosamente', async () => {
    const usuarioCreado = { _id: 'usuario-1' };
    const medicoCreado = createMedico();

    mockMedicoRepository.obtenerPorMatricula.mockResolvedValue(null);
    mockUsuarioService.crear.mockResolvedValue(usuarioCreado);
    mockMedicoRepository.save.mockResolvedValue(medicoCreado);

    const resultado = await medicoService.crear({
      nombreUsuario: 'house',
      password: 'password123',
      matricula: 'M-123',
      nombre: 'Dr. House'
    });

    expect(mockUsuarioService.crear).toHaveBeenCalledWith({
      nombreUsuario: 'house',
      password: 'password123'
    });
    expect(mockMedicoRepository.save).toHaveBeenCalled();
    expect(resultado).toEqual(medicoCreado);
  });

  test('actualizar verifica que especialidades y prácticas existan', async () => {
    const medico = createMedico();
    medico.usuario._id = 'usuario-1';
    mockMedicoRepository.findById.mockResolvedValue(medico);
    mockEspecialidadService.findById.mockResolvedValue(null);

    await expect(
      medicoService.actualizar(MEDICO_ID, {
        usuario: medico.usuario,
        matricula: 'M-123',
        nombre: 'Dr. House Updated',
        nombreUsuario: 'house',
        password: 'pass123',
        especialidades: ['esp-no-existe'],
        practicas: [],
        sedes: [],
        disponibilidades: []
      })
    ).rejects.toThrow(NotFoundError);
  });

  test('existeMatricula retorna true si existe', async () => {
    mockMedicoRepository.obtenerPorMatricula.mockResolvedValue(createMedico());

    const existe = await medicoService.existeMatricula('M-123');

    expect(existe).toBe(true);
  });

  test('existeMatricula retorna false si no existe', async () => {
    mockMedicoRepository.obtenerPorMatricula.mockResolvedValue(null);

    const existe = await medicoService.existeMatricula('M-999');

    expect(existe).toBe(false);
  });

  test('agregarServicio lanza BadRequestError si médico ya tiene especialidad', async () => {
    const medico = new Medico({ usuario: 'user-1', matricula: 'M-123', nombre: 'Dr. House' });
    const especialidadGenerica = { _id: 'esp-gen-1', nombre: 'Cardiología' };
    const especialidad = {
      especialidadGenerica: 'esp-gen-1',
      nombre: 'Cardiología',
      duracionTurnoEnMins: 30,
      costo: 1200
    };

    mockMedicoRepository.findById.mockResolvedValue(medico);
    mockEspecialidadService.obtenerPorNombreGenerica.mockResolvedValue(especialidadGenerica);

    // Agregar especialidad primera vez
    const especialidadCreada = { _id: 'esp-1', ...especialidad };
    mockEspecialidadService.crear.mockResolvedValue(especialidadCreada);
    mockMedicoRepository.save.mockResolvedValue(medico);

    await medicoService.agregarServicio(MEDICO_ID, especialidad, null);

    // Intentar agregar de nuevo
    mockMedicoRepository.findById.mockResolvedValue(medico);
    await expect(
      medicoService.agregarServicio(MEDICO_ID, especialidad, null)
    ).rejects.toThrow(BadRequestError);
  });

  test('obtenerDisponibilidades retorna lista de disponibilidades', async () => {
    const disponibilidades = [
      { _id: 'disp-1', diaSemana: 1, horaDesde: '10:00', horaHasta: '11:00' }
    ];
    mockMedicoRepository.getDisponibilidades.mockResolvedValue(disponibilidades);

    const resultado = await medicoService.obtenerDisponibilidades(MEDICO_ID);

    expect(resultado).toEqual(disponibilidades);
  });

  test('crearDisponibilidad crea disponibilidad nueva', async () => {
    const sede = { _id: 'sede-1', nombre: 'Sede Central' };
    const datosDisponibilidad = {
      diaSemana: 1,
      horaDesde: '10:00',
      horaHasta: '11:00',
      sede,
      especialidades: [],
      practicas: []
    };

    const medicoActualizado = {
      ...createMedico(),
      disponibilidades: [{ _id: 'disp-1', ...datosDisponibilidad }]
    };

    mockMedicoRepository.addDisponibilidad.mockResolvedValue(medicoActualizado);

    const resultado = await medicoService.crearDisponibilidad(MEDICO_ID, datosDisponibilidad);

    expect(resultado).toEqual(medicoActualizado.disponibilidades[0]);
    expect(mockMedicoRepository.addDisponibilidad).toHaveBeenCalled();
  });

  test('obtenerDisponibilidad lanza NotFoundError si no existe', async () => {
    mockMedicoRepository.obtenerDisponibilidadPorId.mockResolvedValue(null);

    await expect(
      medicoService.obtenerDisponibilidad(MEDICO_ID, DISP_ID_INEXISTENTE)
    ).rejects.toThrow(NotFoundError);
  });

  test('obtenerDisponibilidad retorna disponibilidad existente', async () => {
    const dispo = { _id: 'disp-1', diaSemana: 1, horaDesde: '10:00', horaHasta: '11:00' };
    mockMedicoRepository.obtenerDisponibilidadPorId.mockResolvedValue(dispo);

    const resultado = await medicoService.obtenerDisponibilidad(MEDICO_ID, DISP_ID);

    expect(resultado).toEqual(dispo);
  });

  test('modificarDisponibilidad actualiza disponibilidad existente', async () => {
    const sede = { _id: 'sede-1', nombre: 'Sede Central' };
    const datosDisponibilidad = {
      diaSemana: 2,
      horaDesde: '14:00',
      horaHasta: '15:00',
      sede,
      especialidades: [],
      practicas: []
    };

    mockMedicoRepository.obtenerDisponibilidadPorId.mockResolvedValue({ _id: 'disp-1' });
    mockMedicoRepository.updateDisponibilidad.mockResolvedValue(true);
    mockMedicoRepository.obtenerDisponibilidadPorId.mockResolvedValue({
      _id: 'disp-1',
      ...datosDisponibilidad
    });

    const resultado = await medicoService.modificarDisponibilidad(MEDICO_ID, DISP_ID, datosDisponibilidad);

    expect(resultado).toEqual({ _id: 'disp-1', ...datosDisponibilidad });
    expect(mockMedicoRepository.updateDisponibilidad).toHaveBeenCalled();
  });

  test('eliminarServicios elimina especialidad', async () => {
    const medico = new Medico({ usuario: 'user-1', matricula: 'M-123', nombre: 'Dr. House' });
    medico.especialidades = [{ _id: ESP_ID, nombre: 'Cardiología' }];

    mockMedicoRepository.findById.mockResolvedValue(medico);
    mockMedicoRepository.save.mockResolvedValue(medico);
    mockEspecialidadService.eliminar.mockResolvedValue(true);

    await medicoService.eliminarServicios(MEDICO_ID, ESP_ID, null);

    expect(mockEspecialidadService.eliminar).toHaveBeenCalledWith(ESP_ID);
    expect(mockMedicoRepository.save).toHaveBeenCalled();
  });
});
