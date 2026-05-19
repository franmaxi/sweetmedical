import mongoose from "mongoose";
import { Usuario } from "../domain/Usuario.js";

const usuarioSchema = new mongoose.Schema({
    nombreUsuario: {
        type: String,
        required: true
    },
    password:{
        type: String, //TODO Por ahora
        required: true
    },
    eliminado: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true,
    versionKey: false,
    collection: 'usuarios'
})

usuarioSchema.loadClass(Usuario)

export const UsuarioModel = mongoose.model('Usuario', usuarioSchema)