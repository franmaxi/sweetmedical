import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { usuarioDomainSchema } from "../validations/usuarioValidation.js";
import { BadRequestError, NotFoundError } from "../errors/AppErrors.js";
import { objectIdSchema } from "../validations/commonValidations.js";

export class UsuarioService{
    constructor({
        usuarioRepository = new UsuarioRepository()
    } = {}) {
        this.usuarioRepository = usuarioRepository
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
        const validUser = usuarioDomainSchema.parse(datosUsuario)

        const usuarioExistente = await this.usuarioRepository.findByNombre(validUser.nombreUsuario) //TODO revisar q esto funcione
        if(usuarioExistente){
            throw new BadRequestError(`Ya existe un usuario con nombre ${validUser.nombreUsuario}`)
        }
        
        return await this.usuarioRepository.save(validUser)
        
    }

    async actualizar(id, datosUsuario) {
        const validId = objectIdSchema.parse(id);
        const validUser = usuarioDomainSchema.parse(datosUsuario)

        await this.obtenerPorId(validId)

        const usuarioExistente = await this.usuarioRepository.findByNombre(validUser.nombreUsuario)
        if(usuarioExistente && usuarioExistente._id.toString() !== validId){
            throw new BadRequestError(`Ya existe un usuario con nombre ${validUser.nombreUsuario}`)
        }

        return this.usuarioRepository.update(validId, validUser)
    }

    async eliminar(id) {
        const validId = objectIdSchema.parse(id);
        await this.obtenerPorId(validId);
        return await this.usuarioRepository.delete(validId);
    }
}