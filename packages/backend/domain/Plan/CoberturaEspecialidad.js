import { EspecialidadGenerica } from "../Medico/Servicios/EspecialidadGenerica.js";
import { NivelCobertura } from "../Enumerados/NivelCobertura.js";
import { BadRequestError } from "../../errors/AppErrors.js";

export class CoberturaEspecialidad{
    constructor( {especialidadGenerica,nivel} ){
        this.validarEspecialidad(especialidadGenerica)
        this.validarNivel(nivel)

        this.especialidadGenerica = especialidadGenerica;
        this.nivel = nivel;
    }

    // Validacion Constructor

    validarEspecialidad(especialidadGenerica){
        if (!(especialidadGenerica instanceof EspecialidadGenerica)){
            throw new BadRequestError('La especialidad debe ser un objeto válido')
        }
    }

    validarNivel(nivel){
        if(!Object.values(NivelCobertura).includes(nivel)){
            throw new BadRequestError('El nivel de cobertura debe ser un valor válido')
        }
    }
}  