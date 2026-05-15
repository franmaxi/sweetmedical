import mongoose from 'mongoose';
import { Notificacion } from '../domain/Notificacion/Notificacion.js';

const notificacionSchema = new mongoose.Schema({
    destinatario:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    remitente:{
        type: String,
        ref: 'Usuario',
        required: true
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
        required: true
    },
    leida: {
        type: Boolean,
        required: true,
        default: false
    },
},{
    timestamps: true,
    versionKey: false,
    collection: 'noticaciones'
});

notificacionSchema.loadClass(Notificacion);

export const NotificacionModel = mongoose.model('Notificacion', notificacionSchema);

