import mongoose from 'mongoose';
import { Paciente } from '../domain/Paciente/Paciente.js';

const pacienteSchema = new mongoose.Schema({
    usuario:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    dni:{
        type: Number,
        required: true,
        trim:true
    },
    nombre:{
        type: String,
        required: true,
        trim:true
    },

    obrasocial:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ObraSocial',
        required: true
    },
    plan:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Plan',
        required: true
    },
    
    eliminado: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true,
    versionKey: false,
    collection: 'pacientes'
});

pacienteSchema.loadClass(Paciente);

export const PacienteModel = mongoose.model('Paciente', pacienteSchema);

