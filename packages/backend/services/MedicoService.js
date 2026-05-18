import { Medico } from "../domain/Medico/Medico.js";
import { EstadoTurno } from "../domain/Enumerados/EstadoTurno.js";
import { MedicoRepository } from "../repositories/MedicoRepository.js";
import { UsuarioService } from "./UsuarioService.js";
import { DisponibilidadHoraria } from "../domain/Medico/DisponibilidadHoraria.js";
import { TurnoService } from "./TurnoService.js";
import { EspecialidadService } from "./EspecialidadService.js";
import { PracticaService } from "./PracticaService.js";
import { objectIdSchema } from "../validations/commonValidations.js";
import {
    NotFoundError,
    UnprocessableEntityError,
    ConflictError,
    BadRequestError
} from "../errors/AppErrors.js";

export class MedicoService {
    constructor({
        medicoRepository = new MedicoRepository(),
        usuarioService = new UsuarioService(),
        especialidadService = new EspecialidadService(),
        practicaService = new PracticaService(),
        turnoService = new TurnoService()
    } = {}) {
        this.medicoRepository = medicoRepository;
        this.usuarioService = usuarioService;
        this.especialidadService = especialidadService;
        this.practicaService = practicaService;
        this.turnoService = turnoService;
    }

    async obtenerTodos({ numeroPagina = 1, limitePorPagina = 10, filtros = {} } = {}) {
        const { medicos, totalMedicos } = await this.medicoRepository.obtenerPaginados(
            numeroPagina,
            limitePorPagina,
            filtros
        );
        const totalPaginas = totalMedicos === 0 ? 0 : Math.ceil(totalMedicos / limitePorPagina);
        return {
            medicos,
            numeroPagina,
            limitePorPagina,
            totalPaginas,
            totalMedicos
        };
    }

    async obtenerPorId(id) {
        const validId = objectIdSchema.parse(String(id));
        const medico = await this.medicoRepository.findById(validId);
        if (!medico) {
            throw new NotFoundError("Medico no encontrado");
        }
        return medico;
    }

    async crear(datosMedico) {
        if (await this.existeMatricula(datosMedico.matricula)) {
            throw new ConflictError("Ya existe un médico con esa matrícula");
        }

        const usuarioCreado = await this.usuarioService.crear({ //TODO se puede implementar un factory
            nombreUsuario: datosMedico.nombreUsuario,
            password: datosMedico.password
        });

        const medico = new Medico({
            usuario: usuarioCreado._id,
            matricula: datosMedico.matricula,
            nombre: datosMedico.nombre
        });

        return await this.medicoRepository.save(medico);
    }

    async actualizar(id, datosMedico) {
        const validId = objectIdSchema.parse(String(id));
        const medicoExistente = await this.obtenerPorId(validId);
        
        if (medicoExistente.matricula !== datosMedico.matricula && await this.existeMatricula(datosMedico.matricula)) {
            throw new ConflictError("Ya existe un médico con esa matrícula");
        }

        for (const especialidadId of datosMedico.especialidades) {
            if (!await this.especialidadService.findById(especialidadId)) {
                throw new NotFoundError(`Especialidad ${especialidadId} no encontrada`);
            }
        }
        for (const practicaId of datosMedico.practicas) {
            if (!await this.practicaService.findById(practicaId)) {
                throw new NotFoundError(`Practica ${practicaId} no encontrada`);
            }
        }

        const datosUsuario = {
            nombreUsuario: datosMedico.nombreUsuario,
            password: datosMedico.password || medicoExistente.usuario.password 
        };

        await this.usuarioService.actualizar(medicoExistente.usuario._id,datosUsuario);

        const datosMedicoParaActualizar = {
            matricula: datosMedico.matricula,
            nombre: datosMedico.nombre,
            especialidades: datosMedico.especialidades,
            practicas: datosMedico.practicas,
            sedes: datosMedico.sedes,
            disponibilidades: datosMedico.disponibilidades
        };

        return await this.medicoRepository.update(validId,datosMedicoParaActualizar);
    }

    async eliminar(id) {
        const validId = objectIdSchema.parse(String(id));
        const medico = await this.obtenerPorId(validId);
        const usuario = await this.usuarioService.obtenerPorId(medico.usuario._id);
        
        await this.usuarioService.eliminar(usuario._id);
        return await this.medicoRepository.delete(medico._id);
    }

    async existeMatricula(matricula) {
        const medico = await this.medicoRepository.obtenerPorMatricula(matricula);
        return medico !== null;
    }

