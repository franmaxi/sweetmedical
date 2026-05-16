import { Medico } from "../domain/Medico/Medico.js";
import { EspecialidadRepository } from "../repositories/EspecialidadRepository.js";
import { EstadoTurno } from "../domain/Enumerados/EstadoTurno.js";
import { MedicoRepository } from "../repositories/MedicoRepository.js";
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { DisponibilidadHoraria } from "../domain/Medico/DisponibilidadHoraria.js";
import {
    BadRequestError,
    NotFoundError,
    UnprocessableEntityError,
    ConflictError
} from "../errors/AppErrors.js";

export class MedicoService{
    constructor({
        medicoRepository = new MedicoRepository(),
        usuarioRepository = new UsuarioRepository(),
        especialidadRepository = new EspecialidadRepository(),
        PracticaRepository = new PracticaRepository(),
        TurnoRepository = new TurnoRepository()
    } = {}) {
        this.medicoRepository = medicoRepository;
        this.usuarioRepository = usuarioRepository;
        this.especialidadRepository = especialidadRepository;
        this.practicaRepository = PracticaRepository;
        this.turnoRepository = TurnoRepository;
    }

    async obtenerTodos({numeroPagina = 1, limitePorPagina = 10, filtros = {} } = {}){
        this.validarPaginacion(numeroPagina,limitePorPagina)
        //TODO Agregar filtros para medico (especialidad/practica/sede/etc.)
        const {medicos,totalMedicos} = await this.medicoRepository.obtenerPaginados(
            numeroPagina,
            limitePorPagina,
            filtros
        ) 
        const totalPaginas = totalMedicos === 0 ? 0 : Math.ceil(totalMedicos/limitePorPagina)
        return {
            medicos,
            numeroPagina,
            limitePorPagina,
            totalPaginas,
            totalMedicos
        }
    }

    async obtenerPorId(id){
        this.validarEnteroPositivo(id, "Id")
        const medico = await this.medicoRepository.obtenerPorId(id)

        if (!medico) {
            throw new NotFoundError("Medico no encontrado")
        }
        return medico
    }
    
    async obtenerUsuarioPorId(id){
        this.validarEnteroPositivo(id, "Id")
        const usuario = await this.usuarioRepository.obtenerPorId(id)

        if (!usuario) {
            throw new NotFoundError("Usuario no encontrado")
        }
        return usuario
    }

    async crear(datosMedico){
        this.validarDatosMedico(datosMedico)
        if(await this.existeMatricula(datosMedico.matricula))
        {
            throw new ConflictError("Ya existe un médico con esa matrícula")
        }
/*         if (this.usuarioService.existeNombreUsuario(datosMedico.nombreUsuario)){
            throw new ConflictError("Ya existe un usuario con ese nombre de usuario")
        } */ //!! lo descomento cuando tenga el servicio de usuario implementado
        const usuarioCreado = await this.usuarioRepository.save({
            nombreUsuario: datosMedico.nombreUsuario,
            password: datosMedico.password
        })        
        const medico = new Medico({
            usuario: usuarioCreado._id,    
            matricula : datosMedico.matricula,
            nombre : datosMedico.nombre
        })
        return await this.medicoRepository.save(medico) 
    }


    
    async actualizar(id, datosMedico){
        this.validarEnteroPositivo(id,"Id")
        this.validarDatosMedico(datosMedico) 
        const medicoExistente = await this.obtenerPorId(id)
        const usuarioExistente =  await this.obtenerUsuarioPorId(id)

        /* if (await this.usuarioService.existeNombreUsuario(datosMedico.nombreUsuario)){
            throw new ConflictError("Ya existe un usuario con ese nombre de usuario")
        } */ //!! lo descomento cuando tenga el servicio de usuario implementado
        
        
        if(await this.existeMatricula(datosMedico.matricula))
        {
            throw new ConflictError("Ya existe un médico con esa matrícula")
        }
    
        for (const especialidadId of datosMedico.especialidadIds) {
            if (!await this.especialidadRepository.findById(especialidadId)) {
                throw new NotFoundError(`Especialidad ${especialidadId} no encontrada`)
            }
        }
        for (const practicaId of datosMedico.practicaIds) {
            if (!await this.practicaRepository.findById(practicaId)) {
                throw new NotFoundError(`Practica ${practicaId} no encontrada`)
            }
        }


        usuarioExistente.nombreUsuario = datosMedico.nombreUsuario
        usuarioExistente.password = datosMedico.password
        await this.usuarioRepository.save(usuarioExistente) 

        medicoExistente.matricula = datosMedico.matricula
        medicoExistente.nombre = datosMedico.nombre
        medicoExistente.especialidades = datosMedico.especialidadIds
        medicoExistente.practicas = datosMedico.practicaIds 
        medicoExistente.sedes = datosMedico.sedes
        medicoExistente.disponibilidades = datosMedico.disponibilidades
        //TODO Verificar las nuevas disponibilidades..
        return await this.medicoRepository.save(medicoExistente)
    }
    
    async eliminar(id){
        this.validarEnteroPositivo(id,"Id")
        const medico = await this.obtenerPorId(id)
        const usuario = await this.obtenerUsuarioPorId(id)
        medico.eliminado = true
        usuario.eliminado = true
        //TODO ver la logica de que pasa con los distintos turnos que tiene el medico.
         await this.usuarioRepository.save(usuario) //TODO ver si es necesario guardar usuarioRepository por guardar en cascada
        return await this.medicoRepository.save(medico)
    }

