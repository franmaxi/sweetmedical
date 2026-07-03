import { EspecialidadService } from "../services/EspecialidadService.js"
import { paginacionSchema, paramsIdSchema, tokenSchema } from "../validations/commonValidations.js"
import { especialidadGenericaBodySchema } from "../validations/especialidadValidation.js"
import { tipoUsuario } from "../domain/Enumerados/TipoUsuario.js";
import { ForbiddenError } from "../errors/AppErrors.js"

export class EspecialidadController {
    constructor({
        especialidadService = new EspecialidadService()
    } = {}) {
        this.especialidadService = especialidadService
    } 

    findById = async (req, res, next) => {
        try {
            const { id } = paramsIdSchema.parse(req.params)
            const especialidad = await this.especialidadService.obtenerPorId(id)
            return res.status(200).json({
                status: "success",
                data: especialidad
            })
        } catch (error) {
            return next(error)
        }
    }

    // ------- Especialidades Genericas ---------
    createGenerica = async (req, res, next) => {
        try {
            const datosEGenerica = especialidadGenericaBodySchema.parse(req.body)
            
            const { userId, userRol, userName } = tokenSchema.parse(req.usuario)
            this.validarAdmin(userRol)
            
            const eGenericaCreada = await this.especialidadService.crearGenerica(datosEGenerica)
            return res.status(201).json({
                status: "success",
                data: eGenericaCreada
            })
        } catch (error) {
            return next(error)
        }
    }

    findAllGenerica = async (req, res, next) => {
        try {
            const { page: numeroPagina, limit: limitePorPagina } = paginacionSchema.parse(req.query)
            const resultado = await this.especialidadService.obtenerTodosGenerica({ numeroPagina, limitePorPagina })
            return res.status(200).json({
                status: "success",
                data: resultado.especialidadesGenericas,
                paginacion: {
                    numeroPagina: resultado.numeroPagina,
                    limitePagina: resultado.limitePorPagina,
                    totalPaginas: resultado.totalPaginas,
                    totalEspecialidadesGenericas: resultado.totalEspecialidadesGenericas
                }
            })
        } catch (error) {
            return next(error)
        }
    }

    findByIdGenerica = async (req, res, next) => {
        try {
            const { id } = paramsIdSchema.parse(req.params)
            const especialidadGenerica = await this.especialidadService.obtenerPorIdGenerica(id)
            return res.status(200).json({
                status: "success",
                data: especialidadGenerica
            })
        } catch (error) {
            return next(error)
        }
    }

    updateGenerica = async (req, res, next) => {
        try {
            const { id } = paramsIdSchema.parse(req.params)
            const datosEspecialidad = especialidadGenericaBodySchema.parse(req.body)
            const {userId, userRol, userName} = tokenSchema.parse(req.usuario)
            this.validarAdmin(userRol)

            const especialidadActualizada = await this.especialidadService.actualizarGenerica(id, datosEspecialidad)
            return res.status(200).json({
                status: "success",
                data: especialidadActualizada
            })
        } catch (error) {
            return next(error)
        }
    }    

    validarAdmin(rolUsuario) {
    if (rolUsuario != tipoUsuario.ADMIN) 
        throw new ForbiddenError("No cuenta con los permisos necesarios para realizar dicha accion")
    }
}