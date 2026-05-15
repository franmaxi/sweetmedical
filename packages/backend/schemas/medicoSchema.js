import mongoose from 'mongoose';
import { Medico } from '../domain/Medico/Medico.js';
import { disponibilidadSchema } from './disponibilidadSchema.js'

const medicoSchema = new mongoose.Schema({
    usuario:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        unique: true,
        required: true
    },
    matricula:{
        type: String,
        required: true,
        unique: true,
        trim:true
    },
    nombre:{
        type: String,
        required: true,
        trim:true
    },
    especialidades: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Especialidad'
    }],
    practicas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Practica'
    }],
    sedes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sede'
    }],
    disponibilidades: [disponibilidadSchema],
    eliminado: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true,
    versionKey: false,
    collection: 'medicos'
});

medicoSchema.loadClass(Medico);

export const MedicoModel = mongoose.model('Medico', medicoSchema);

