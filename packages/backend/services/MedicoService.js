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
import mongoose, { mongo } from 'mongoose';

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
            password: datosMedico.password || medicoExistente.usuario.password 
        };

        await this.usuarioService.actualizar(medicoExistente.usuario._id,datosUsuario);

        const datosMedicoParaActualizar = {
            matricula: datosMedico.matricula,
            nombre: datosMedico.nombre,
            sedes: datosMedico.sedes, //TODO
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
        const medico = await this.obtenerPorId(validMedicoId);
        if (!medico) throw new NotFoundError("Medico no encontrado");

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

    async modificarServicios(medicoId, especialidades, practicas) {
        const validMedicoId = objectIdSchema.parse(String(medicoId));
        const medico = await this.obtenerPorId(validMedicoId);
        if (!medico) throw new NotFoundError("Medico no encontrado");

        const session = await mongoose.startSession()
        session.startTransaction();
        try{
            for(const especialidad of especialidades){
                if (especialidad) {
                    const pertenece = medico.especialidades.some(e => String(e._id || e) === String(especialidad._id));
                    if (!pertenece) {
                        throw new BadRequestError(`La especialidad con ID ${especialidad._id} no pertenece a este médico.`);
                    }
                    // No hace falta modificar la lista de especialidades del medico, porq ya apunta al objeto que modificamos
                    await this.especialidadService.actualizar(especialidad._id, especialidad, session);
                    //TODO tener en cuenta como se modifican los turnos
                }
            }
        
            for(const practica of practicas){
                if (practica) {
                    const pertenece = medico.practicas.some(e => String(e._id || e) === String(practica._id));
                    if (!pertenece) {
                        throw new BadRequestError(`La practica con ID ${practica._id} no pertenece a este médico.`);
                    }
                    await this.practicaService.actualizar(practica._id, practica, session);
                }
            }
            await session.commitTransaction();

            return await this.medicoRepository.findById(validMedicoId);

        } catch(error){
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
        
    }

    async eliminarServicios(medicoId, especialidadesId = [], practicasId = []) {
        const validMedicoId = objectIdSchema.parse(String(medicoId));
        const medico = await this.obtenerPorId(validMedicoId);

        if (!medico) throw new NotFoundError("Medico no encontrado");
        
        const listaEsp = especialidadesId ?? [];
        const listaPrac = practicasId ?? [];

        const session = await mongoose.startSession()
        session.startTransaction();
        try{

            for(const especialidadId of listaEsp){
                const validEspId = objectIdSchema.parse(String(especialidadId));

                const pertenece = medico.especialidades.some(e => String(e._id || e) === String(validEspId));
                if (!pertenece) {
                    throw new BadRequestError(`La especialidad con ID ${validEspId} no pertenece a este médico.`);
                }

                medico.eliminarEspecialidad(validEspId);
                
                //TODO tener en cuenta como se modifican los turnos disponibles
            }


            for (const practicaId of listaPrac){
                const validPracId = objectIdSchema.parse(String(practicaId));

                const pertenece = medico.practicas.some(e => String(e._id || e) === String(validPracId));
                if (!pertenece) {
                    throw new BadRequestError(`La practica con ID ${validPracId} no pertenece a este médico.`);
                }

                medico.eliminarPractica(validPracId);
            }

            await this.especialidadService.eliminar(listaEsp, session);
            await this.practicaService.eliminar(listaPrac, session);

            const { modificadas, eliminadas } = this.limpiarServiciosDeDisponibilidades(medico.disponibilidades, listaEsp, listaPrac)

            const medicoGuardado = await this.medicoRepository.update(medico._id,medico, session);
            
            await session.commitTransaction();

            return medicoGuardado

        } catch(error){
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
        //TODO si se elimina una q solo esta en un lugar, se debe eliminar la dispo
    }

    limpiarServiciosDeDisponibilidades(disponibilidades, especialidadesId, practicasId) {
    const espIds = especialidadesId.map(id => String(id));
    const pracIds = practicasId.map(id => String(id));

    const disponibilidadesModificadas = [];
    const disponibilidadesEliminadas = [];
    const nuevoArrayDisponibilidades = [];

    for (const disponibilidad of disponibilidades) {
        let sufrioCambios = false;
        const dispoIdStr = String(disponibilidad._id);

        // 1. Verificar si tiene especialidades a quitar
        const tieneEsp = disponibilidad.especialidades.some(e => espIds.includes(String(e._id || e)));
        if (tieneEsp) {
            espIds.forEach(id => disponibilidad.eliminarEspecialidad(id));
            sufrioCambios = true;
        }

        // 2. Verificar si tiene prácticas a quitar
        const tienePrac = disponibilidad.practicas.some(p => pracIds.includes(String(p._id || p)));
        if (tienePrac) {
            pracIds.forEach(id => disponibilidad.eliminarPractica(id));
            sufrioCambios = true;
        }

        // 3. Decidir el destino de la disponibilidad
        if (disponibilidad.especialidades.length === 0 && disponibilidad.practicas.length === 0) {
            // Se quedó vacía: va a la lista de eliminadas y NO se guarda en el nuevo array
            disponibilidadesEliminadas.push(dispoIdStr);
        } else if (sufrioCambios) {
            // Se modificó pero aún le quedan otros servicios: se guarda y se registra
            disponibilidadesModificadas.push(dispoIdStr);
            nuevoArrayDisponibilidades.push(disponibilidad);
        } else {
            // No sufrió ningún cambio: se guarda tal cual
            nuevoArrayDisponibilidades.push(disponibilidad);
        }
    }

    // Reemplazamos el array completo del médico con el filtrado
    disponibilidades = nuevoArrayDisponibilidades;

    // LE DEVOLVEMOS EL REPORTE AL SERVICIO
    return {
        modificadas: disponibilidadesModificadas, // IDs de las que cambiaron parcialmente
        eliminadas: disponibilidadesEliminadas    // IDs de las que desaparecieron
    };
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
        const medico = this.obtenerPorId(validMedicoId);

        const contieneSede = medico.sedes.some(s => (s.nombre === datosDisponibilidad.sede.nombre) 
                                                    && (s.direccion === datosDisponibilidad.sede.direccion))
        if(!contieneSede){
            throw new BadRequestError(`El medico no tiene la sede ${datosDisponibilidad.sede.nombre}`)
        }

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

        const medico = this.obtenerPorId(validMedicoId);

        const contieneSede = medico.sedes.some(s => (s.nombre === datosDisponibilidad.sede.nombre) 
                                                    && (s.direccion === datosDisponibilidad.sede.direccion))
        if(!contieneSede){
            throw new BadRequestError(`El medico no tiene la sede ${datosDisponibilidad.sede.nombre}`)
        }

        await this.obtenerDisponibilidad(validMedicoId, validDispoId)

        const dispo = new DisponibilidadHoraria({
            diaSemana: datosDisponibilidad.diaSemana,
            horaDesde: datosDisponibilidad.horaDesde,
            horaHasta: datosDisponibilidad.horaHasta,
            sede: datosDisponibilidad.sede
        });

        dispo.especialidades = datosDisponibilidad.especialidades || [];
        dispo.practicas = datosDisponibilidad.practicas || [];
        dispo._id = validDispoId;

        // TODO llamar al turno service para decirle que se modifico una disponibilidad y que haga lo necesario
        //TODO debe actuar distinto dependiendo q se modifique.

        return await this.medicoRepository.updateDisponibilidad(validMedicoId, validDispoId, dispo);
    }

    async eliminarDisponiblidad(medicoId, disponibilidadId){
        const validMedicoId = objectIdSchema.parse(String(medicoId));
        const validDispoId = objectIdSchema.parse(String(disponibilidadId));

        const medico = this.obtenerPorId(medicoId)

        const dispoExistente = await this.obtenerDisponibilidad(validMedicoId, validDispoId)
        if (!dispoExistente) throw new NotFoundError("Disponibilidad no encontrada");

        medico.eliminarDisponibilidad(validDispoId);
        //TODO se debe eliminar los turnos en estado disponible

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

        const medico = await this.obtenerPorId(validMedicoId);
        if (!medico) throw new NotFoundError("Médico no encontrado");

        for (const id of sedesId) {
            const validSedeId = objectIdSchema.parse(String(id));

            medico.eliminarSedeYDisponibilidades(validSedeId);
        }

        // TODO: Eliminar de la base de datos los turnos "disponibles" 
        // de esas sedes que le acabamos de quitar al médico.
        // await this.turnoRepository.eliminarTurnosPorSedes(validMedicoId, sedesId);

        const medicoActualizado = await this.medicoRepository.update(validMedicoId, medico);

        return medicoActualizado;
    }
}