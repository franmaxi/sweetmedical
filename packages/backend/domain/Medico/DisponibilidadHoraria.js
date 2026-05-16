import { BadRequestError } from "../../errors/AppErrors.js";
import { UnprocessableEntityError } from "../../errors/AppErrors.js";
import { DiaSemana } from "../Enumerados/DiaSemana.js";


export class DisponibilidadHoraria {
    constructor( {diaSemana, horaDesde, horaHasta, sede} ) {
        this.validarDiaSemana(diaSemana)
        this.validarHora(horaDesde)
        this.validarHora(horaHasta)
        this.validarRangoHoras(horaDesde, horaHasta)

        this.id = null;
        this.diaSemana = diaSemana
        this.horaDesde = horaDesde // es del tipo string con "HH:mm"
        this.horaHasta = horaHasta
        this.especialidades = []
        this.practicas = []
        this.sede = sede
        this.mcdDuracion = this.calcularMCDDuraciones() //mcd de las duraciones de especialidades y practicas
    }
    
    // Validaciones Constructor

    validarDiaSemana(diaSemana){
        const valoresDiaSemana = Object.values(DiaSemana)
        if(!valoresDiaSemana.includes(diaSemana)){
            throw new UnprocessableEntityError(`El dia de la semana debe ser uno de los siguientes: ${valoresDiaSemana.join(', ')}`)
        }
    }

    validarHora(hora){
       // validar que sea un string en formato HH:mm y que este entre 00:00 y 23:59
       if (typeof hora !== 'string') {
            throw new BadRequestError('La hora debe ser una cadena de texto en formato HH:mm')
        }

        const regex = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/ // me genera dudas si esto funciona bien, lo saque de internet, pero no se si es correcto
        if (!regex.test(hora)) {
            throw new UnprocessableEntityError('La hora debe estar en formato HH:mm y ser válida (00:00 a 23:59)')
        }
    }

    validarRangoHoras(horaInicial, horaFinal){    
        const minutosDesde = this.convertirHoraEnMinutos(horaInicial)
        const minutosHasta = this.convertirHoraEnMinutos(horaFinal)
         
        if (minutosDesde >= minutosHasta) {
            throw new UnprocessableEntityError('La hora de inicio debe ser menor que la hora de fin')
        }
    }

    convertirHoraEnMinutos(hora){
        const [horas, minutos] = hora.split(':').map(Number)
        return horas * 60 + minutos
    }
    
    estaSolapada(dispo){
        if(this.diaSemana !== dispo.diaSemana){
            return false
        }
        return this.convertirHoraEnMinutos(this.horaDesde) < this.convertirHoraEnMinutos(dispo.horaHasta) && 
        this.convertirHoraEnMinutos(this.horaHasta) > this.convertirHoraEnMinutos(dispo.horaDesde)
    }
    
    obtenerDiferenciaEnMinutos(){
       return this.convertirHoraEnMinutos(this.horaHasta) - this.convertirHoraEnMinutos(this.horaDesde)
    }

    calcularMCDDuraciones(){
        const duracionesServicios = [
            ...this.practicas.map(p => p.duracionTurnoEnMins),
            ...this.especialidades.map(e => e.duracionTurnoEnMins)
        ]
        return this.calcularMCD(duracionesServicios)
    }

    calcularMCD(numeros) {
        if (!numeros || numeros.length === 0) return 1;
        const mcd = (a, b) => b === 0 ? a : mcd(b, a % b);
        return numeros.reduce((acc, num) => mcd(acc, num));
    }
}