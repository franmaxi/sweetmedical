import mongoose from 'mongoose';

const solicitudCambioSchema = new mongoose.Schema({
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