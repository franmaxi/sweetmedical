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
    
    obtenerDiferenciaEnMinutos(){
       return this.convertirHoraEnMinutos(this.horaHasta) - this.convertirHoraEnMinutos(this.horaDesde);
    }

}