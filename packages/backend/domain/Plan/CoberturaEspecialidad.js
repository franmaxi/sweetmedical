import { Especialidad } from "../Medico/Especialidad.js";
import { NivelCobertura } from "../Enumerados/NivelCobertura.js";
export class CoberturaEspecialidad{
    constructor( {especialidad,nivel} ){
        this.validarEspecialidad(especialidad)
        this.validarNivel(nivel)

        this.especialidad = especialidad;
        this.nivel = nivel;
    }

    // Validacion Constructor

    validarEspecialidad(especialidad){
        if (!(especialidad instanceof Especialidad)){
            throw new TypeError('La especialidad debe ser un objeto válido')
        }
    }

    validarNivel(nivel){
        if(!Object.values(NivelCobertura).includes(nivel)){
            throw new TypeError('El nivel de cobertura debe ser un valor válido')
        }
    }
}  