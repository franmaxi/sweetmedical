import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { usuarioSchema, usuarioUpdateSchema } from "../validations/usuarioValidation.js";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../errors/AppErrors.js";
import { objectIdSchema } from "../validations/commonValidations.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


export class UsuarioService{
    constructor({
        usuarioRepository = new UsuarioRepository()
        
    } = {}) {
        this.usuarioRepository = usuarioRepository
        this.saltRounds = parseInt(process.env.SALT_ROUNDS)
    }

    async obtenerPorId(id){
        const validId = objectIdSchema.parse(id);
        const usuario = await this.usuarioRepository.findById(validId)
    
        if (!usuario){
            throw new NotFoundError("Usuario no encontrado");
        }

        return usuario
    }

    async obtenerPorNombre(nombre){
        return await this.usuarioRepository.findByNombre(nombre)
    }

    async crear(datosUsuario){
        const validUser = usuarioSchema.parse(datosUsuario)

        const usuarioExistente = await this.usuarioRepository.findByNombre(validUser.nombreUsuario)
        if(usuarioExistente){
            throw new BadRequestError(`Ya existe un usuario con nombre ${validUser.nombreUsuario}`)
        }
        
        const passwordHasheada = await bcrypt.hash(validUser.password, this.saltRounds);
        validUser.password = passwordHasheada

        return await this.usuarioRepository.save(validUser)
    }

    async actualizar(id, datosUsuario) {
        // Lo unico modificable es la contraseña, el nombre 
        const validId = objectIdSchema.parse(id);
        const validUserData = usuarioUpdateSchema.parse(datosUsuario) // no seria asi totalmente

        const usuario = await this.obtenerPorId(validId)

        if(validUserData.nombreUsuario){
            const usuarioExistente = await this.usuarioRepository.findByNombre(validUserData.nombreUsuario)
            if(usuarioExistente && usuarioExistente._id.toString() !== validId){
                throw new BadRequestError(`Ya existe un usuario con nombre ${validUserData.nombreUsuario}`)
            }
            usuario.nombreUsuario = validUserData.nombreUsuario
        }

        if (validUserData.newPassword){
            if(!validUserData.password) throw new BadRequestError("Para completar la peticion enviar la contraseña anterior")
            
            const passValida = await bcrypt.compare(validUserData.password, usuario.password)
            if (!passValida) throw new UnauthorizedError("Credenciales Invalidas")
        
            const nuevaPasswordHasheada = await bcrypt.hash(validUserData.newPassword, this.saltRounds);
            usuario.password = nuevaPasswordHasheada
        }
        
        return this.usuarioRepository.update(validId, usuario)
    }

    async eliminar(id) {
        const validId = objectIdSchema.parse(id);
        await this.obtenerPorId(validId);
        return await this.usuarioRepository.delete(validId);
    }

    // --- //

    async login(nombreUsuario, password){
        const usuario = await this.usuarioRepository.findByNombre(nombreUsuario)
        if (!usuario) throw new UnauthorizedError("Credenciales Invalidas")

        const passValida = await bcrypt.compare(password, usuario.password)
        if (!passValida) throw new UnauthorizedError("Credenciales Invalidas")

        const payload = {
            userId: usuario._id,
            userRol: usuario.tipoUsuario,
            userName: usuario.nombreUsuario
            // podemos enviar tambien el idioma para que se configure el front en ese lenguaje 
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
            expiresIn: "10m" 
        });
        
        return token;
    }

}