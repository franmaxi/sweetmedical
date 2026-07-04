import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { usuarioSchema, usuarioDomainSchema, usuarioUpdateSchema } from "../validations/usuarioValidation.js";
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
        const validUser = usuarioDomainSchema.parse(datosUsuario)

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
        const validUserData = usuarioUpdateSchema.parse(datosUsuario)

        const usuario = await this.obtenerPorId(validId)

        if(validUserData.nombreUsuario){
            const usuarioExistente = await this.usuarioRepository.findByNombre(validUserData.nombreUsuario)
            if(usuarioExistente && usuarioExistente._id.toString() !== validId){
                throw new BadRequestError(`Ya existe un usuario con nombre ${validUserData.nombreUsuario}`)
            }
            usuario.nombreUsuario = validUserData.nombreUsuario
        }

        if (validUserData.passwordNueva){
            if (!validUserData.passwordActual) {
                throw new BadRequestError("Para cambiar la contraseña debés ingresar la contraseña actual")
            }

            const passwordActualValida = await bcrypt.compare(validUserData.passwordActual, usuario.password)
            if (!passwordActualValida) {
                // BadRequestError (400), no UnauthorizedError: esto es una validación de negocio dentro
                // de una sesión ya autenticada, no un fallo de auth — un 401 acá dispararía el logout
                // automático del interceptor de axios del front.
                throw new BadRequestError("La contraseña actual ingresada es incorrecta")
            }

            usuario.password = await bcrypt.hash(validUserData.passwordNueva, this.saltRounds);
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
            userRol: usuario.TipoUsuario,
            userName: usuario.nombreUsuario
            // podemos enviar tambien el idioma para que se configure el front en ese lenguaje 
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
            expiresIn: process.env.JWT_EXPIRATION ?? "10m"
        });
        
        return token;
    }

}