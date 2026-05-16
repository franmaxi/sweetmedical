import {BadRequestError} from "../errors/AppErrors.js"
import { MedicoService } from "../services/MedicoService.js"

export class MedicoController{
    constructor({
        medicoService = new MedicoService()
    } = {}){
        this.medicoService = medicoService;
    }

    findAll = async (req, res,next) => {
        try{
            const paginacion = this.extraerPaginacion(req.query)
            const resultado = await this.medicoService.obtenerTodos({...paginacion})
            return res.status(200).json({
                status : "success",
                data : resultado.medicos,
                paginacion: {
                    numeroPagina: resultado.numeroPagina,
                    limitePagina: resultado.limitePagina,
                    totalPaginas: resultado.totalPaginas,
                    totalMedicos: resultado.totalMedicos
                }
            })
        }
        catch(error){
            return next(error)
        }
    }
    
    create = async (req, res,next) =>{
        try{
    
            const datosMedico = this.extraerYValidarBodyMedico(req.body)
            const medicoCreado = await this.medicoService.crear(datosMedico)
            return res.status(201).json({
                status: "success",
                data : medicoCreado
            })
        }
        catch(error){
            return next(error)
        }
    }
    
    delete = async (req,res,next) => {
        try{
            const id = this.parsearId(req.params.id)
            const medicoEliminado = await this.medicoService.eliminar(id)
            return res.status(200).json({
                status : "success",
                data : medicoEliminado
            })
        }
        catch(error){
            return next(error)
        }
    }
    
    update = async (req,res,next) => {
        try {
            const id = this.parsearId(req.params.id)
            const datosMedico = this.extraerYValidarBodyMedico(req.body)
            const medicoActualizado = await this.medicoService.actualizar(id,datosMedico)
            return res.status(200).json({
                status: "success",
                data : medicoActualizado
            })
        } catch (error) {
            return next(error)
        }
    }
    
    findById = async (req,res,next) => {
        try {
            const id = this.parsearId(req.params.id)
            const medico = await this.medicoService.obtenerPorId(id)
            return res.status(200).json({
                status: "success",
                data: medico
            })
        } catch (error) {
            return next(error)
        }
    }

    consultarAgenda = async (req,res,next) => {
        try {
            const medicoId = this.parsearId(req.params.id)
            const especialidadId= this.extraerEspecialidad(req.query)
            const practicaId = this.extraerPractica(req.query)
            const agenda = await this.medicoService.consultarAgenda(medicoId,especialidadId,practicaId)
            return res.status(200).json({
                status: "success",
                data: agenda
            })
        } catch (error) {
            return next(error)
        }
    }

    //POST /medicos/:id/disponibilidades
    crearDisponibilidad = async (req,res,next) => {
        try {
            const medicoId = this.parsearId(req.params.id)
            const disponibilidad = req.body
            const disponibilidadCreada = await this.medicoService.crearDisponibilidad(medicoId,disponibilidad)
            return res.status(201).json({
                status: "success",
                data : disponibilidadCreada
            })
        } catch (error) {
            return next(error)
        }
    }

    // PUT /medicos/:id/disponibilidades/:disponibilidadId    
    modificarDisponibilidad = async (req,res,next) => {
        try {
            const medicoId = this.parsearId(req.params.id)
            const disponibilidadId = this.parsearId(req.params.disponibilidadId)
            const disponibilidad = req.body
            const disponibilidadActualizada = await this.medicoService.modificarDisponibilidad(medicoId,disponibilidadId,disponibilidad)
            return res.status(200).json({
                status: "success",
                data : disponibilidadActualizada
            })
        } catch (error) {
            return next(error)
        }
    }

    // GET /medicos/:id/disponibilidades
    listarDisponibilidades = async (req,res,next) => {
        try {
            const medicoId = this.parsearId(req.params.id)
            const disponibilidades = await this.medicoService.obtenerDisponibilidades(medicoId)
            return res.status(200).json({
                status: "success",
                data : disponibilidades
            })
        } catch (error) {
            return next(error)
        }
    }

    // GET /medicos/:id/disponibilidades/:disponibilidadId
    obtenerDisponibilidad = async (req,res,next) => {
        try {
            const medicoId = this.parsearId(req.params.id)
            const disponibilidadId = this.parsearId(req.params.disponibilidadId)
            const disponibilidad = await this.medicoService.obtenerDisponibilidad(medicoId,disponibilidadId)
            return res.status(200).json({
                status: "success",
                data : disponibilidad
            })
        } catch (error) {
            return next(error)
        }
    }

