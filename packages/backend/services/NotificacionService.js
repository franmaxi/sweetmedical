import { NotificacionRepository } from "../repositories/NotificacionRepository.js";
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { NotFoundError, ForbiddenError } from "../errors/AppErrors.js";
import { paginacionSchema, objectIdSchema } from "../validations/commonValidations.js";

export class NotificacionService {
    constructor({
        notificacionRepository = new NotificacionRepository(),
        usuarioRepository = new UsuarioRepository()
    } = {}) {
        this.notificacionRepository = notificacionRepository;
        this.usuarioRepository = usuarioRepository;
    }

    async obtenerTodos({ numeroPagina = 1, limitePorPagina = 10, filtros = {} } = {}) {
        const { page, limit } = paginacionSchema.parse({ page: numeroPagina, limit: limitePorPagina });

        if (filtros?.usuarioId) {
            await this.obtenerUsuarioOFallar(filtros.usuarioId);
        }

        const { notificaciones, totalNotificaciones, totalPaginas } = await this.notificacionRepository.obtenerPaginados(
            page,
            limit,
            filtros
        );

        return {
            notificaciones,
            totalNotificaciones,
            totalPaginas,
            numeroPagina: page,
            limitePorPagina: limit,
        };
    }

    async obtenerPorId(id) {
        const validId = objectIdSchema.parse(id);
        const notificacion = await this.notificacionRepository.obtenerPorId(validId);

        if (!notificacion) {
            throw new NotFoundError("Notificacion no encontrada");
        }

        return notificacion;
    }

    async marcarComoLeida(notificacionId, usuarioId) {
        const validNotifId = objectIdSchema.parse(notificacionId);
        const validUsuarioId = objectIdSchema.parse(usuarioId);

        const notificacion = await this.obtenerPorId(validNotifId);
        const destinatarioId = notificacion.destinatario?._id?.toString() || notificacion.destinatario?.toString();

        if (destinatarioId !== validUsuarioId.toString()) {
            throw new ForbiddenError("La notificacion no se puede marcar como leida porque no te pertenece");
        }

        notificacion.marcarComoLeida();
        return await this.notificacionRepository.save(notificacion);
    }

    async obtenerUsuarioOFallar(usuarioId) {
        const validId = objectIdSchema.parse(usuarioId);
        const usuario = await this.usuarioRepository.obtenerPorId(validId);
        if (!usuario) throw new NotFoundError('Usuario no encontrado');
        return usuario;
    }
}