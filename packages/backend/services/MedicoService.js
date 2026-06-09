import { Medico } from "../domain/Medico/Medico.js";
import { MedicoRepository } from "../repositories/MedicoRepository.js";
import { UsuarioService } from "./UsuarioService.js";
import { DisponibilidadHoraria } from "../domain/Medico/DisponibilidadHoraria.js";
import { TurnoService } from "./TurnoService.js";
import { EspecialidadService } from "./EspecialidadService.js";
import { PracticaService } from "./PracticaService.js";
import { objectIdSchema } from "../validations/commonValidations.js";
import { SedeService } from "./SedeService.js";
import {
    NotFoundError,
    ConflictError,
    BadRequestError
} from "../errors/AppErrors.js";
import mongoose from 'mongoose';

export class MedicoService {
    constructor({
        medicoRepository = new MedicoRepository(),
        usuarioService = new UsuarioService(),
        especialidadService = new EspecialidadService(),
        practicaService = new PracticaService(),
        turnoService = new TurnoService(),
        sedeService = new SedeService()
    } = {}) {
        this.medicoRepository = medicoRepository;
        this.usuarioService = usuarioService;
        this.especialidadService = especialidadService;
        this.practicaService = practicaService;
        this.turnoService = turnoService;
        this.sedeService = sedeService;
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

        const datosUsuario = {
            nombreUsuario: datosMedico.nombreUsuario,
            // Solo se actualiza la contraseña si se provee una nueva
            ...(datosMedico.password ? { password: datosMedico.password } : {})
        };

        await this.usuarioService.actualizar(medicoExistente.usuario._id,datosUsuario);

        const datosMedicoParaActualizar = {
            matricula: datosMedico.matricula,
            nombre: datosMedico.nombre
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

    // ======================= SERVICIOS =============================

    async agregarServicios(medicoId, especialidades, practicas) {
        const validMedicoId = objectIdSchema.parse(String(medicoId));
        const medico = await this.obtenerPorId(validMedicoId); // lanza NotFoundError si no existe

        //Usaremos sesiones transaccionales. Si algo falla, se revierte completo y no se guardará nada.
        const session = await mongoose.startSession()
        session.startTransaction();

        try{
            for(const especialidad of especialidades){
                if (especialidad) {
                    const especialidadGenerica = await this.especialidadService.obtenerPorNombreGenerica(especialidad.nombre);
                    if (!especialidadGenerica) {
                        throw new NotFoundError(`La especialidad genérica '${especialidad.nombre}' no existe en el sistema.`);
                    }
                    if (medico.especialidadGenericaPertenece(especialidadGenerica._id)) {
                        throw new BadRequestError("El medico ya tiene la especialidad: "+ especialidad.nombre)
                    } 
                    const especialidadCreada = await this.especialidadService.crear(especialidad,especialidadGenerica._id, session)
                    medico.agregarEspecialidad(especialidadCreada);
                }
            }
            
            for(const practica of practicas){
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

                    const practicaCreada = await this.practicaService.crear(practica,practicaGenerica._id, session)
                    medico.agregarPractica(practicaCreada);
                }
            }

            const medicoGuardado = await this.medicoRepository.update(medico._id,medico, session);

            await session.commitTransaction();
            return medicoGuardado;

        } catch(error){
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async modificarServicio(medicoId, servicioId, servicio) {
        const validMedicoId = objectIdSchema.parse(String(medicoId));
        const validServicioId = objectIdSchema.parse(String(servicioId));
        const medico = await this.obtenerPorId(validMedicoId);

        // Detectar si es especialidad o practica por el campo que tiene el objeto
        const esEspecialidad = medico.especialidades.some(e => String(e._id || e) === String(validServicioId));
        const esPractica = medico.practicas.some(p => String(p._id || p) === String(validServicioId));

        if (!esEspecialidad && !esPractica) {
            throw new BadRequestError(`El servicio con ID ${validServicioId} no pertenece a este médico.`);
        }

        const disponibilidadesAfectadas = medico.disponibilidades.filter(dispo =>
            dispo.especialidades.some(e => String(e._id || e) === String(validServicioId)) ||
            dispo.practicas.some(p => String(p._id || p) === String(validServicioId))
        );

        if (esEspecialidad) {
            await this.especialidadService.actualizar(validServicioId, servicio);
        } else {
            await this.practicaService.actualizar(validServicioId, servicio);
        }

        for (const dispo of disponibilidadesAfectadas) {
            await this.turnoService.modificarTurnosPorDisponibilidadModificada(dispo);
        }

        return await this.medicoRepository.findById(validMedicoId);
    }

    async eliminarServicio(medicoId, servicioId, tipo) {
        const validMedicoId = objectIdSchema.parse(String(medicoId));
        const validServicioId = objectIdSchema.parse(String(servicioId));
        const medico = await this.obtenerPorId(validMedicoId);

        if (tipo === "especialidad") {
            const pertenece = medico.especialidades.some(e => String(e._id || e) === String(validServicioId));
            if (!pertenece) {
                throw new BadRequestError(`La especialidad con ID ${validServicioId} no pertenece a este médico.`);
            }
            medico.eliminarEspecialidad(validServicioId);
            await this.especialidadService.eliminar([validServicioId]);
        } else if (tipo === "practica") {
            const pertenece = medico.practicas.some(p => String(p._id || p) === String(validServicioId));
            if (!pertenece) {
                throw new BadRequestError(`La práctica con ID ${validServicioId} no pertenece a este médico.`);
            }
            medico.eliminarPractica(validServicioId);
            await this.practicaService.eliminar([validServicioId]);
        } else {
            throw new BadRequestError("El tipo debe ser 'especialidad' o 'practica'.");
        }

        const disposActualizadas = await this.limpiarServiciosDeDisponibilidades(
            validMedicoId,
            medico.disponibilidades,
            tipo === "especialidad" ? [validServicioId] : [],
            tipo === "practica" ? [validServicioId] : []
        );
        medico.disponibilidades = disposActualizadas;

        return await this.medicoRepository.update(medico._id, medico);
    }

    async limpiarServiciosDeDisponibilidades(medicoId, disponibilidades, especialidadesId, practicasId) {
        const espIds = especialidadesId.map(id => String(id));
        const pracIds = practicasId.map(id => String(id));

        const nuevoArrayDisponibilidades = [];

        for (const disponibilidad of disponibilidades) {
            let sufrioCambios = false;
            const dispoCopia = this.crearDispoCopia(disponibilidad)

            const tieneEsp = disponibilidad.especialidades.some(e => espIds.includes(String(e._id || e)));
            if (tieneEsp) {
                espIds.forEach(id => disponibilidad.eliminarEspecialidad(id));
                sufrioCambios = true;
            }

            const tienePrac = disponibilidad.practicas.some(p => pracIds.includes(String(p._id || p)));
            if (tienePrac) {
                pracIds.forEach(id => disponibilidad.eliminarPractica(id));
                sufrioCambios = true;
            }

            // Siempre conservamos la disponibilidad (con o sin cambios)
            nuevoArrayDisponibilidades.push(disponibilidad);

            if (sufrioCambios) {
                if(disponibilidad.especialidades.length === 0 && disponibilidad.practicas.length === 0){
                    await this.eliminarDisponibilidad(medicoId,disponibilidad._id)
                }
                else{
                    // Notificamos al servicio de turnos sobre los cambios en la disponibilidad
                    await this.turnoService.modificarTurnosDisponibilidad(disponibilidad, dispoCopia);
                }
            }
        }

        return nuevoArrayDisponibilidades
    
    }
    
    // ======================= DISPONIBILIDADES =============================
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
        
        //Validacion de que el medico exista
        const medico = await this.obtenerPorId(validMedicoId);

        const contieneSede = medico.sedes.some(s => (s.nombre === datosDisponibilidad.sede.nombre) 
                                                    && (s.direccion === datosDisponibilidad.sede.direccion))
        if(!contieneSede){
            throw new BadRequestError(`El medico no tiene la sede ${datosDisponibilidad.sede.nombre}`)
        }

        if( (!datosDisponibilidad.especialidades || datosDisponibilidad.especialidades == null || datosDisponibilidad.especialidades == [] ) && 
            (!datosDisponibilidad.practicas || datosDisponibilidad.practicas == null || datosDisponibilidad.practicas == [] ) ) {
            throw new BadRequestError(`La disponibilidad debe contar con al menos 1 especialidad o practica para la generacion de turnos`)
        }

        const dispo = new DisponibilidadHoraria({
            diaSemana: datosDisponibilidad.diaSemana,
            horaDesde: datosDisponibilidad.horaDesde,
            horaHasta: datosDisponibilidad.horaHasta,
            sede: datosDisponibilidad.sede,
            especialidades : datosDisponibilidad.especialidades || [],
            practicas : datosDisponibilidad.practicas || []
        });

        const medicoActualizado = await this.medicoRepository.addDisponibilidad(validMedicoId, dispo);

        const dispoList = medicoActualizado.disponibilidades || [];

        return dispoList[dispoList.length - 1] || null;
    }

    async modificarDisponibilidad(medicoId, disponibilidadId, datosDisponibilidad) {
        const validMedicoId = objectIdSchema.parse(String(medicoId));
        const validDispoId = objectIdSchema.parse(String(disponibilidadId));
        
        const medico = await this.obtenerPorId(validMedicoId);

        const contieneSede = medico.sedes.some(s => (s.nombre === datosDisponibilidad.sede.nombre) 
                                                    && (s.direccion === datosDisponibilidad.sede.direccion))
        if(!contieneSede){
            throw new BadRequestError(`El medico no tiene la sede ${datosDisponibilidad.sede.nombre}`)
        }

        // si no funciona agarramos la dispo desde el repo y la reecribimos en el medico
        const dispo = medico.disponibilidades.find(d => d._id.toString() === validDispoId)
        if (!dispo) throw new NotFoundError("Disponibilidad no encontrada")

        const dispoCopia = this.crearDispoCopia(dispo) // COPIA PARA PASARLA AL TURNO SERVICE
        
        if (dispo.sede) dispo.sede = datosDisponibilidad.sede
        if (dispo.especialidades) dispo.especialidades = datosDisponibilidad.especialidades
        if (dispo.practicas) dispo.practicas = datosDisponibilidad.practicas
        
        // TODO mandamos la vieja y la updateada al turnoService
        await this.turnoService.modificarTurnosDisponibilidad(dispo, dispoCopia)

        return await this.medicoRepository.update(validMedicoId, medico);
    }

    obtenerDispoCopia(dispo){
        return new DisponibilidadHoraria({
            diaSemana: dispo.diaSemana,
            horaDesde: dispo.horaDesde,
            horaHasta: dispo.horaHasta,
            sede: dispo.sede,
            especialidades: [...(dispo.especialidades || [])],
            practicas: [...(dispo.practicas || [])]
        });
    }

    async eliminarDisponibilidad(medicoId, disponibilidadId){
        const validMedicoId = objectIdSchema.parse(String(medicoId));
        const validDispoId = objectIdSchema.parse(String(disponibilidadId));

        const medico = await this.obtenerPorId(validMedicoId);

        const dispo = medico.disponibilidades.find(d => d._id.toString() === validDispoId)
        if (!dispo) throw new NotFoundError("Disponibilidad no encontrada");

        medico.eliminarDisponibilidad(validDispoId);
        
        await this.turnoService.eliminarTurnosDisponibilidad(dispo)

        const medicoActualizado = await this.medicoRepository.update(validMedicoId, medico);

        return medicoActualizado
    }

    // ======================= SEDES =============================
    async agregarSedes(medicoId, sedesId){
        const validMedicoId = objectIdSchema.parse(String(medicoId));

        const medico = await this.obtenerPorId(validMedicoId)        

        for (const id of sedesId) {
            const validSedeId = objectIdSchema.parse(String(id));
            
            //las sedes deben ya existir, las crean "los admins"
            const sede = await this.sedeService.obtenerPorId(validSedeId);

            medico.agregarSede(sede);
        }

        const medicoActualizado = await this.medicoRepository.update(validMedicoId, medico);

        return medicoActualizado
    }

    async quitarSedes(medicoId, sedesId) {
        const validMedicoId = objectIdSchema.parse(String(medicoId));

        const medico = await this.obtenerPorId(validMedicoId); // lanza NotFoundError si no existe
        
        medico.eliminarSedes(sedesId)

        for (const dispo of medico.disponibilidades) {
            if(sedesId.includes(dispo.sede._id)) {
                medico.eliminarDisponibilidad(dispo.sede._id);

                await this.turnoService.eliminarTurnosDisponibilidad(dispo)
            }
        }

        const medicoActualizado = await this.medicoRepository.update(validMedicoId, medico);

        return medicoActualizado;
    }
}