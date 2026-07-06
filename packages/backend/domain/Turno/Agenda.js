import { Turno } from "./Turno.js"
import { DiaSemana } from "../Enumerados/DiaSemana.js"
import { BadRequestError, UnprocessableEntityError } from "../../errors/AppErrors.js"

export class Agenda {

    generarTurnos(medico, fechaInicial, fechaFinal, duracionTurnos) {
        const turnosGenerados = []

        if (!medico?.disponibilidades || medico.disponibilidades.length === 0) {
            console.log("[Batch] El medico no tiene disponibilidades")
            return turnosGenerados
        }

        const inicio = new Date(fechaInicial)
        console.log(inicio)
        const fin = new Date(fechaFinal)
        console.log(fin)

        if (isNaN(inicio) || isNaN(fin)) {
            throw new BadRequestError('Las fechas inicial y final deben ser objetos Date válidos');
        }

        if (inicio >= fin) {
            throw new RangeError('La fecha inicial debe ser menor o igualque la final')
        }

        medico.disponibilidades.forEach(dispo => {
            const turnos = this.generarTurnosPorDisponibilidad(medico, dispo, inicio, fin, duracionTurnos)
            turnosGenerados.push(...turnos)
        });

        return turnosGenerados
    }

    /* 
        Consideracion que tuvimos
        turnos de 2 horas
        de 23 a 2am
        para el sistema tenemos una dispo de 23 a 24 y otra de 0 a 2
        30 mins, 11.45 no existe
    */


    generarTurnosPorDisponibilidad(medico, disponibilidad, inicio, fin, duracionTurnos) {
        console.log("[Batch] Generando Turnos para disponibilidad")
        //console.log(disponibilidad)

        const turnosGenerados = []
        const duracionesUnicas = [
            ...new Set([
                ...disponibilidad.practicas.map(p => p.duracionTurnoEnMins),
                ...disponibilidad.especialidades.map(e => e.duracionTurnoEnMins)
            ])
        ].sort((a, b) => a - b)
        // ordenar duraciones
        // matriz
        const matrizOpcionesTurno = this.obtenerMatrizEspecialidadPracticaDuracion(disponibilidad.especialidades, disponibilidad.practicas, duracionesUnicas)

        const diaDesde = new Date(inicio)
        diaDesde.setUTCHours(0, 0, 0, 0)
        console.log(diaDesde)

        const diaHasta = new Date(fin)
        diaHasta.setUTCHours(23, 59, 59, 999)
        console.log(diaHasta)

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

            for (
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
                    practica: opcionesTurno?.practicas ?? [],
                    especialidad: opcionesTurno?.especialidades ?? [],
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

    obtenerMatrizEspecialidadPracticaDuracion(especialidades, practicas, duracionesUnicas) {
        // duracionTurnos viene ordenada
        const matrizOpciones = new Map()
        const duracionesDistintas = duracionesUnicas.length
        for (let i = 0; i < duracionesDistintas; i++) {
            matrizOpciones.set(
                duracionesUnicas[i],
                {
                    practicas: practicas.filter((p) => p.duracionTurnoEnMins <= duracionesUnicas[i]),
                    especialidades: especialidades.filter((e) => e.duracionTurnoEnMins <= duracionesUnicas[i])
                }
            )
        }
        return matrizOpciones
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
            return -1;
        }
        return resultado;
    }

    refrescarTurnosSegun(practica, medico) {
        //TODO
    }
}
