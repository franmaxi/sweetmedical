export class Sede {
    constructor( {nombre, direccion} ) {
        this.validarString(nombre, 'nombre')
        this.validarString(direccion, 'direccion')

        this.id = null //todo
        this.nombre = nombre
        this.direccion = direccion
    }

    // Validacion Constructor

    validarString(string, nombreCampo){
        if (typeof string !== 'string' || string.trim() === '') {
            throw new TypeError(`El ${nombreCampo} debe ser un string no vacío`)
        }
    }


}