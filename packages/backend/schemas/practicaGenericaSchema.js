import mongoose from 'mongoose';
import { PracticaGenerica } from '../domain/Medico/Servicios/PracticaGenerica.js';

const practicaGenericaSchema = new mongoose.Schema({
    
    codigo: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    emoji: {
        type: String,
        required: true,
        trim: true
    },
    eliminado: {
        type: Boolean,
        default: false
    }
    
}, {
    timestamps: true,
    versionKey: false,
    collection: 'practicas_genericas'
});

practicaGenericaSchema.loadClass(PracticaGenerica);

export const PracticaGenericaModel = mongoose.model('PracticaGenerica', practicaGenericaSchema);