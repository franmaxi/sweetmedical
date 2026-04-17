export class Plan{
    constructor( {nombre} ){
        this.validarNombre(nombre)

        this.id = null //todo
        this.nombre = nombre;
        this.coberturaEspecialidad = [];
        this.coberturaPractica = [];
    }

    obtenerCobertura(especialidad){
        const cobertura = this.coberturaEspecialidad.find(c => c.especialidad === especialidad); //tiene q devolver un unico elemento
        return cobertura.nivel;
        // puede que tengamos que verificar los ids en vez de la especialidad directa segun como se trabaje con la persistencia
    }
    obtenerCobertura(practica){
        const cobertura = this.coberturaPractica.find(c => c.practica === practica);  //tiene q devolver un unico elemento
        return cobertura.nivel;
    }
    
    // Validacion Constructor

    validarNombre(nombre){
        if (typeof nombre !== 'string' || nombre.trim() === '') {
            throw new TypeError('El nombre del plan debe ser un string no vacío')
        }
    }

    
}