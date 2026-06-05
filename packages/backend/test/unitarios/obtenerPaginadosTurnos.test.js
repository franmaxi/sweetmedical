import { describe, expect, test, beforeEach, jest } from '@jest/globals';

import { TurnoService } from '../../services/TurnoService.js';
import { NivelCobertura } from '../../domain/Enumerados/NivelCobertura.js';
import { EstadoTurno } from '../../domain/Enumerados/EstadoTurno.js';
import { NotFoundError, BadRequestError } from '../../errors/AppErrors.js';

// ─────────────────────────────────────────────
// FACTORIES
// ─────────────────────────────────────────────

const createMocks = () => ({
    turnoRepository: {
        obtenerPaginados: jest.fn(),
    },
    pacienteRepository: {
        findById: jest.fn(),
    },
});

const crearPlan = ({ coberturaEspecialidad = [], coberturaPractica = [] } = {}) => ({
    coberturaEspecialidad,
    coberturaPractica,
    obtenerCoberturaEspecialidad(especialidad) {
        const generica = especialidad?.especialidadGenerica ?? especialidad;
        const c = coberturaEspecialidad.find(
            c => c.especialidadGenerica?.toString() === generica?.toString()
        );
        return c ?? null; // devuelve objeto completo { nivel, pocentajeDescuento }
    },
    obtenerCoberturaPractica(practica) {
        const generica = practica?.practicaGenerica ?? practica;
        const c = coberturaPractica.find(
            c => c.practicaGenerica?.toString() === generica?.toString()
        );
        return c ?? null;
    },
});

const crearEspecialidad = ({ id = 'esp-1', nombre = 'Cardiología', costo = 1000, especialidadGenerica = 'gen-1' } = {}) => ({
    _id: id,
    nombre,
    costo,
    especialidadGenerica,
    calcularCostoSegunCobertura(cobertura) {
        if (!cobertura) return costo;
        if (cobertura.nivel === NivelCobertura.TOTAL) return 0;
        if (cobertura.nivel === NivelCobertura.PARCIAL) return costo * (1 - cobertura.pocentajeDescuento / 100);
        return costo;
    },
});

const crearPractica = ({ id = 'prac-1', nombre = 'Electrocardiograma', costo = 500, practicaGenerica = 'prac-gen-1' } = {}) => ({
    _id: id,
    nombre,
    costo,
    practicaGenerica,
    calcularCostoSegunCobertura(cobertura) {
        if (!cobertura) return costo;
        if (cobertura.nivel === NivelCobertura.TOTAL) return 0;
        if (cobertura.nivel === NivelCobertura.PARCIAL) return costo * (1 - cobertura.pocentajeDescuento / 100);
        return costo;
    },
});

const crearPaciente = ({ plan = crearPlan() } = {}) => ({
    _id: 'pac-1',
    nombre: 'Juan Pérez',
    plan: 'plan-id-1',
    obraSocial: {
        planes: [{ ...plan, _id: 'plan-id-1' }]
    }
});

const crearTurno = ({ id = 'turno-1', especialidades = [], practicas = [] } = {}) => ({
    _id: id,
    medico: { _id: 'med-1', nombre: 'Dr. García' },
    especialidad: especialidades,
    practica: practicas,
    fechaHora: new Date('2025-06-01T10:00:00'),
    sede: { _id: 'sede-1', nombre: 'Sede Central', direccion: 'Av. Siempre Viva 742' },
    estado: EstadoTurno.DISPONIBLE,
});

const respuestaRepo = (turnos = []) => ({
    turnos,
    totalTurnos: turnos.length,
    totalPaginas: 1,
});

// ─────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────

