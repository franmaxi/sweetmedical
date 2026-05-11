import mongoose from 'mongoose';
import { ObraSocial } from '../domain/Paciente/obrasocial.js';

const obrasocialSchema = new mongoose.Schema({
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
    
    //ESTO ES PARA EL SOFT DELETE
    eliminado: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true,
    versionKey: false,
    collection: 'pacientes'
});


//CARGAMOS EL ESQUEMA ALOJAMIENTO (MONGOOSE) A LA ENTIDAD ALOJAMIENTO (NUESTRO DOMINIO)
pacienteSchema.loadClass(Paciente);

//EXPORTAMOS EL MODELO MONGOOSE QUE SE USARA CORRESPONDIENTE AL ESQUEMA
export const PacienteModel = mongoose.model('Paciente', pacienteSchema);

