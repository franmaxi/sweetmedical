import { Turno } from "./Turno.js"

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
        
        // Generamos por semana  -  2 semanas de antelacion minimo 
        // fecha inicial = Date.now + 2 semanas

        // TODO en el properties deberia estar: antelación minima, dia hora del cron y duración minima turnos.
        if(!medico?.disponibilidades || medico.disponibilidades.length === 0){
            return turnosGenerados
        }

        const inicio = new Date(fechaInicial)
        const fin = new Date(fechaFinal)

        if (isNaN(inicio) || isNaN(fin)) { 
            throw new TypeError('Las fechas inicial y final deben ser objetos Date válidos');
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

    calcularFechaDisponibilidad() {

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
        const turnosGenerados = [] 
        const duraciones = [
            ...disponibilidad.practicas.map(p => p.duracionTurnoEnMins),
            ...disponibilidad.especialidades.map(e => e.duracionTurnoEnMins)
        ]
        // duracion de HH:mm
        const duracionTurnos = this.calcularMCD(duraciones)

        const diaDesde = new Date(inicio)
        diaDesde.setHours(0,0,0,0)
        
        const diaHasta = new Date(fin)
        diaHasta.setHours(23,59,59,999)
        const cantTurnos = disponibilidad.obtenerDiferenciaEnMinutos() / duracionTurnos
        
        // recorro cada dia entre el inicio y el fin
        for (let fecha = new Date(); fecha <= diaHasta; fecha.setDate(fecha.getDate() + 1)) {

            if(fecha.getDay() !== disponibilidad.diaSemana) continue;

            const [horaDesde, minutoDesde] = disponibilidad.horaDesde.split(':').map(Number)
            const [horaHasta, minutoHasta] = disponibilidad.horaHasta.split(':').map(Number)

            const inicioSlot = new Date(fecha)
            inicioSlot.setHours(horaDesde, minutoDesde, 0, 0)

            const finSlot = new Date(fecha)
            finSlot.setHours(horaHasta, minutoHasta, 0, 0)

            for(
                let turnoInicio = new Date(inicioSlot);
                turnoInicio.getTime() + duracionTurnos * 60000 <= finSlot.getTime();
                turnoInicio = new Date(turnoInicio.getTime() + duracionTurnos * 60000)
            ) {
            
                // TODO verificar practicas y especialidades para que su duracion no se pase del tiempo restante
                const nuevoTurno = new Turno({
                    medico: medico,
                    fechaHora: new Date(turnoInicio), // dispo_hora_inicio + (index*duracionTurnos)
                    sede: disponibilidad.sede,
                    practica: [...(disponibilidad.practicas ?? [])], 
                    especialidad: [...(disponibilidad.especialidades ?? [])]
                })
                turnosGenerados.push(nuevoTurno)
            }
        return turnosGenerados;
    }}


    calcularMCD(numeros) {
        if (!numeros || numeros.length === 0) return 1;
        const mcd = (a, b) => b === 0 ? a : mcd(b, a % b);
        return numeros.reduce((acc, num) => mcd(acc, num));
    }


    refrescarTurnosSegun(practica, medico) {
        //TODO
    }
}
