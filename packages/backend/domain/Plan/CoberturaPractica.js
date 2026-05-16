import { PracticaGenerica } from "../Medico/Servicios/PracticaGenerica.js";
import { NivelCobertura } from "../Enumerados/NivelCobertura.js";
import { BadRequestError } from "../../errors/AppErrors.js";


export class CoberturaPractica{
    constructor( {practicaGenerica,nivel} ){
        this.validarPractica(practicaGenerica)
        this.validarNivel(nivel)

        this.practicaGenerica = practicaGenerica;
        this.nivel = nivel;
    }

    // Validacion Constructor

    validarPractica(practicaGenerica){
        if(!(practicaGenerica instanceof PracticaGenerica)){
            throw new BadRequestError('La práctica debe ser un objeto válido')
        }
    }
    
    validarNivel(nivel){
        if(!Object.values(NivelCobertura).includes(nivel)){
            throw new BadRequestError('El nivel de cobertura debe ser un valor válido')
        }
    }

}