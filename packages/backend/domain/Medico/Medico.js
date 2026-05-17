import {
    BadRequestError,
    ConflictError,
    NotFoundError
} from "../../errors/AppErrors.js";
import { medicoDomainSchema } from "../../validations/medicoValidation.js";

export class Medico {
    constructor( { usuarioId, usuario, matricula, nombre } ){
        const u = usuario || usuarioId;
        const valid = medicoDomainSchema.parse({ usuario: u, matricula, nombre });

        // _id
        this.usuario = valid.usuario;
        this.matricula = valid.matricula;
        this.nombre = valid.nombre;
        this.especialidades = [];
        this.practicas = [];
        this.sedes = [];
        this.disponibilidades = [];
        this.eliminado = false;
    }

    definirDisponibilidad(...disponibilidadesNuevas){
        disponibilidadesNuevas.forEach(n => {
            // verificamos si esta en una sede que pertenezca al medico - Ya verifico por id
            this.validarDisponibilidad(n);
            
            // validamos que no se pisen
            const hayConflicto = this.disponibilidades.some(m => m.estaSolapada(n));
            if(hayConflicto){
                throw new ConflictError('Se solapa la disponibilidad: Dia '+ n.diaSemana + ' Hora inicio: ' + n.horaDesde + ' Hora Final: ' + n.horaHasta);
            }

            this.disponibilidades.push(n);
        });
    }

    eliminarDisponibilidad(disponibilidad){ 
        const indice = this.disponibilidades.findIndex(n => n._id == disponibilidad._id);

        if (indice !== -1) {
            this.disponibilidades.splice(indice, 1);
        }
    }

    agregarEspecialidad(especialidad){
        this.especialidades.push(especialidad);
    }

    agregarPractica(practica){
        this.practicas.push(practica);
    }

    practicaGenericaPertenece(idPadre) {
        return this.especialidades.some(e => {

            const idGenerica = e.practicaGenerica?._id || e.practicaGenerica;

            return String(idGenerica) === String(idPadre);
        });
    }

    especialidadGenericaPertenece(idPadre) {
        return this.especialidades.some(e => {

            const idGenerica = e.especialidadGenerica?._id || e.especialidadGenerica;

            return String(idGenerica) === String(idPadre);
        });
    }

    tieneEspecialidadConNombre(nombre) {
        return this.especialidades.some(esp => 
            String(esp.nombre).toLowerCase() === String(nombre).toLowerCase()
        );
    }

    tienePracticasConNombre(nombre) {
        return this.especialidades.some(esp => 
            String(esp.nombre).toLowerCase() === String(nombre).toLowerCase()
        );
    }

    eliminarEspecialidad(id) {
        const indice = this.especialidades.findIndex(
            esp => String(esp._id || esp) === String(id)
        );
        if (indice === -1) {
            throw new NotFoundError("La especialidad no pertenece a este médico");
        }
        this.especialidades.splice(indice, 1);
    }

    eliminarPractica(id) {
        const indice = this.practicas.findIndex(
            prac => String(prac._id || prac) === String(id)
        );
        if (indice === -1) {
            throw new NotFoundError("La práctica no pertenece a este médico");
        }
        this.practicas.splice(indice, 1);
    }

   
    validarDisponibilidad(disponibilidad){
        // Validamos la sede
        const sedesId = this.sedes.map(s => s._id);
        const perteneceASede = sedesId.includes(disponibilidad.sede._id);
        if (!perteneceASede) {
            throw new BadRequestError('La disponiblidad esta establecida en una sede que no pertenece al medico, Sede: ' + disponibilidad.sede.nombre);
        }

        // validamos las especialidades
        this.hayConflictoEspecialidad(disponibilidad.especialidades);
        
        // validamos las practicas
        this.hayConflictoPractica(disponibilidad.practicas);
    }

    hayConflictoEspecialidad(especialidades){
        if (this.especialidades.length < especialidades.length) {
            throw new BadRequestError('Las especialidades de la disponibilidad no coinciden con las del médico');
        }
        
        const especialidadesId = this.especialidades.map(e => e._id);
        const especialidadesIdDispo = especialidades.map(ed => ed._id);
        
        const especialidadesConflicto = especialidadesIdDispo.every(id => especialidadesId.includes(id));
        
        if (!especialidadesConflicto) {
            throw new BadRequestError('Las especialidades de la disponibilidad no coinciden con las del médico, Especialidades Disponibilidad: ' + especialidades + ' Especialidades Médico: ' + this.especialidades);
        }
    }

    hayConflictoPractica(practicas){
        if (this.practicas.length < practicas.length) {
            throw new BadRequestError('Las practicas de la disponibilidad no coinciden con las del médico');
        }
        
        const practicasId = this.practicas.map(p => p._id);
        const practicasIdDIspo = practicas.map(pd => pd._id);
            
        const practicasConflicto = practicasIdDIspo.every(id => practicasId.includes(id));
        if (!practicasConflicto) {
            throw new BadRequestError('Las practicas de la disponibilidad no coinciden con las del médico, Practicas Disponibilidad: ' + practicas + ' Practicas Médico: ' + this.practicas);
        }
    }
}