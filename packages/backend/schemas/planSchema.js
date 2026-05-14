import mongoose from 'mongoose';
import { Plan } from '../domain/Plan/Plan.js';

const planSchema = new mongoose.Schema({
    nombre:{
        type: String,
        required: true,
        trim:true
    },
    
},{
    timestamps: true,
    versionKey: false,
    collection: 'planes'
});

planSchema.loadClass(Plan);

export const PlanModel = mongoose.model('Plan', planSchema);

