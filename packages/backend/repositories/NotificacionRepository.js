import { NotificacionModel } from "../schemas/notificacionSchema.js";

export class NotificacionRepository{
    constructor(){
        this.model = NotificacionModel
    }

    async obtenerPaginados(numeroPagina, limitePorPagina, filtros = {}) {
    //Armamos la query para filtrar
    
    const query = {};
    query.destinatario = filtros.usuarioId;
    if (filtros.leida !== undefined) {
        query.leida = filtros.leida;
    }

    const skip = (numeroPagina - 1) * limitePorPagina;
    const totalNotificaciones = await this.model.countDocuments(query);
    const totalPaginas = totalNotificaciones === 0 ? 0 : Math.ceil(totalNotificaciones / limitePorPagina);
    const notificaciones = await NotificacionModel.find(query)
        .sort({ fechaHoraCreacion: -1 }) // las más recientes primero
        .skip(skip)
        .limit(limitePorPagina);
        return { notificaciones, totalNotificaciones, totalPaginas };
    }

    async crear(notificacion) { //Esto es para guardarlo por primera vez
        const nuevaNotificacion = new this.model(notificacion);
        return await nuevaNotificacion.save();
    }

    async save(notificacion) { //Esto es para guardarlo una vez que lo marcamos como leida
        return await notificacion.save();
    }
    
    async obtenerPorId(id) {
        return await this.model.findById(id);
    }

}
