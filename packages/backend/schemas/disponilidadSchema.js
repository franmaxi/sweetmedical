import mongoose from 'mongoose';
import { DiaSemana } from '../domain/Enumerados/diaSemana.js';
import { DisponibilidadHoraria } from '../domain/Medico/DisponibilidadHoraria.js';

export const disponibilidadSchema = new mongoose.Schema({
    diaSemana:{ type: String, enum:Object.values(DiaSemana), required: true},
    horaDesde: { type: String, required: true },
    horaHasta:    { type: String, required: true }
}, { _id: false });