import { NotificacionService } from "../services/NotificacionService.js";
import { paginacionSchema, paramsIdSchema, tokenSchema } from "../validations/commonValidations.js";
import { notificacionQuerySchema, marcarLeidaQuerySchema } from "../validations/notificacionValidation.js";

export class NotificacionController {
    constructor({
        notificacionService = new NotificacionService()
    } = {}) {
        this.notificacionService = notificacionService;
    }

    findAll = async (req, res, next) => {
        try {
            const { page: numeroPagina, limit: limitePorPagina } = paginacionSchema.parse(req.query);
            const filtros = notificacionQuerySchema.parse(req.query);

            const resultado = await this.notificacionService.obtenerTodos({ 
                numeroPagina, 
                limitePorPagina, 
                filtros 
            });

            return res.status(200).json({
                status: "success",
                data: resultado.notificaciones,
                paginacion: {
                    numeroPagina: resultado.numeroPagina,
                    limitePorPagina: resultado.limitePorPagina,
                    totalPaginas: resultado.totalPaginas,
                    totalNotificaciones: resultado.totalNotificaciones
                }
            });
        } catch (error) {
            return next(error);
        }
    };

    marcarComoLeida = async (req, res, next) => {
        try {
            const { id } = paramsIdSchema.parse(req.params);
            //const { usuarioId } = marcarLeidaQuerySchema.parse(req.query);
            const {userId, userRol, userName} = tokenSchema.parse(req.usuario)

            const notificacionActualizada = await this.notificacionService.marcarComoLeida(id, userId);
            return res.status(200).json({
                status: "success",
                data: notificacionActualizada
            });
        } catch (error) {
            return next(error);
        }
    }
    
    findById = async (req, res, next) => {
        try {
            const { id } = paramsIdSchema.parse(req.params);
            const notificacion = await this.notificacionService.obtenerPorId(id);
            return res.status(200).json({
                status: "success",
                data: notificacion
            });
        } catch (error) {
            return next(error);
        }
    }
}


