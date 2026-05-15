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
            especialidadIds,
            practicaIds,
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
}