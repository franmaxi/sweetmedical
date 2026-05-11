import mongoose from 'mongoose';
import { Turno } from '../domain/Turno/turno.js';
import { EstadoTurno } from '../domain/Enumerados/EstadoTurno.js';

const historialEstadoSchema = new mongoose.Schema({
    estado:{ type: String, enum:Object.values(EstadoTurno), required: true},
    fechaHoraIngreso: {type: Date, required: true},
    usuario:{type: Schema.Types.ObjectId, ref:"Usuario"},
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
        required: true
    },
    fechahora:{
        type: Date,
        required: true,
        trim:true
    },
    sede:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        trim:true
    },

    estado:{
        type:  String,
        enum: Object.values(EstadoTurno),
        required: true
    },

    historialEstados:[ historialEstadoSchema ],

    costo: {
        type: Number,
        required: true
    },

    eleccionTurno: {
        type: mongoose.Schema.Types.ObjectId,
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
    collection: 'turnos'
});


//CARGAMOS EL ESQUEMA ALOJAMIENTO (MONGOOSE) A LA ENTIDAD ALOJAMIENTO (NUESTRO DOMINIO)
turnoSchema.loadClass(Turno);

//EXPORTAMOS EL MODELO MONGOOSE QUE SE USARA CORRESPONDIENTE AL ESQUEMA
export const TurnoModel = mongoose.model('Turno', turnoSchema);

