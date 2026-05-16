import { PracticaGenerica } from "../Medico/Servicios/PracticaGenerica.js";
import { NivelCobertura } from "../Enumerados/NivelCobertura.js";
export class CoberturaPractica{
    constructor( {practicaGenerica,nivel} ){
        this.validarPractica(practica)
        this.validarNivel(nivel)

        this.practicaGenerica = practicaGenerica;
        this.nivel = nivel;
    }

    // Validacion Constructor

    validarPractica(practicaGenerica){
        if(!(practicaGenerica instanceof PracticaGenerica)){
            throw new TypeError('La práctica debe ser un objeto válido')
        }
    }
    
    validarNivel(nivel){
        if(!Object.values(NivelCobertura).includes(nivel)){
            throw new TypeError('El nivel de cobertura debe ser un valor válido')
        }
    }

}