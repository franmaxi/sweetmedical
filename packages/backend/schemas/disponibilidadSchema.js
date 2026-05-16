import mongoose from 'mongoose';
import { DiaSemana } from '../domain/Enumerados/DiaSemana.js';
// import { DisponibilidadHoraria } from '../domain/Medico/DisponibilidadHoraria.js';

export const disponibilidadSchema = new mongoose.Schema({
    diaSemana:{ type: Number, enum:Object.values(DiaSemana), required: true},
    horaDesde: { type: String, required: true },
    horaHasta:    { type: String, required: true },
        
    especialidades: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Especialidad'
    }],
    practicas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Practica'
    }],
    sede: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sede',
        required: true
    }],
    mcdDuracion:{
        type:Number,
        required: true        
    }
 // Le ponemos el _id de Mongoose para poder identificar las diferentes disponibilidades
}, { _id: false });


