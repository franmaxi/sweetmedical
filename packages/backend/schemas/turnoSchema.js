import mongoose from 'mongoose';
import { Turno } from '../domain/Turno/Turno.js';
import { EstadoTurno } from '../domain/Enumerados/EstadoTurno.js';

const historialEstadoSchema = new mongoose.Schema({
    estado:{ type: String, enum:Object.values(EstadoTurno), required: true},
    fechaHoraIngreso: {type: Date, required: true},
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
    motivo: {type: String}
}, {_id : false})

const turnoSchema = new mongoose.Schema({
    medico:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'medico',
        required: true
    },
    paciente:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'paciente',
        default: null
    },
    fechahora:{
        type: Date,
        required: true
    },
    sede:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sede',
        required: true
    },
    practica:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Practica'
    },
    especialidad:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Especialidad'
    },
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
        ref: 'DisponibilidadHoraria',
        required: true
    },
    refrescarAnteriores:{
        type: Boolean,
        default: false
    },
    eliminado: {
        type: Boolean,
        default: false
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

