import mongoose from 'mongoose';
import { Turno } from '../domain/Turno/Turno.js';
import { EstadoTurno } from '../domain/Enumerados/EstadoTurno.js';
import { solicitudCambioSchema } from '../validations/turnoValidation.js';

const historialEstadoSchema = new mongoose.Schema({
    estado:{ type: String, enum:Object.values(EstadoTurno), required: true},
    fechaHoraIngreso: {type: Date, required: true},
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
    motivo: {type: String}
}, {_id : false})

const turnoSchema = new mongoose.Schema({
    medico:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medico',
        required: true
    },
    paciente:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paciente',
        default: null
    },
    fechaHora:{
        type: Date,
        required: true
    },
    sede:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sede',
        required: true
    },
    practica:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Practica'
    }],
    especialidad:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Especialidad'
    }],
    estado:{
        type:  String,
        enum: Object.values(EstadoTurno),
        required: true
    },
    historialEstados:[ historialEstadoSchema ],
    costo: {
        type: Number,
        default: null
    },
    disponibilidad:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    modificado:{
        type: Boolean,
        default: false
    },
    solicitudCambio:{
        type: solicitudCambioSchema,
        default: null
    }
},{
    timestamps: true,
    versionKey: false,
    collection: 'turnos'
});


//CARGAMOS EL ESQUEMA ALOJAMIENTO (MONGOOSE) A LA ENTIDAD ALOJAMIENTO (NUESTRO DOMINIO)
turnoSchema.loadClass(Turno);

//EXPORTAMOS EL MODELO MONGOOSE QUE SE USARA CORRESPONDIENTE AL ESQUEMA
export const TurnoModel = mongoose.model('Turno', turnoSchema);

