import { PracticaService } from "../services/PracticaService.js";
import { paginacionSchema, paramsIdSchema, tokenSchema } from "../validations/commonValidations.js";
import { practicaGenericaBodySchema } from "../validations/practicaValidation.js";
import { tipoUsuario } from "../domain/Enumerados/TipoUsuario.js";
import { ForbiddenError } from "../errors/AppErrors.js";

export class PracticaController {
    constructor({
        practicaService = new PracticaService()
    } = {}) {
        this.practicaService = practicaService;
    }
    
    findById = async (req, res, next) => {
        try {
            const { id } = paramsIdSchema.parse(req.params);
            const practica = await this.practicaService.obtenerPorId(id);
            return res.status(200).json({
                status: "success",
                data: practica
            });
        } catch (error) {
            return next(error);
        }
    }

    // ------- Practicas Genericas ---------
    createGenerica = async (req, res, next) => {
        try {
            const datosPGenerica = practicaGenericaBodySchema.parse(req.body);

            const { userRol } = tokenSchema.parse(req.usuario)
            this.validarAdmin(userRol)

            const practicaGenericaCreada = await this.practicaService.crearGenerica(datosPGenerica);
            return res.status(201).json({
                status: "success",
                data: practicaGenericaCreada
            });
        } catch (error) {
            return next(error);
        }
    }

    findAllGenerica = async (req, res, next) => {
        try {
            const { page: numeroPagina, limit: limitePorPagina } = paginacionSchema.parse(req.query);
            const resultado = await this.practicaService.obtenerTodosGenerica({ numeroPagina, limitePorPagina });
            return res.status(200).json({
                status: "success",
                data: resultado.practicasGenericas,
                paginacion: {
                    numeroPagina: resultado.numeroPagina,
                    limitePagina: resultado.limitePorPagina,
                    totalPaginas: resultado.totalPaginas,
                    totalPracticasGenericas: resultado.totalPracticasGenericas
                }
            });
        } catch (error) {
            return next(error);
        }
    }

    findByIdGenerica = async (req, res, next) => {
        try {
            const { id } = paramsIdSchema.parse(req.params);
            const practicaGenerica = await this.practicaService.obtenerPorIdGenerica(id);
            return res.status(200).json({
                status: "success",
                data: practicaGenerica
            });
        } catch (error) {
            return next(error);
        }
    }

    updateGenerica = async (req, res, next) => {
        try {
            const { id } = paramsIdSchema.parse(req.params);
            const datosPGenerica = practicaGenericaBodySchema.parse(req.body);

            const { userRol } = tokenSchema.parse(req.usuario)
            this.validarAdmin(userRol)

            const practicaActualizada = await this.practicaService.actualizarGenerica(id, datosPGenerica);
            return res.status(200).json({
                status: "success",
                data: practicaActualizada
            });
        } catch (error) {
            return next(error);
        }
    }
    
    validarAdmin(rolUsuario) {
        if (rolUsuario != tipoUsuario.ADMIN) 
            throw new ForbiddenError("No cuenta con los permisos necesarios para realizar dicha accion")
    }
}