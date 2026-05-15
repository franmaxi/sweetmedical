import { PracticaService } from "../services/PracticaService.js";
import { BadRequestError } from "../errors/AppErrors.js"

export class PracticaController {
    constructor( {
        practicaService = new PracticaService()
    } = {}) {
        this.practicaService = practicaService
    }

    findAll = async (req, res,next) => {
        try{
            const paginacion = this.extraerPaginacion(req.query)
            const resultado = await this.practicaService.obtenerTodos({...paginacion})
            return res.status(200).json({
                status : "success",
                data : resultado.practicas,
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

    create = async (req,res, next) => {
        try {
            const datosPractica = this.extraerYValidarBodyPractica(req.body)
            const practicaCreada = await this.practicaService.crear(datosPractica)
            return res.status(201).json({
                status: "success",
                data : practicaCreada
            })
        }
        catch(error){
            return next(error)
        }
    }

    delete = async (req,res,next) => {
        try{
            const id = this.parsearId(req.params.id)
            const practicaEliminada = await this.practicaService.eliminar(id)
            return res.status(200).json({
                status : "success",
                data : practicaEliminada
            })
        }
        catch(error){
            return next(error)
        }
    }

    update = async (req,res,next) => {
        try {
            const id = this.parsearId(req.params.id)
            const datosPractica = this.extraerYValidarBodyPractica(req.body)
            const practicaActualizada = await this.practicaService.actualizar(id,datosPractica)
            return res.status(200).json({
                status: "success",
                data : practicaActualizada
            })
        } catch (error) {
            return next(error)
        }
    }

    findById = async (req,res,next) => {
        try {
            const id = this.parsearId(req.params.id)
            const practica = await this.practicaService.obtenerPorId(id)
            return res.status(200).json({
                status: "success",
                data: practica
            })
        } catch (error) {
            return next(error)
        }
    }

    // Métodos auxiliares

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

    extraerYValidarBodyPractica(body) {
        const {codigo,nombre,duracionTurnoEnMins,costo} = body
        const errores = {}

        this.validarCampoRequerido(codigo,"codigo",errores)
        this.validarCampoRequerido(nombre,"nombre",errores)
        this.validarCampoRequeridoNumerico(duracionTurnoEnMins,"duracionTurnoEnMins",errores)
        this.validarCampoRequeridoNumerico(costo,"costo",errores)

        if(Object.keys(errores).length > 0){
            throw new BadRequestError("Errores en el cuerpo",errores)
        }

        return {
            codigo,
            nombre,
            duracionTurnoEnMins,
            costo
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

    validarCampoRequeridoNumerico(valor, nombreCampo, errores) {
        if (valor === undefined || valor === null) {
            errores[nombreCampo] = "Campo requerido"
            return
        }
        if (typeof valor !== "number" || isNaN(valor)) {
            errores[nombreCampo] = "Debe ser un número válido"
            return
        }
        if (valor <= 0) {
            errores[nombreCampo] = "Debe ser mayor a 0"
        }
    }
}