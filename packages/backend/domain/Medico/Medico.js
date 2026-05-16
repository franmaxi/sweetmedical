import {
    BadRequestError,
    ConflictError
} from "../../errors/AppErrors.js";

export class Medico {
    constructor( {usuarioId, matricula, nombre} ){
        this.validarUsuario(usuarioId)
        this.validarMatricula(matricula)
        this.validarNombre(nombre)

        this.id = null; //todo
        this.usuarioId = usuarioId
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
            this.validarDisponibilidad(n)
            
            // validamos que no se pisen
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
    agregarEspecialidad(id){
        this.especialidades.push(id)
    }
    agregarPractica(id){
        this.practicas.push(id)
    }
    eliminarEspecialidad(id){
        const indice = this.especialidades.findIndex(
            especialidadId => especialidadId.toString() === id.toString()
        )
        if(indice === -1){
            throw new NotFoundError("La especialidad no pertenece a este médico")
        }
        this.especialidades.splice(indice, 1)
    }
    eliminarPractica(id){
        const indice = this.practicas.findIndex(
            practicaId => practicaId.toString() === id.toString()
        )
        if(indice === -1){
            throw new NotFoundError("La practica no pertenece a este médico")
        }
        this.practicas.splice(indice, 1)
    }
    validarDisponibilidad(disponibilidad){
        // Validamos la sede
        const sedesId = this.sedes.map(s => s.id)
        const perteneceASede = sedesId.includes(disponibilidad.sede.id)
        if (!perteneceASede) {
            throw new BadRequestError('La disponiblidad esta establecida en una sede que no pertenece al medico, Sede: ' + disponibilidad.sede.nombre)
        }

        // validamos laas especialidades
        this.hayConflictoEspecialidad(disponibilidad.especialidades)
        
        //validamos las practicas
        this.hayConflictoPractica(disponibilidad.practicas)
        
    }


    hayConflictoEspecialidad(especialidades){
        if (this.especialidades.length < especialidades.length) {
            throw new BadRequestError('Las especialidades de la disponibilidad no coinciden con las del médico')
        }
            
        const especialidadesId = this.especialidades.map(e => e.id)
        const especialidadesIdDispo = especialidades.map(ed => ed.id)
        
        const especialidadesConflicto = especialidadesIdDispo.every( id => especialidadesId.includes(id) )
        
        if (!especialidadesConflicto) {
            throw new BadRequestError('Las especialidades de la disponibilidad no coinciden con las del médico, Especialidades Disponibilidad: ' + especialidades + ' Especialidades Médico: ' + this.especialidades)
        }
    }

    hayConflictoPractica(practicas){
        if (this.practicas.length < practicas.length) {
            throw new BadRequestError('Las practicas de la disponibilidad no coinciden con las del médico')
        }
        
        const practicasId = this.practicas.map(p=> p.id)
        const practicasIdDIspo = practicas.map(pd=>pd.id)
            
        const practicasConflicto = practicasIdDIspo.every( id => practicasId.includes(id))
        if (practicasConflicto) {
            throw new BadRequestError('Las practicas de la disponibilidad no coinciden con las del médico, Practicas Disponibilidad: ' + practicas + ' Practicas Médico: ' + this.practicas)
        }
        
    }


    // Validaciones Constructor

    validarUsuarioId(usuarioId){
        if (typeof usuarioId !== 'object' ) { 
            throw new TypeError('El usuarioId debe ser un object, se mandó: ' + typeof usuario)
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