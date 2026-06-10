import { BadRequestError } from "../../errors/AppErrors.js";
import { disponibilidadDomainSchema } from "../../validations/medicoValidation.js";

export class DisponibilidadHoraria {
    constructor( { diaSemana, horaDesde, horaHasta, sede , especialidades = [], practicas = []} ) {
        const valid = disponibilidadDomainSchema.parse({ diaSemana, horaDesde, horaHasta, sede });

        // _id
        this.diaSemana = valid.diaSemana;
        this.horaDesde = valid.horaDesde; // string con formato "HH:mm"
        this.horaHasta = valid.horaHasta;
        this.especialidades = especialidades
        this.practicas = practicas
        this.sede = valid.sede;
    }

    convertirHoraEnMinutos(hora){
        const [horas, minutos] = hora.split(':').map(Number);
        return horas * 60 + minutos;
    }
    
    estaSolapada(dispo){
        if(this.diaSemana !== dispo.diaSemana){
            return false;
        }
        return this.convertirHoraEnMinutos(this.horaDesde) < dispo.convertirHoraEnMinutos(dispo.horaHasta) && 
               this.convertirHoraEnMinutos(this.horaHasta) > dispo.convertirHoraEnMinutos(dispo.horaDesde);
    }

    eliminarEspecialidad(id){
        const indice = this.especialidades.findIndex(n => String(n._id || n) === String(id));

        if (indice !== -1) {
            this.especialidades.splice(indice, 1);
        } 
    }

    eliminarPractica(id){
        const indice = this.practicas.findIndex(n => String(n._id || n) === String(id));
        
        if (indice !== -1) {
            this.practicas.splice(indice, 1);
        } 
    }
    
    obtenerDiferenciaEnMinutos(){
       return this.convertirHoraEnMinutos(this.horaHasta) - this.convertirHoraEnMinutos(this.horaDesde);
    }

}