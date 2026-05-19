import { Turno } from "./Turno.js"
import { DiaSemana } from "../Enumerados/DiaSemana.js"
import { BadRequestError, UnprocessableEntityError } from "../../errors/AppErrors.js"

export class Agenda {

    /*
    Logica de Generacion de turnos.
    Vamos a tomar de cada disponibilidad de un medico los datos y vamos a generar los turnos.
    Por sistema vamos a tener un minimo comun divisor de las opciones posibles de duracion de las especialidades/practicas
    Esto es para asegurarnos que sea simple la organizacion temporal
    Ej: si el mcd es 15, los turnos deben ser multiplos de 15 (a confirmar)
    Para generar la menor cantidad de turnos posibles, tomaremos el mcd de las especialidades/practicas de la disponibilidad especifica.
    Los turnos se generan con la lista de especialidades y practicas disponibles a solicitar / o / con una referencia a la disponibilidad asociada
    Los turnos se van a combinar, pero se guarda la entidad en estado "Combinado"
    */

    // especialidad 1 = 15 minutos / especialidad 2 = 30 minutos
    // disponibilidad de 2 a 6
    // yo genero turnos de 15 minutos (mcd), a las 5:45 no puedo ofrecer la especialidad 2

    // Cuidado con los ultimos turnos del horario, en los ultimos 10 minutos no podemos ofrecer turnos de algo que dura 30 minutos
    generarTurnos(medico, fechaInicial, fechaFinal) {
        // SE CALCULA UNA SOLA SEMANA
        // fechaInicial y fechaFinal son tipo date, las fechas de inicio del calculo de turnos y de fin/limite de calculo de turno

        // 1 -> mes siguiente -> generas todo mes 2, mes 1 no tiene turnos
        // 2 -> generar el mes 3, pero mes 2 tiene turnos
        // semana 1, genero 2,3,4,5
        // semana 2, genera 6
        // semana 3, genera 7
        // semana 4, genera 8
        const turnosGenerados = []

        if(!medico?.disponibilidades || medico.disponibilidades.length === 0){
            console.log("[Batch] El medico no tiene disponibilidades")
            return turnosGenerados
        }

        const inicio = new Date(fechaInicial)
        const fin = new Date(fechaFinal)

        if (isNaN(inicio) || isNaN(fin)) { 
            throw new BadRequestError('Las fechas inicial y final deben ser objetos Date válidos');
        }

        if (inicio >= fin) {
            throw new RangeError('La fecha inicial debe ser menor o igualque la final')
        }

        medico.disponibilidades.forEach(dispo => {            
            const turnos = this.generarTurnosPorDisponibilidad(medico, dispo, inicio, fin)
            turnosGenerados.push(...turnos)
        });
        
        return turnosGenerados
    }

    // dispo tiene 2 especialidades de 30 y 60 minutos
    // mcd es de 30 minutos -> los turnos los genero de a 30 minutos -> 2 horas = 4 turnos totales

    /* 
        Consideracion que tuvimos
        turnos de 2 horas
        de 23 a 2am
        para el sistema tenemos una dispo de 23 a 24 y otra de 0 a 2
        30 mins, 11.45 no existe
    */

    // cuando un turno se cancela:
    // el turno viejo se "archiva", se copian datos clave como medico y fecha y hora. 
    // Con los datos buscamos la disponibilidad para generar el un nuevo turno
    // Esto permite hacer la validación que la dispo siga existiendo.


