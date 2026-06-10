import mongoose from 'mongoose';
import { ObraSocial } from '../domain/Paciente/ObraSocial.js';
import {planSchema} from './planSchema.js'

const obraSocialSchema = new mongoose.Schema({
    nombre:{
        type: String,
        required: true,
        trim:true
    },

    planes: [planSchema],
    
},{
    timestamps: true,
    versionKey: false,
    collection: 'obras_sociales'
});

obraSocialSchema.loadClass(ObraSocial);

export const ObraSocialModel = mongoose.model('ObraSocial', obraSocialSchema);

