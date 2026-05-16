import { BadRequestError } from "../../../errors/AppErrors.js"
export class EspecialidadGenerica{
    
    constructor({nombre}){
        this.validarNombre(nombre)

        this.id = null
        this.nombre = nombre;
    }
    
    validarNombre(nombre){
        if (typeof nombre !== 'string' || nombre.trim() === '') {
            throw new BadRequestError('El nombre de la especialidad debe ser un string no vacío')
        }
    }
}