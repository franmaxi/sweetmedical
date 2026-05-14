import { Practica } from "../Medico/Practica.js";
import { NivelCobertura } from "../Enumerados/NivelCobertura.js";
export class CoberturaPractica{
    constructor( {practica,nivel} ){
        this.validarPractica(practica)
        this.validarNivel(nivel)

        this.practica = practica;
        this.nivel = nivel;
    }

    // Validacion Constructor

    validarPractica(practica){
        if(!(practica instanceof Practica)){
            throw new TypeError('La práctica debe ser un objeto válido')
        }
    }
    
    validarNivel(nivel){
        if(!Object.values(NivelCobertura).includes(nivel)){
            throw new TypeError('El nivel de cobertura debe ser un valor válido')
        }
    }

}