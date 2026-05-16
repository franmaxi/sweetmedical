import { NotificacionRepository} from "../repositories/NotificacionRepository.js"
import { UsuarioRepository} from "../repositories/UsuarioRepository.js"
import { Notificacion } from "../models/Notificacion.js"
import {
    BadRequestError,
    NotFoundError,
    ForbiddenError,
} from "../errors/AppErrors.js";

    export class NotificacionService{
        constructor({
            notificacionRepository = new NotificacionRepository(),
            usuarioRepository = new UsuarioRepository()
        } = {}){
            this.notificacionRepository = notificacionRepository
            this.usuarioRepository = usuarioRepository
    }

    async obtenerTodos({ numeroPagina = 1, limitePorPagina = 10, filtros = {} } = {}) {
        this.validarPaginacion(numeroPagina, limitePorPagina);

        const usuario = await this.usuarioRepository.obtenerPorId(filtros.usuarioId);
        await this.obtenerUsuarioOFallar(filtros.usuarioId);

        const { notificaciones, totalNotificaciones, totalPaginas } = await this.notificacionRepository.obtenerPaginados(
            numeroPagina,
            limitePorPagina,
            filtros
        );

        return {
            notificaciones,
            totalNotificaciones,
            totalPaginas,
            numeroPagina,
            limitePorPagina,
        };
}

    async obtenerPorId(id){
        this.validarEnteroPositivo(id, "Id")

        const notificacion = await this.notificacionRepository.obtenerPorId(id)

        if(!notificacion){
            throw new NotFoundError("Notificacion no encontrado")
        }

        return notificacion
    }
    async marcarComoLeida(notificacionId,usuarioId){
        const notificacion = await this.obtenerPorId(id)
        if(notificacion.destinatario.id != usuarioId){
            //TODO esta bien esto? Entiendo que por las cookies, no deberia hacer falta pero chequear
            throw new ForbiddenError("La notificacion no se puede marcar como leida porque no te pertenece")
        }
        notificacion.marcarComoLeida()
        // Creo que no podemos hacer findByIdAndUpdate, porque le tenemos que pasar atributos
        // y cuando la notificacion se marca como leida llamamos directamente a un metodo.
        return await this.notificacionRepository.save(notificacion)
    }

    // --- Validaciones --- //

    validarFiltros({leida = null, usuarioId} = {}){
        this.validarEnteroPositivo(usuarioId, "Id")
        this.validarUsuarioExistente(usuarioId)
    }

    async obtenerUsuarioOFallar(usuarioId) {
        const usuario = await this.usuarioRepository.obtenerPorId(usuarioId);
        if (!usuario) throw new NotFoundError('Usuario no encontrado');
        return usuario;
    }

    validarEnteroPositivo(numero, parametro) {
        if (!Number.isInteger(numero) || numero <= 0) {
            throw new BadRequestError(`${parametro} debe ser un entero positivo`)
        }
    }
}