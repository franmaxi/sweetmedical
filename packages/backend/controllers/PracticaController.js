import { PracticaService } from "../services/PracticaService.js";
import { paginacionSchema, paramsIdSchema } from "../validations/commonValidations.js";
import { practicaBodySchema, practicaGenericaBodySchema } from "../validations/practicaValidation.js";

export class PracticaController {
    constructor({
        practicaService = new PracticaService()
    } = {}) {
        this.practicaService = practicaService;
    }

    findAll = async (req, res, next) => {
        try {
            const { page: numeroPagina, limit: limitePorPagina } = paginacionSchema.parse(req.query);
            const resultado = await this.practicaService.obtenerTodos({ numeroPagina, limitePorPagina });
            return res.status(200).json({
                status: "success",
                data: resultado.practicas,
                paginacion: {
                    numeroPagina: resultado.numeroPagina,
                    limitePagina: resultado.limitePagina,
                    totalPaginas: resultado.totalPaginas,
                    totalPracticas: resultado.totalPracticas
                }
            });
        } catch (error) {
            return next(error);
        }
    }

    create = async (req, res, next) => {
        try {
            const datosPractica = practicaBodySchema.parse(req.body);
            const practicaCreada = await this.practicaService.crear(datosPractica);
            return res.status(201).json({
                status: "success",
                data: practicaCreada
            });
        } catch (error) {
            return next(error);
        }
    }

    delete = async (req, res, next) => {
        try {
            const { id } = paramsIdSchema.parse(req.params);
            const practicaEliminada = await this.practicaService.eliminar(id);
            return res.status(200).json({
                status: "success",
                data: practicaEliminada
            });
        } catch (error) {
            return next(error);
        }
    }

    update = async (req, res, next) => {
        try {
            const { id } = paramsIdSchema.parse(req.params);
            const datosPractica = practicaBodySchema.parse(req.body);
            const practicaActualizada = await this.practicaService.actualizar(id, datosPractica);
            return res.status(200).json({
                status: "success",
                data: practicaActualizada
            });
        } catch (error) {
            return next(error);
        }
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
                    limitePagina: resultado.limitePagina,
                    totalPaginas: resultado.totalPaginas,
                    totalPracticasGenericas: resultado.totalPracticas
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
            const practicaActualizada = await this.practicaService.actualizarGenerica(id, datosPGenerica);
            return res.status(200).json({
                status: "success",
                data: practicaActualizada
            });
        } catch (error) {
            return next(error);
        }
    }    
}