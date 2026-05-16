import { BadRequestError } from "../../errors/AppErrors.js";

export class ObraSocial{
    constructor( {nombre} ){
        this.validarNombre(nombre)

        this.id = null; //todo
        this.nombre = nombre;
        this.planes = [];
    }

    // Validacion Constructor

    validarNombre(nombre){
        if (!nombre || typeof nombre !== 'string') {
            throw new BadRequestError('El nombre debe ser una cadena de texto válida')
        }
    }
    
    agregarPlanes(...planes){
        this.planes.push(...planes);
    }
   
}