    agregarServicio = async (req,res,next) => {
        try {
            const medicoId = this.parsearId(req.params.id)
            const especialidad = req.body.especialidad ? this.extraerEspecialidad(req.body) : null
            const practica = req.body.practica ? this.extraerPractica(req.body) : null
            if(especialidad == null && practica == null){
                throw new BadRequestError("Debe proporcionar especialidadId o practicaId")
            }
            const servicioAgregado = await this.medicoService.agregarServicio(medicoId,especialidad,practica)
            return res.status(200).json({
                status: "success",
                data : servicioAgregado
            })
        } catch (error) {
            return next(error)
        }
    }

    modificarServicio = async (req,res,next) => {
        try {
            const medicoId = this.parsearId(req.params.id)
            const especialidad = req.body.especialidad ? this.extraerEspecialidad(req.body) : null
            const practica = req.body.practica ? this.extraerPractica(req.body) : null
            if(especialidad == null && practica == null){
                throw new BadRequestError("Debe proporcionar especialidadId o practicaId")
            }
            const servicioModificado = await this.medicoService.modificarServicio(medicoId,especialidad,practica)
            return res.status(200).json({
                status: "success",
                data : servicioModificado
            })
        } catch (error) {
            return next(error)
        }
    }

    extraerEspecialidad(query){
        const especialidadId = query?.especialidadId === undefined ? null : Number(query.especialidadId)
        if(especialidadId !== null){
            this.validarEnteroPositivo(especialidadId,"especialidadId")
        }
        return especialidadId
    }

    extraerPractica(query){
        const practica = query?.practicaId === undefined ? null : Number(query.practicaId)
        if(practicaId !== null){
            this.validarEnteroPositivo(practicaId,"practicaId")
        }
        return practicaId
    }   
    
    extraerPaginacion(query) {
        const numeroPagina = query?.page === undefined ? 1 : Number(query.page)
        const limitePorPagina = query?.limit === undefined ? 10 : Number(query.limit)

        this.validarEnteroPositivo(numeroPagina, "page")
        this.validarEnteroPositivo(limitePorPagina, "limit")

        return { numeroPagina, limitePorPagina }
    }

    validarEnteroPositivo(numero, parametro) {
        if (!Number.isInteger(numero) || numero <= 0) {
            throw new BadRequestError(`El parámetro ${parametro} debe ser un entero positivo`)
        }
    }
    
    parsearId(idParam) {
        const id = Number(idParam)
        this.validarEnteroPositivo(id, "id")

        return id
    }

    extraerYValidarBodyMedico(body) {
        const {nombre,matricula,nombreUsuario,password} = body
        const errores = {}

        this.validarCampoRequerido(nombre,"nombre",errores)
        this.validarCampoRequerido(matricula,"matricula",errores)
        this.validarCampoRequerido(nombreUsuario,"nombreUsuario",errores)
        this.validarCampoRequerido(password,"password",errores)

        if(Object.keys(errores).length > 0){
            throw new BadRequestError("Errores en el cuerpo",errores)
        }
        return {
            matricula,
            nombre,
            nombreUsuario,
            password
        }
    }
    extraerYValidarBodyMedicoUpdate(body){
        const {nombre,matricula,nombreUsuario,
               password,especialidades,practicas,
               sedes,disponibilidades} = body
        const errores = {}

        this.validarCampoRequerido(nombre,"nombre",errores)
        this.validarCampoRequerido(matricula,"matricula",errores)
        this.validarCampoRequerido(nombreUsuario,"nombreUsuario",errores)
        this.validarCampoRequerido(password,"password",errores)
        this.validarArray(especialidades,"especialidades",errores)
        this.validarArray(practicas,"practicas",errores)
        this.validarArray(sedes,"sedes",errores)
        this.validarArray(disponibilidades,"disponibilidades",errores)


        if(Object.keys(errores).length > 0){
            throw new BadRequestError("Errores en el cuerpo",errores)
        }
        return {
            matricula,
            nombre,
            nombreUsuario,
            password,
            especialidades,
            practicas,
            sedes,
            disponibilidades
        }
    }

    validarCampoRequerido(valor, nombreCampo, errores) {
        if (valor === undefined || valor === null) {
            errores[nombreCampo] = "Campo requerido"
            return
        }

        if (typeof valor === "string" && valor.trim() === "") {
            errores[nombreCampo] = "Campo requerido"
        }
    }

    validarArray(array, nombreCampo, errores) {
        if (array === undefined || array === null) {
            errores[nombreCampo] = "Campo requerido"
            return
        }
        if (!Array.isArray(array)) {
            errores[nombreCampo] = "Debe ser una lista"
        }
    }

    
	async consultarEspecialidad(medicoId,especialidadID){
        this.validarEnteroPositivo(medicoId,"Id")
        this.validarEnteroPositivo(especialidadID,"Id")
        const medico = await this.obtenerPorId(medicoId)
        //const especialidad = await this.especialidadService.obtenerPorId(especialidadID)
        return medico.especialidades.includes(especialidadID)
    }


    
    }