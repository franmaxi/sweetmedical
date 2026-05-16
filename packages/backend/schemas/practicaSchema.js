import mongoose from 'mongoose';
import { Practica } from '../domain/Medico/Servicios/Practica.js';

const practicaSchema = new mongoose.Schema({
    
    practicaGenerica:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PracticaGenerica',
        required: true
    },
    
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
    collection: 'practicas'
});

practicaSchema.loadClass(Practica);

export const PracticaModel = mongoose.model('Practica', practicaSchema);