import { Usuario } from "../Usuario.js";
import { ObraSocial } from "./ObraSocial.js";
import { Plan } from "../Plan/Plan.js";
import { BadRequestError } from "../../errors/AppErrors.js";
export class Paciente {

    constructor( {usuario,dni,nombre,obraSocial,plan} ){
        this.validarUsuario(usuario)
        this.validarDni(dni)
        this.validarNombre(nombre)
        this.validarObraSocial(obraSocial)

        this.id = null; //todo
        this.usuario = usuario;
        this.dni = dni;
        this.nombre = nombre;
        this.obraSocial = obraSocial;
        this.plan = plan;
        this.eliminado = false
    }

    // Validacion Constructor
    
    validarUsuario(usuario){
        if (!(usuario instanceof Usuario)) {
            throw new BadRequestError('El usuario debe ser un objeto usuario válido')
        }
    }

    validarDni(dni){
        if (typeof dni !== 'string' || dni.trim() === '') {
            throw new BadRequestError('El DNI debe ser un string no vacío')
        }
        //TODO validar formato de DNI
    }

    validarNombre(nombre){
        if (typeof nombre !== 'string' || nombre.trim() === '') {
            throw new BadRequestError('El nombre del paciente debe ser un string no vacío')
        }
    }
    
    validarObraSocial(obraSocial){
        if (!(obraSocial instanceof ObraSocial)) {
            throw new BadRequestError('La obra social debe ser un objeto válido')
        }
    }
    
    validarPlan(plan){
        if (!(plan instanceof Plan)) {
            throw new BadRequestError('El plan debe ser un objeto válido')
        }
    }

}