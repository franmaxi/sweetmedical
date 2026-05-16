import mongoose from 'mongoose';
import { Especialidad } from '../domain/Medico/Servicios/Especialidad.js';

const especialidadSchema = new mongoose.Schema({
    especialidadGenerica:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EspecialidadGenerica',
        required: true
    },

    nombre: {
        type: String,
        required: true,
        trim: true
    },
    duracionTurnoEnMins: {
        type: Number,
        required: true
    },
    costo: {
        type: Number,
        required: true
    }
}, {
    timestamps: true,
    versionKey: false,
    collection: 'especialidades'
});

especialidadSchema.loadClass(Especialidad);

export const EspecialidadModel = mongoose.model('Especialidad', especialidadSchema);