describe('TurnoService - obtenerTodosCobertura', () => {
    let mocks;
    let service;

    beforeEach(() => {
        mocks = createMocks();
        service = new TurnoService(mocks);
    });

    describe('errores básicos', () => {

        test('lanza NotFoundError si el paciente no existe', async () => {
            mocks.pacienteRepository.findById.mockResolvedValue(null);

            await expect(
                service.obtenerTodosCobertura({ pacienteId: 'pac-inexistente' })
            ).rejects.toThrow(NotFoundError);
        });

        test('lanza BadRequestError si se ordena por costo sin filtro de especialidad o práctica', async () => {
            mocks.pacienteRepository.findById.mockResolvedValue(crearPaciente());

            await expect(
                service.obtenerTodosCobertura({
                    pacienteId: 'pac-1',
                    ordenamiento: [{ campo: 'costoFinal', direccion: 'asc' }],
                })
            ).rejects.toThrow(BadRequestError);
        });

        test('no lanza error si se ordena por costo con filtro de especialidad', async () => {
            mocks.pacienteRepository.findById.mockResolvedValue(crearPaciente());
            mocks.turnoRepository.obtenerPaginados.mockResolvedValue(respuestaRepo());

            const resultado = await service.obtenerTodosCobertura({
                pacienteId: 'pac-1',
                filtros: { especialidadId: 'gen-1' },
                ordenamiento: [{ campo: 'costoFinal', direccion: 'asc' }],
            });

            expect(resultado).toBeDefined();
        });

        test('no lanza error si se ordena por costo con filtro de práctica', async () => {
            mocks.pacienteRepository.findById.mockResolvedValue(crearPaciente());
            mocks.turnoRepository.obtenerPaginados.mockResolvedValue(respuestaRepo());

            const resultado = await service.obtenerTodosCobertura({
                pacienteId: 'pac-1',
                filtros: { practicaId: 'prac-gen-1' },
                ordenamiento: [{ campo: 'costoFinal', direccion: 'asc' }],
            });

            expect(resultado).toBeDefined();
        });
    });

    describe('costoFinal según cobertura', () => {

        test('devuelve costoFinal 0 cuando la cobertura es TOTAL', async () => {
            const plan = crearPlan({
                coberturaEspecialidad: [{ especialidadGenerica: 'gen-1', nivel: NivelCobertura.TOTAL, pocentajeDescuento: 100 }],
            });
            mocks.pacienteRepository.findById.mockResolvedValue(crearPaciente({ plan }));
            mocks.turnoRepository.obtenerPaginados.mockResolvedValue(
                respuestaRepo([crearTurno({ especialidades: [crearEspecialidad({ costo: 1000 })] })])
            );

            const resultado = await service.obtenerTodosCobertura({ pacienteId: 'pac-1' });

            expect(resultado.turnos[0].especialidades[0].costoFinal).toBe(0);
        });

        test('devuelve costoFinal al 50% cuando la cobertura es PARCIAL', async () => {
            const plan = crearPlan({
                coberturaEspecialidad: [{ especialidadGenerica: 'gen-1', nivel: NivelCobertura.PARCIAL, pocentajeDescuento: 50 }],
            });
            mocks.pacienteRepository.findById.mockResolvedValue(crearPaciente({ plan }));
            mocks.turnoRepository.obtenerPaginados.mockResolvedValue(
                respuestaRepo([crearTurno({ especialidades: [crearEspecialidad({ costo: 1000 })] })])
            );

            const resultado = await service.obtenerTodosCobertura({ pacienteId: 'pac-1' });

            expect(resultado.turnos[0].especialidades[0].costoFinal).toBe(500);
        });

        test('devuelve el costo completo cuando no hay cobertura', async () => {
            mocks.pacienteRepository.findById.mockResolvedValue(crearPaciente());
            mocks.turnoRepository.obtenerPaginados.mockResolvedValue(
                respuestaRepo([crearTurno({ especialidades: [crearEspecialidad({ costo: 1000 })] })])
            );

            const resultado = await service.obtenerTodosCobertura({ pacienteId: 'pac-1' });

            expect(resultado.turnos[0].especialidades[0].costoFinal).toBe(1000);
        });

        test('calcula costoFinal para prácticas con cobertura PARCIAL', async () => {
            const plan = crearPlan({
                coberturaPractica: [{ practicaGenerica: 'prac-gen-1', nivel: NivelCobertura.PARCIAL, pocentajeDescuento: 50 }],
            });
            mocks.pacienteRepository.findById.mockResolvedValue(crearPaciente({ plan }));
            mocks.turnoRepository.obtenerPaginados.mockResolvedValue(
                respuestaRepo([crearTurno({ practicas: [crearPractica({ costo: 500 })] })])
            );

            const resultado = await service.obtenerTodosCobertura({ pacienteId: 'pac-1' });

            expect(resultado.turnos[0].practicas[0].costoFinal).toBe(250);
        });

        test('calcula costoFinal para prácticas con cobertura TOTAL', async () => {
            const plan = crearPlan({
                coberturaPractica: [{ practicaGenerica: 'prac-gen-1', nivel: NivelCobertura.TOTAL, pocentajeDescuento: 100 }],
            });
            mocks.pacienteRepository.findById.mockResolvedValue(crearPaciente({ plan }));
            mocks.turnoRepository.obtenerPaginados.mockResolvedValue(
                respuestaRepo([crearTurno({ practicas: [crearPractica({ costo: 500 })] })])
            );

            const resultado = await service.obtenerTodosCobertura({ pacienteId: 'pac-1' });

            expect(resultado.turnos[0].practicas[0].costoFinal).toBe(0);
        });

        test('calcula costoFinal para múltiples especialidades con distintas coberturas', async () => {
            const plan = crearPlan({
                coberturaEspecialidad: [
                    { especialidadGenerica: 'gen-1', nivel: NivelCobertura.TOTAL,   pocentajeDescuento: 100 },
                    { especialidadGenerica: 'gen-2', nivel: NivelCobertura.PARCIAL, pocentajeDescuento: 50  },
                ],
            });
            const turno = crearTurno({
                especialidades: [
                    crearEspecialidad({ id: 'esp-1', costo: 1000, especialidadGenerica: 'gen-1' }),
                    crearEspecialidad({ id: 'esp-2', costo: 800,  especialidadGenerica: 'gen-2' }),
                ],
            });

            mocks.pacienteRepository.findById.mockResolvedValue(crearPaciente({ plan }));
            mocks.turnoRepository.obtenerPaginados.mockResolvedValue(respuestaRepo([turno]));

            const resultado = await service.obtenerTodosCobertura({ pacienteId: 'pac-1' });
            const especialidades = resultado.turnos[0].especialidades;

            expect(especialidades[0].costoFinal).toBe(0);   // TOTAL
            expect(especialidades[1].costoFinal).toBe(400); // PARCIAL
        });
    });

    describe('estructura del turno devuelto', () => {

        test('mapea correctamente los campos del turno', async () => {
            const turno = crearTurno({ especialidades: [crearEspecialidad()] });
            mocks.pacienteRepository.findById.mockResolvedValue(crearPaciente());
            mocks.turnoRepository.obtenerPaginados.mockResolvedValue(respuestaRepo([turno]));

            const resultado = await service.obtenerTodosCobertura({ pacienteId: 'pac-1' });
            const t = resultado.turnos[0];

            expect(t.id).toBe('turno-1');
            expect(t.profesional).toEqual({ id: 'med-1', nombre: 'Dr. García' });
            expect(t.sede).toEqual({ id: 'sede-1', nombre: 'Sede Central', direccion: 'Av. Siempre Viva 742' });
            expect(t.estado).toBe(EstadoTurno.DISPONIBLE);
            expect(t.fechaHora).toBeInstanceOf(Date);
        });

        test('mapea correctamente los campos de especialidad devuelta', async () => {
            const plan = crearPlan({
                coberturaEspecialidad: [{ especialidadGenerica: 'gen-1', nivel: NivelCobertura.PARCIAL, pocentajeDescuento: 50 }],
            });
            const turno = crearTurno({
                especialidades: [crearEspecialidad({ id: 'esp-1', nombre: 'Cardiología', costo: 800 })],
            });
            mocks.pacienteRepository.findById.mockResolvedValue(crearPaciente({ plan }));
            mocks.turnoRepository.obtenerPaginados.mockResolvedValue(respuestaRepo([turno]));

            const resultado = await service.obtenerTodosCobertura({ pacienteId: 'pac-1' });
            const esp = resultado.turnos[0].especialidades[0];

            expect(esp.id).toBe('esp-1');
            expect(esp.nombre).toBe('Cardiología');
            expect(esp.cobertura).toBe(NivelCobertura.PARCIAL);
            expect(esp.costoFinal).toBe(400);
        });

        test('devuelve listas vacías de especialidades y prácticas si el turno no tiene ninguna', async () => {
            mocks.pacienteRepository.findById.mockResolvedValue(crearPaciente());
            mocks.turnoRepository.obtenerPaginados.mockResolvedValue(
                respuestaRepo([crearTurno()])
            );

            const resultado = await service.obtenerTodosCobertura({ pacienteId: 'pac-1' });
            const t = resultado.turnos[0];

            expect(t.especialidades).toEqual([]);
            expect(t.practicas).toEqual([]);
        });
    });

    describe('paginación', () => {

        test('retorna los datos de paginación correctamente', async () => {
            mocks.pacienteRepository.findById.mockResolvedValue(crearPaciente());
            mocks.turnoRepository.obtenerPaginados.mockResolvedValue({
                turnos: [], totalTurnos: 50, totalPaginas: 5,
            });

            const resultado = await service.obtenerTodosCobertura({
                pacienteId: 'pac-1',
                numeroPagina: 2,
                limitePorPagina: 10,
            });

            expect(resultado.totalTurnos).toBe(50);
            expect(resultado.totalPaginas).toBe(5);
            expect(resultado.numeroPagina).toBe(2);
            expect(resultado.limitePorPagina).toBe(10);
        });
    });

    describe('interacción con el repository', () => {

        test('siempre pasa estado DISPONIBLE en los filtros', async () => {
            mocks.pacienteRepository.findById.mockResolvedValue(crearPaciente());
            mocks.turnoRepository.obtenerPaginados.mockResolvedValue(respuestaRepo());

            await service.obtenerTodosCobertura({
                pacienteId: 'pac-1',
                filtros: { sedeId: 'sede-1' },
            });

            const [, , filtrosUsados] = mocks.turnoRepository.obtenerPaginados.mock.calls[0];
            expect(filtrosUsados.estado).toBe(EstadoTurno.DISPONIBLE);
        });

        test('pasa el ordenamiento al repository', async () => {
            const ordenamiento = [{ campo: 'fechaHora', direccion: 'desc' }];
            mocks.pacienteRepository.findById.mockResolvedValue(crearPaciente());
            mocks.turnoRepository.obtenerPaginados.mockResolvedValue(respuestaRepo());

            await service.obtenerTodosCobertura({ pacienteId: 'pac-1', ordenamiento });

            const [, , , ordenamientoUsado] = mocks.turnoRepository.obtenerPaginados.mock.calls[0];
            expect(ordenamientoUsado).toEqual(ordenamiento);
        });

        test('pasa numeroPagina y limitePorPagina al repository', async () => {
            mocks.pacienteRepository.findById.mockResolvedValue(crearPaciente());
            mocks.turnoRepository.obtenerPaginados.mockResolvedValue(respuestaRepo());

            await service.obtenerTodosCobertura({
                pacienteId: 'pac-1',
                numeroPagina: 3,
                limitePorPagina: 20,
            });

            const [numeroPagina, limitePorPagina] = mocks.turnoRepository.obtenerPaginados.mock.calls[0];
            expect(numeroPagina).toBe(3);
            expect(limitePorPagina).toBe(20);
        });
    });
});