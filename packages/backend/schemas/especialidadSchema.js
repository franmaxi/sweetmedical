import mongoose from 'mongoose';
import { Especialidad } from '../domain/Medico/Especialidad.js';

const especialidadSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    duracionTurnoEnMins: {
        type: Number,
        required: true
    },
    costoConsulta: {
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