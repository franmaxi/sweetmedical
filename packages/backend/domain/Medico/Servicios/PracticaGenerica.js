import { BadRequestError } from "../../../errors/AppErrors.js"
export class PracticaGenerica{
    
    constructor({nombre,codigo}){
        this.validarString(nombre, "nombre")
        this.validarString(codigo, "codigo")


        this.id = null
        this.nombre = nombre;
        this.codigo = codigo
    }
    
    validarString(nombre, parametro){
        if (typeof nombre !== 'string' || nombre.trim() === '') {
            throw new BadRequestError(`El ${parametro} de la especialidad debe ser un string no vacío`)
        }
    }
}