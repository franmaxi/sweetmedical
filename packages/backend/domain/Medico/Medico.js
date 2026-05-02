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
        this.eliminado = false
    }

    definirDisponibilidad(...disponibilidadesNuevas){
        
        disponibilidadesNuevas.array.forEach(n => {
            // verificamos si esta en una sede que pertenezca al medico - Ya verifico por id
            const sedesId = this.sedes.map(s => s.id)
            const perteneceASede = sedesId.includes(n.sede.id)
            if (!perteneceASede) {
                throw new BadRequestError('La disponiblidad esta establecida en una sede que no pertenece al medico, Sede: ' + n.sede.nombre)
            }
            
            const hayConflicto = this.disponibilidades.some(m => m.seSolapan(n))
            if(hayConflicto){
                throw new ConflictError('Se solapa la disponibilidad: Dia '+ n.diaSemana + 'Hora inicio: ' + n.horaDesde + '  Hora Final: ' + n.horaHasta)
            }

            this.disponibilidades.push(n)
        });

    }


    eliminarDisponibilidad(disponibilidad){ 
        const indice = this.disponibilidades.findIndex(n=> n.id==disponibilidad.id)

        if (indice !== -1) {
            this.disponibilidades.splice(indice,1)
        }
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