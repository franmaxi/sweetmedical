export class Especialidad{
    constructor( {nombre,duracionTurnoEnMins,costoConsulta} ){
        this.validarNombre(nombre)
        this.validarDuracionTurnoEnMins(duracionTurnoEnMins)
        this.validarCostoConsulta(costoConsulta)

        this.id = null //todo
        this.nombre = nombre;
        this.duracionTurnoEnMins = duracionTurnoEnMins;
        this.costoConsulta = costoConsulta;
    }

    validarNombre(nombre){
        if (typeof nombre !== 'string' || nombre.trim() === '') {
            throw new TypeError('El nombre de la especialidad debe ser un string no vacío')
        }
    }
    
    validarDuracionTurnoEnMins(duracion){
        if (typeof duracion !== 'number' || duracion <= 0) {
            throw new TypeError('La duración del turno en minutos debe ser un número positivo')
        }
    }

    validarCostoConsulta(costo){
        if (typeof costo !== 'number' || costo < 0) {
            throw new TypeError('El costo de la consulta debe ser un número no negativo')
        }
    }
}