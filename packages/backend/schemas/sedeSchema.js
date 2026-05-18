import mongoose from 'mongoose';
import { Sede } from '../domain/Sede.js';

const sedeSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    direccion: {
        type: String,
        required: true,
        trim: true   
    },
    eliminado: {
        type: Boolean,
        default:false
    },
}, {
    timestamps: true,
    versionKey: false,
    collection: 'sedes'
});

sedeSchema.loadClass(Sede);

export const SedeModel = mongoose.model('Sede', sedeSchema);

