import { Usuario } from "../Usuario.js";


export class Medico {
    constructor( {usuario, matricula, nombre} ){
        this.validarUsuario(usuario)
        this.validarMatricula(matricula)
        this.validarNombre(nombre)

        this.id = null; //todo
        this.usuario = usuario
        this.matricula = matricula
        this.nombre = nombre
        this.especialidades = []
        this.practicas = []
        this.sedes = []
        this.disponibilidades = []
    }

    definirDisponibilidad(...disponibilidad){
        this.disponibilidades.push(...disponibilidad)
    }

    eliminarDisponibilidad(disponibilidad){ 
        this.disponibilidades = this.disponibilidades.filter(d => d !== disponibilidad) 
    }


    // Validaciones Constructor

    validarUsuario(usuario){
        if (!usuario instanceof Usuario) { 
            throw new TypeError('El usuario debe ser un objeto válido')
        }
    }
    
    validarMatricula(matricula){
        if (typeof matricula !== 'string' || matricula.trim() === '') {
            throw new TypeError('La matrícula debe ser un string no vacío')
        }
    }

    validarNombre(nombre){
        if (typeof nombre !== 'string' || nombre.trim() === '') {
            throw new TypeError('El nombre del médico debe ser un string no vacío')
        }
    }
}