    // Este metodo se usara siempre con un servicio null.
    async agregarServicio(medicoId, especialidad, practica) {
        const validMedicoId = objectIdSchema.parse(String(medicoId));
        const medico = await this.obtenerPorId(validMedicoId);
        if (!medico) throw new NotFoundError("Medico no encontrado");

        if (especialidad) {
            const especialidadGenerica = await this.especialidadService.obtenerPorNombreGenerica(especialidad.nombre);
            if (!especialidadGenerica) {
                throw new NotFoundError(`La especialidad genérica '${especialidad.nombre}' no existe en el sistema.`);
            }
            if (medico.especialidadGenericaPertenece(especialidadGenerica._id)) {
                throw new BadRequestError("El medico ya tiene la especialidad: "+ especialidad.nombre)
            } 
            const especialidadCreada = await this.especialidadService.crear(especialidad)
            medico.agregarEspecialidad(especialidadCreada);
        }

        if (practica) {
            const practicaGenerica = await this.practicaService.obtenerPorCodigoGenerica(practica.codigo);
            if (!practicaGenerica) {
                throw new NotFoundError(`La práctica genérica con código '${practica.codigo}' no existe en el sistema.`);
            }
            if (practicaGenerica.nombre.toLowerCase() !== practica.nombre.toLowerCase()) {
                throw new BadRequestError(`El código '${practica.codigo}' corresponde a la práctica '${practicaGenerica.nombre}', no a '${practica.nombre}'.`);
            }

            if (medico.practicaGenericaPertenece(practicaGenerica._id)) {
                throw new BadRequestError("El médico ya tiene asignada la práctica: " + practica.nombre);
            }

            const practicaCreada = await this.practicaService.crear(practica)
            medico.agregarPractica(practicaCreada);
        }

        return await this.medicoRepository.save(medico);
    }

    async modificarServicio(medicoId, especialidad, practica) {
        const validMedicoId = objectIdSchema.parse(String(medicoId));
        const medico = await this.obtenerPorId(validMedicoId);
        if (!medico) throw new NotFoundError("Medico no encontrado");

        if (especialidad) {
            // No hace falta modificar la lista de especialidades del medico, porq ya apunta al objeto que modificamos
            await this.especialidadService.actualizar(especialidad._id, especialidad);
            //TODO tener en cuenta como se modifican los turnos
        }

        if (practica) {
            await this.practicaService.actualizar(practica._id, practica);
        }

        return await this.medicoRepository.findById(validMedicoId);
    }

    async eliminarServicios(medicoId, especialidadId, practicaId) {
        const validMedicoId = objectIdSchema.parse(String(medicoId));
        const medico = await this.obtenerPorId(validMedicoId);
        if (!medico) throw new NotFoundError("Medico no encontrado");

        if (especialidadId) {
            const validEspId = objectIdSchema.parse(String(especialidadId));
            medico.eliminarEspecialidad(validEspId);
            await this.especialidadService.eliminar(validEspId);
            //TODO tener en cuenta como se modifican los turnos
        
        } else if (practicaId) {
            const validPracId = objectIdSchema.parse(String(practicaId));
            medico.eliminarPractica(validPracId);
            await this.practicaService.eliminar(validPracId);
        }

        return await this.medicoRepository.save(medico);
    }
    
    async obtenerDisponibilidades(medicoId) {
        const validMedicoId = objectIdSchema.parse(String(medicoId));
        return await this.medicoRepository.getDisponibilidades(validMedicoId);
    }

    async obtenerDisponibilidad(medicoId, dispoId) {
        const validMedicoId = objectIdSchema.parse(String(medicoId));
        const validDispoId = objectIdSchema.parse(String(dispoId));
        const dispo = await this.medicoRepository.obtenerDisponibilidadPorId(validMedicoId, validDispoId);
        if (!dispo) throw new NotFoundError("Disponibilidad no encontrada");
        return dispo;
    }

    async crearDisponibilidad(medicoId, datosDisponibilidad) {
        const validMedicoId = objectIdSchema.parse(String(medicoId));
        
        const dispo = new DisponibilidadHoraria({
            diaSemana: datosDisponibilidad.diaSemana,
            horaDesde: datosDisponibilidad.horaDesde,
            horaHasta: datosDisponibilidad.horaHasta,
            sede: datosDisponibilidad.sede
        });
        
        dispo.especialidades = datosDisponibilidad.especialidades || [];
        dispo.practicas = datosDisponibilidad.practicas || [];

        const medicoActualizado = await this.medicoRepository.addDisponibilidad(validMedicoId, dispo);
        const dispoList = medicoActualizado.disponibilidades || [];
        return dispoList[dispoList.length - 1] || null;
    }

    async modificarDisponibilidad(medicoId, disponibilidadId, datosDisponibilidad) {
        const validMedicoId = objectIdSchema.parse(String(medicoId));
        const validDispoId = objectIdSchema.parse(String(disponibilidadId));

        const dispoExistente = await this.medicoRepository.obtenerDisponibilidadPorId(validMedicoId, validDispoId);
        if (!dispoExistente) throw new NotFoundError("Disponibilidad no encontrada");

        const dispo = new DisponibilidadHoraria({
            diaSemana: datosDisponibilidad.diaSemana,
            horaDesde: datosDisponibilidad.horaDesde,
            horaHasta: datosDisponibilidad.horaHasta,
            sede: datosDisponibilidad.sede
        });

        dispo.especialidades = datosDisponibilidad.especialidades || [];
        dispo.practicas = datosDisponibilidad.practicas || [];
        dispo._id = validDispoId;

        await this.medicoRepository.updateDisponibilidad(validMedicoId, validDispoId, dispo);
        return await this.medicoRepository.obtenerDisponibilidadPorId(validMedicoId, validDispoId);
    }
}