    async existeMatricula(matricula) {
        const medico = await this.medicoRepository.obtenerPorMatricula(matricula)
        return medico !== null
    }

    async consultarAgenda (medicoId, especialidadId, practicaId){
        this.validarEnteroPositivo(medicoId,"Id")
        const medico = await this.obtenerPorId(medicoId)
        if (!medico) throw new NotFoundError("Medico no encontrado")

        const especialidad = await this.especialidadService.obtenerPorId(especialidadId)
        if (!especialidad) throw new NotFoundError("Especialidad no encontrada")

        const practica = await this.practicaService.obtenerPorId(practicaId)
        if (!practica) throw new NotFoundError("Practica no encontrada")
        
        if (!medico.especialidades.includes(especialidadId)) {
            throw new UnprocessableEntityError("El médico no tiene asignada esa especialidad")
        }
        if (!medico.practicas.includes(practicaId)) {
            throw new UnprocessableEntityError("El médico no tiene asignada esa práctica")
        }   
        
        // const agenda = await this.turnoService.obtenerAgendaPorMedicoYEspecialidadYPractica(medicoId, especialidadId, practicaId)
        
        return await this.turnoRepository.obtenerPaginados(1, 100, {
            medicoId,
            especialidadId,
            practicaId,
            estado: EstadoTurno.DISPONIBLE
        })
    }

    async 


    async consultarDisponibilidad(medicoId){
        this.validarEnteroPositivo(medicoId,"Id")
        const medico = await this.obtenerPorId(medicoId)
        return medico.disponibilidades
    }

    async crearDisponibilidad(medicoId, datosDisponibilidad){
        this.validarEnteroPositivo(Number(medicoId),"Id")
        
        const dispo = new DisponibilidadHoraria({
            diaSemana: datosDisponibilidad.diaSemana,
            horaDesde: datosDisponibilidad.horaDesde,
            horaHasta: datosDisponibilidad.horaHasta,
            sede: datosDisponibilidad.sede
        })
        
        dispo.especialidades = datosDisponibilidad.especialidades || [];
        dispo.practicas = datosDisponibilidad.practicas || [];


        const medicoActualizado = await this.medicoRepository.addDisponibilidad(medicoId, dispo) 
        const dispoList = medicoActualizado.disponibilidades || [];
        return dispoList[dispoList.length - 1] || null; // Retorna la última disponibilidad agregada

    }

    async modificarDisponibilidad(medicoId, disponibilidadId, datosDisponibilidad){
        this.validarEnteroPositivo(Number(medicoId),"Id");

        const dispoExistente = await this.medicoRepository.obtenerDisponibilidadPorId(medicoId, disponibilidadId)
        if (!dispoExistente)  throw new NotFoundError("Disponibilidad no encontrada");
        

        const dispo = new DisponibilidadHoraria({
            diaSemana: datosDisponibilidad.diaSemana,
            horaDesde: datosDisponibilidad.horaDesde,
            horaHasta: datosDisponibilidad.horaHasta,
            sede: datosDisponibilidad.sede
        });

        dispo.especialidades = datosDisponibilidad.especialidades || [];
        dispo.practicas = datosDisponibilidad.practicas || [];
        dispo._id = disponibilidadId; // Asegura que el ID de la disponibilidad se mantenga igual

        await this.medicoRepository.updateDisponibilidad(medicoId, disponibilidadId, dispo);

        return await this.medicoRepository.obtenerDisponibilidadPorId(medicoId, disponibilidadId);
    }



    validarDatosServicios({ especialidadIds, practicaIds }) {
        if (!Array.isArray(especialidadIds) || !Array.isArray(practicaIds)) {
            throw new BadRequestError("especialidadIds y practicaIds deben ser listas")
        }
        if (especialidadIds.length === 0 && practicaIds.length === 0) {
            throw new UnprocessableEntityError("Debe enviar al menos una especialidad o práctica")
        }
        for (const id of especialidadIds) {
            if (typeof id !== "string" || id.trim() === "") {
                throw new UnprocessableEntityError("Cada especialidadId debe ser un string no vacío")
            }
        }
        for (const id of practicaIds) {
            if (typeof id !== "string" || id.trim() === "") {
                throw new UnprocessableEntityError("Cada practicaId debe ser un string no vacío")
            }
        }
    }

    validarDatosMedico(datosMedico){
        if (!datosMedico || typeof datosMedico !== "object" || Array.isArray(datosMedico)) {
            throw new BadRequestError("Los datos del medico son invalidos")
        }
        const {nombre, matricula, nombreUsuario,password} = datosMedico

         if (typeof nombre !== "string" ) {
            throw new UnprocessableEntityError("El nombre del medico es invalido")
        }
        if (typeof matricula !== "string" ) {
            throw new UnprocessableEntityError("La matricula del medico es invalida")
        }
        if (typeof nombreUsuario !== "string" ) {
            throw new UnprocessableEntityError("El nombreUsuario del medico es invalido")
        }
        if (typeof password !== "string" ) {
            throw new UnprocessableEntityError("La contraseña del medico es invalida")
        }
    }

       

    validarPaginacion(numeroPagina, limitePorPagina) {
        this.validarEnteroPositivo(numeroPagina, "Numero de página")
        this.validarEnteroPositivo(limitePorPagina, "Límite por página")
    }

    validarEnteroPositivo(numero, parametro) {
        if (!Number.isInteger(numero) || numero <= 0) {
            throw new BadRequestError(`${parametro} debe ser un entero positivo`)
        }
    }
}
