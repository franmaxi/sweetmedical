export class ObraSocial{
    constructor( {nombre} ){
        this.validarNombre(nombre)

        this.id = null; //todo
        this.nombre = nombre;
        this.planes = [];
    }
    validarNombre(nombre){
        if (!nombre || typeof nombre !== 'string') {
            throw new TypeError('El nombre debe ser una cadena de texto válida')
        }
    }
    
    agregarPlanes(...planes){
        this.planes.push(...planes);
    }
   
}