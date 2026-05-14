import { NotificacionRepository} from "../repositories/NotificacionRepository.js"
import { UsuarioRepository} from "../repositories/UsuarioRepository.js"
import {
    BadRequestError,
    NotFoundError,
} from "../errors/AppErrors.js";

export class NotificacionService{
    constructor({
        notificacionRepository = new NotificacionRepository(),
        usuarioRepository = new UsuarioRepository()
    } = {}){
        this.notificacionRepository = notificacionRepository
        this.usuarioRepository = usuarioRepository
    }

    async obtenerTodas({ numeroPagina = 1, limitePorPagina = 10, filtros = {} } = {}){
        this.validarFiltros(filtros)

        const {notificaciones, totalNotificaciones} = await this.usuarioRepository.obtenerPaginados(
            numeroPagina,
            limitePorPagina,
            filtros
        )
        const totalPaginas = totalNotificaciones === 0 ? 0 : Math.ceil(totalNotificaciones / limitePorPagina)

        return {
            notificaciones,
            numeroPagina,
            limitePorPagina,
            totalPaginas,
            totalNotificaciones
        }
    }

    async obtenerPorId(id){
        this.validarEnteroPositivo(id, "Id")

        const notificacion = await this.notificacionRepository.obtenerPorId(id)

        if(!notificacion){
            throw new NotFoundError("Notificacion no encontrado")
        }

        return notificacion
    }

    // --- Validaciones --- //

    validarFiltros({leida = null, usuarioId} = {}){
        this.validarEnteroPositivo(usuarioId, "Id")
        this.validarUsuarioExistente(usuarioId)
    }

    validarUsuarioExistente(usuarioId){
        const usuarioExistente = this.usuarioRepository.findById(usuarioId) //TODO
        if (!usuarioExistente) {
            throw new NotFoundError("El usuario solicitado no fue encontrado")
        }
    }

    validarEnteroPositivo(numero, parametro) {
        if (!Number.isInteger(numero) || numero <= 0) {
            throw new BadRequestError(`${parametro} debe ser un entero positivo`)
        }
    }
}