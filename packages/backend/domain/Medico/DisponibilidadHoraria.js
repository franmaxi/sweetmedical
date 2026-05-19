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

    get mcdDuracion() {
        return this.calcularMCDDuraciones();
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

    calcularMCDDuraciones(){
        const duracionesServicios = [
            ...this.practicas.map(p => p.duracionTurnoEnMins),
            ...this.especialidades.map(e => e.duracionTurnoEnMins)
        ];
        //Math.max(15, this.calcularMCD(duracionesServicios))
        return this.calcularMCD(duracionesServicios);
    }

    calcularMCD(numeros) {
        if (!numeros || numeros.length === 0) return 1;
        const mcd = (a, b) => b === 0 ? a : mcd(b, a % b);
        return numeros.reduce((acc, num) => mcd(acc, num));
    }
}