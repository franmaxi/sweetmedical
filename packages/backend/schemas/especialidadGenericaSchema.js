import mongoose from 'mongoose';
import { EspecialidadGenerica } from '../domain/Medico/Servicios/EspecialidadGenerica.js';

const especialidadGenericaSchema = new mongoose.Schema({
  
    nombre: {
        type: String,
        required: true,
        trim: true
    },
}, {
    timestamps: true,
    versionKey: false,
    collection: 'especialidadesGenericas'
});

especialidadGenericaSchema.loadClass(EspecialidadGenerica);

export const EspecialidadGenericaModel = mongoose.model('EspecialidadGenerica', especialidadGenericaSchema);