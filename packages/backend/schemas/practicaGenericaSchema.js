import mongoose from 'mongoose';
import { practicaGenerica } from '../domain/Medico/PracticaGenerica.js';

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
    }
    
}, {
    timestamps: true,
    versionKey: false,
    collection: 'practicasGenericas'
});

practicaGenericaSchema.loadClass(practicaGenerica);

export const PracticaGenericaModel = mongoose.model('PracticaGenerica', practicaGenericaSchema);