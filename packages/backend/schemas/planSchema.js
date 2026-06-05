import mongoose from 'mongoose';
import { Plan } from '../domain/Plan/Plan.js';
import { NivelCobertura } from '../domain/Enumerados/NivelCobertura.js';

const CoberturaEspecialidad = new mongoose.Schema({
    especialidadGenerica:{ type: mongoose.Schema.Types.ObjectId,
        ref: 'EspecialidadGenerica',
        required: true},
    nivel: {
        type: String, 
        enum:Object.values(NivelCobertura), 
        required: true},
    pocentajeDescuento:{
        type: Number,
        required: true
    }
}, {_id : false})

const CoberturaPractica = new mongoose.Schema({
    practicaGenerica:{ type: mongoose.Schema.Types.ObjectId,
        ref: 'PracticaGenerica',
        required: true},
    nivel: {
        type: String, 
        enum:Object.values(NivelCobertura), 
        required: true},
    pocentajeDescuento:{
        type: Number,
        required: true
    }
}, {_id : false})

export const planSchema = new mongoose.Schema({
    nombre:{
        type: String,
        required: true,
        trim:true
    },
    coberturaEspecialidad:[CoberturaEspecialidad],
    coberturaPractica:[CoberturaPractica],
},{
    timestamps: true,
    versionKey: false,
});

planSchema.loadClass(Plan);