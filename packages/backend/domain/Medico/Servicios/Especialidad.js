
import { BadRequestError } from "../../../errors/AppErrors.js"
import { NivelCobertura } from "../../Enumerados/NivelCobertura.js"
export class Especialidad{
    constructor( {especialidadGenerica,nombre,duracionTurnoEnMins,costo} ){
        this.validarEnteroPositivo(especialidadGenerica,"id")
        this.validarNombre(nombre)
        this.validarDuracionTurnoEnMins(duracionTurnoEnMins)
        this.validarCostoConsulta(costo)

        this.id = null //TODO
        this.especialidadGenerica = especialidadGenerica
        this.nombre = nombre;
        this.duracionTurnoEnMins = duracionTurnoEnMins;
        this.costo = costo;
    }


    // Validaciones Constructor
    validarEnteroPositivo(numero, parametro) {
        if (!Number.isInteger(numero) || numero <= 0) {
            throw new BadRequestError(`El parámetro ${parametro} debe ser un entero positivo`)
        }
    }

    validarNombre(nombre){
        if (typeof nombre !== 'string' || nombre.trim() === '') {
            throw new BadRequestError('El nombre de la especialidad debe ser un string no vacío')
        }
    }
    
    validarDuracionTurnoEnMins(duracion){
        if (typeof duracion !== 'number' || duracion <= 0) {
            throw new BadRequestError('La duración del turno en minutos debe ser un número positivo')
        }
    }

    validarCostoConsulta(costo){
        if (typeof costo !== 'number' || costo < 0) {
            throw new BadRequestError('El costo de la consulta debe ser un número no negativo')
        }
    }
    
    calcularCostoSegunCobertura(nivelCobertura){
        if(nivelCobertura == NivelCobertura.TOTAL) return 0
        if(nivelCobertura == NivelCobertura.PARCIAL) return this.costo *0.5
        return this.costo
    }
}