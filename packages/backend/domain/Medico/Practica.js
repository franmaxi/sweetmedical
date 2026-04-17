export class Practica {
    constructor( {codigo, nombre, duracionTurnoEnMins, costo} ) {
        this.validarCodigo(codigo)
        this.validarNombre(nombre)
        this.validarNumeroMayorA0(duracionTurnoEnMins, 'duración del turno en minutos')
        this.validarNumeroMayorA0(costo, 'costo de la práctica')
        
        this.id = null //todo
        this.codigo = codigo
        this.nombre = nombre
        this.duracionTurnoEnMins = duracionTurnoEnMins
        this.costo = costo
    }

    // Validaciones Constructor

    validarCodigo(codigo){
        if (typeof codigo !== 'string' || codigo.trim() === '') {
            throw new TypeError('El código de la práctica debe ser un string no vacío')
        }
    }

    validarNombre(nombre){
        if (typeof nombre !== 'string' || nombre.trim() === '') {
            throw new TypeError('El nombre de la práctica debe ser un string no vacío')
        }
    }
    
    validarNumeroMayorA0(numero, nombreCampo){
        if (typeof numero !== 'number' || numero <= 0) {
            throw new TypeError(`El ${nombreCampo} debe ser un número positivo`)
        }
    }



}