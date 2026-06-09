import {
    BadRequestError,
    ConflictError,
    NotFoundError
} from "../../errors/AppErrors.js";
import { medicoDomainSchema } from "../../validations/medicoValidation.js";
import { DisponibilidadHoraria } from "./DisponibilidadHoraria.js";

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

    definirDisponibilidad(...disponibilidadesNuevas) {
        disponibilidadesNuevas.forEach(n => {
            // Verificamos si esta en una sede que pertenezca al medico
            this.validarDisponibilidad(n);
            
            // Validamos que no se pisen
            const hayConflicto = this.disponibilidades.some(m => {
                //Si es de tipo mongoose se va a crear una nueva dispo para hacer la comparación
                const dispoExistente = typeof m.estaSolapada === 'function' ? m : new DisponibilidadHoraria(m);
                
                return dispoExistente.estaSolapada(n);
            });

            if (hayConflicto) {
                throw new ConflictError(`Se solapa la disponibilidad: Día ${n.diaSemana} - Inicio: ${n.horaDesde} - Fin: ${n.horaHasta}` );
            }

            this.disponibilidades.push(n);
        });
    }

    eliminarDisponibilidad(disponibilidadId){ 
        const indice = this.disponibilidades.findIndex(n => n._id == disponibilidadId);

        if (indice !== -1) {
            this.disponibilidades.splice(indice, 1);
        } else{
            throw new BadRequestError("El médico no posee la disponibilidad con ID" + disponibilidadId)
        }
    }

    agregarEspecialidad(especialidad){
        this.especialidades.push(especialidad);
    }

    agregarPractica(practica){
        this.practicas.push(practica);
    }

    agregarSede(sede){
        this.sedes.push(sede)
    }

    eliminarSede(...sedesIds){
        const sedesFaltantes = sedesIds.filter(idBuscado => 
            !this.sedes.some(sede => sede._id.toString() === idBuscado.toString())
        );

        if (sedesFaltantes.length > 0) {
            throw new BadRequestError("El médico no posee las siguientes sedes: " + sedesFaltantes.join(', '));
        }

        this.sedes = this.sedes.filter(sede => 
            !sedesIds.some(id => id.toString() === sede._id.toString())
        );
    }



    practicaGenericaPertenece(idPadre) {
        return this.practicas.some(p => {

            const idGenerica = p.practicaGenerica?._id || p.practicaGenerica;

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
        return this.practicas.some(prac => 
            String(prac.nombre).toLowerCase() === String(nombre).toLowerCase()
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
        const sedesId = this.sedes.map(s => s._id.toString());
        const perteneceASede = sedesId.includes(disponibilidad.sede.toString());
        if (!perteneceASede) {
            throw new BadRequestError('La disponiblidad esta establecida en una sede que no pertenece al medico, Sede: ' + disponibilidad.sede);
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
        
        const especialidadesId = this.especialidades.map(e => e._id.toString());
        const especialidadesIdDispo = especialidades.map(ed => ed.toString());
        
        const especialidadesConflicto = especialidadesIdDispo.every(id => especialidadesId.includes(id));
        
        if (!especialidadesConflicto) {
            throw new BadRequestError('Las especialidades de la disponibilidad no coinciden con las del médico, Especialidades Disponibilidad: ' + especialidades + ' Especialidades Médico: ' + this.especialidades);
        }
    }

    hayConflictoPractica(practicas){
        if (this.practicas.length < practicas.length) {
            throw new BadRequestError('Las practicas de la disponibilidad no coinciden con las del médico');
        }
        
        const practicasId = this.practicas.map(p => p._id.toString());
        const practicasIdDIspo = practicas.map(pd => pd.toString());
            
        const practicasConflicto = practicasIdDIspo.every(id => practicasId.includes(id));
        if (!practicasConflicto) {
            throw new BadRequestError('Las practicas de la disponibilidad no coinciden con las del médico, Practicas Disponibilidad: ' + practicas + ' Practicas Médico: ' + this.practicas);
        }
    }
}