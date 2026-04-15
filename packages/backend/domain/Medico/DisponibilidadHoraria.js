import DiaSemana from "../Enumerados/DiaSemana.js";
class DisponibilidadHoraria {
    constructor( {diaSemana, horaDesde, horaHasta} ) {
        this.validarDiaSemana(diaSemana)
        this.validarHora(horaDesde)
        this.validarHora(horaHasta)
        this.validarRangoHoras(horaDesde, horaHasta)

        this.diaSemana = diaSemana
        this.horaDesde = horaDesde
        this.horaHasta = horaHasta
    }

    validarDiaSemana(diaSemana){
        const valoresDiaSemana = Object.values(DiaSemana)
        if(!valoresDiaSemana.includes(diaSemana)){
            throw new TypeError(`El dia de la semana debe ser uno de los siguientes: ${valoresDiaSemana.join(', ')}`)
        }
    }

    validarHora(hora){
       // validar que sea un string en formato HH:mm y que esté entre 00:00 y 23:59
       if (typeof hora !== 'string') {
            throw new TypeError('La hora debe ser una cadena de texto en formato HH:mm')
        }

        const regex = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/ // me genera dudas si esto funciona bien, lo saque de internet, pero no se si es correcto
        if (!regex.test(hora)) {
            throw new TypeError('La hora debe estar en formato HH:mm y ser válida (00:00 a 23:59)')
        }
    }

    validarRangoHoras(horaInicial, horaFinal){    
        const minutosDesde = this.convertirHoraEnMinutos(horaInicial)
        const minutosHasta = this.convertirHoraEnMinutos(horaFinal)
         
        if (minutosDesde >= minutosHasta) {
            throw new RangeError('La hora de inicio debe ser menor que la hora de fin')
        }
    }

    convertirHoraEnMinutos(hora){
        const [horas, minutos] = hora.split(':').map(Number)
        return horas * 60 + minutos
    }
        


}

