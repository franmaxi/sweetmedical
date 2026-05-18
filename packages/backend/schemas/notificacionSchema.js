import mongoose from 'mongoose';
import { Notificacion } from '../domain/Notificacion/Notificacion.js';

const notificacionSchema = new mongoose.Schema({
    destinatario:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    remitente:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        default: null
    },
    mensaje:{
        type: String,
        required: true,
    },
    fechaHoraCreacion: {
        type: Date,
        required: true
    },
    fechaHoraLeida: {
        type: Date,
        default:null
    },
    leida: {
        type: Boolean,
        required: true,
        default: false
    },
},{
    timestamps: true,
    versionKey: false,
    collection: 'notificaciones'
});

notificacionSchema.loadClass(Notificacion);

export const NotificacionModel = mongoose.model('Notificacion', notificacionSchema);

