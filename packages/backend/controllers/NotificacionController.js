import {NotificacionService} from "../services/NotificacionService.js"
import {
    BadRequestError,
    NotFoundError,
    UnprocessableEntityError,
} from "../errors/AppErrors.js";

export class NotificacionController{
    constructor({
        notificacionService = new NotificacionService()
    } = {}){
        this.notificacionService = notificacionService
    }

    // GET 
    findAll = async (req, res, next) => {
        try {
            const paginacion = this.extraerPaginacion(req.query)
            const filtros = this.extraerFiltros(req.query)
            const resultado = await this.notificacionService.obtenerTodos({ ...paginacion, filtros})

            return res.status(200).json({
                status: "success",
                data: resultado.productos,
                paginacion: {
                    numeroPagina: resultado.numeroPagina,
                    limitePorPagina: resultado.limitePorPagina,
                    totalPaginas: resultado.totalPaginas,
                    totalProductos: resultado.totalProductos
                }
            })
        } catch (error) {
            return next (error)
        }
    }

    

    findById = async (req,res,next) => {
        try {
            const id = this.parsearId(req.params.id)
            const notificacion = await this.notificacionService.obtenerPorId(id)
            return res.status(200).json({
                status: "success",
                data: notificacion
            })
        } catch (error) {
            return next(error)
        }
    }

    parsearId(idParam) {
        const id = Number(idParam)
        this.validarEnteroPositivo(id, "id")
        return id
    }
    
    extraerFiltros(query) {
        const filtros = {}
        // la idea es que si quiere todas, no filtra por leida, si envia un valor de leida debe ser si o si true o false, si quiere todas, no enviar el query param
        if (query.leida !== undefined) {
            if (query.leida === 'true') {
                filtros.leida = true
            } else if (query.leida === 'false') {
                filtros.leida = false
            } else {
                throw new BadRequestError("'leida' debe ser true o false")
            }
        }

        if (query.usuarioId !== undefined) {
            const usuarioId = Number(query.usuarioId)
            if (!Number.isFinite(usuarioId) || !Number.isInteger(usuarioId)) {
                throw new BadRequestError("usuarioId debe ser un número entero válido")
            }
            filtros.usuarioId = usuarioId
        }

        return filtros
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

}