    generarTurnosPorDisponibilidad(medico, disponibilidad, inicio, fin){
        console.log("[Batch] Generando Turnos para disponibilidad")
        console.log(disponibilidad)
        
        const turnosGenerados = [] 
        const duracionesUnicas = [
            ...new Set([
                ...disponibilidad.practicas.map(p => p.duracionTurnoEnMins),
                ...disponibilidad.especialidades.map(e => e.duracionTurnoEnMins)
            ])
        ].sort((a,b) => a-b) 
        // ordenar duraciones
        // matriz
        const matrizOpcionesTurno = this.obtenerMatrizEspecialidadPracticaDuracion(disponibilidad.especialidades, disponibilidad.practicas, duracionesUnicas)
        // duracion de HH:mm
        const duracionTurnos = disponibilidad.mcdDuracion

        const diaDesde = new Date(inicio)
        diaDesde.setHours(0,0,0,0)
        
        const diaHasta = new Date(fin)
        diaHasta.setHours(23,59,59,999)

        // llevo la fecha de GMT-3 a UTC con un formatter
        
        // recorro cada dia entre el inicio y el fin
        for (let fecha = new Date(diaDesde); fecha <= diaHasta; fecha.setUTCDate(fecha.getUTCDate() + 1)) {

            if (this.obtenerDiaFechaArgentina(fecha) !== disponibilidad.diaSemana) continue;

            const [horaDesde, minutoDesde] = disponibilidad.horaDesde.split(':').map(Number)
            const [horaHasta, minutoHasta] = disponibilidad.horaHasta.split(':').map(Number)

            // trabajamos en UTC por si el server no es argentino, sumamos +3 para que la hora sea argentina
            //TODO revisar esto para ver que onda, tenemos que manejar UTC por las dudas del servidor
            const inicioSlot = new Date(fecha)
            inicioSlot.setUTCHours(horaDesde + 3, minutoDesde, 0, 0)
            const finSlot = new Date(fecha)
            finSlot.setUTCHours(horaHasta + 3, minutoHasta, 0, 0)

            // en el for de abajo podriamos usar la variable cantidad turnos, y tener un contador de turno actual
            for(
                let turnoInicio = new Date(inicioSlot);
                turnoInicio.getTime() + duracionTurnos * 60000 <= finSlot.getTime();
                turnoInicio = new Date(turnoInicio.getTime() + duracionTurnos * 60000)
            ) {
                const minutosRestantes = (finSlot.getTime() - turnoInicio.getTime()) / 60000
                const indexMatriz = this.obtenerMasCercanoMenor(minutosRestantes, duracionesUnicas)
                const opcionesTurno = matrizOpcionesTurno.get(indexMatriz)

                const nuevoTurno = new Turno({
                    medico: medico,
                    fechaHora: new Date(turnoInicio), // dispo_hora_inicio + (index*duracionTurnos)
                    sede: disponibilidad.sede,
                    practica: opcionesTurno.practicas,
                    especialidad: opcionesTurno.especialidades,
                    disponibilidad: disponibilidad
                    //practica: [...(disponibilidad.practicas ?? [])], 
                    //especialidad: [...(disponibilidad.especialidades ?? [])]
                })
                turnosGenerados.push(nuevoTurno)
            }
        } 
        return turnosGenerados;
    }


    obtenerDiaFechaArgentina(fechaUTC) {
        const AR_OFFSET_MS = -3 * 60 * 60 * 1000
        const fechaAR = new Date(fechaUTC.getTime() + AR_OFFSET_MS)
        return fechaAR.getUTCDay()
    }

    obtenerMatrizEspecialidadPracticaDuracion(especialidades, practicas, duracionesUnicas){
        // duracionTurnos viene ordenada
        const matrizOpciones = new Map()
        const duracionesDistintas = duracionesUnicas.length
        for (let i = 0; i < duracionesDistintas; i++) {
            matrizOpciones.set(
                duracionesUnicas[i], 
                {
                    practicas: practicas.filter( (p) => p.duracionTurnoEnMins <= duracionesUnicas[i] ),
                    especialidades: especialidades.filter ((e) => e.duracionTurnoEnMins <= duracionesUnicas[i])
                } 
            )
        }
        return matrizOpciones
    }

    calcularMCD(numeros) {
        if (!numeros || numeros.length === 0) return 1;
        const mcd = (a, b) => b === 0 ? a : mcd(b, a % b);
        return numeros.reduce((acc, num) => mcd(acc, num));
    }

    obtenerMasCercanoMenor(numero, array) {
        // busca de un array el numero mas cercano al pedido que sea menor, consideramos lista ordenada
        let resultado = undefined;
        for (const n of array) {
            if (n <= numero) {
                resultado = n;
            } else { // como está ordenado, ya no hace falta seguir
                break;
            }
        }
        if (resultado === undefined) {
            throw new UnprocessableEntityError(`No existe un número menor o igual a: ${numero}`)
        }
        return resultado;
    }

    refrescarTurnosSegun(practica, medico) {
        //TODO
    }
}
