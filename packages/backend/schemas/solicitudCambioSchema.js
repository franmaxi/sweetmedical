import mongoose from 'mongoose';
import { Usuario } from '../domain/Usuario';
import { Turno } from '../domain/Turno/Turno';
export const solicitudCambioSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    turnoNuevo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Turno',
        required: true
    },
    motivo: {
        type: String,
        required: true
    }
}, { _id: false })

