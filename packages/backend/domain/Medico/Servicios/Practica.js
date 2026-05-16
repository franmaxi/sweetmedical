import { BadRequestError } from "../../../errors/AppErrors"
import { NivelCobertura } from "../../Enumerados/NivelCobertura"
export class Practica {
    constructor( {codigo,practicaGenerica, nombre, duracionTurnoEnMins, costo} ) {
        this.validarEnteroPositivo(practicaGenerica,"id")
        this.validarCodigo(codigo)
        this.validarNombre(nombre)
        this.validarNumeroMayorA0(duracionTurnoEnMins, 'duración del turno en minutos')
        this.validarNumeroMayorA0(costo, 'costo de la práctica')
        
        this.id = null //todo
        this.practicaGenerica = practicaGenerica
        this.codigo = codigo
        this.nombre = nombre
        this.duracionTurnoEnMins = duracionTurnoEnMins
        this.costo = costo
    }

    // Validaciones Constructor
    validarEnteroPositivo(numero, parametro) {
            if (!Number.isInteger(numero) || numero <= 0) {
                throw new BadRequestError(`El parámetro ${parametro} debe ser un entero positivo`)
        }
    }

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
            throw new TypeError(`${nombreCampo} debe ser un número positivo`)
        }
    }
    calcularCostoSegunCobertura(nivelCobertura){
        if(nivelCobertura == NivelCobertura.TOTAL) return 0
        if(nivelCobertura == NivelCobertura.PARCIAL) return this.costo *0.5
        return this.costo
    }
}