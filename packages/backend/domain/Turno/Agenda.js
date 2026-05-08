import { Turno } from "./Turno"

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
    generarTurnos(medico, desde, hasta) {
        // 1 -> mes siguiente -> generas todo mes 2, mes 1 no tiene turnos
        // 2 -> generar el mes 3, pero mes 2 tiene turnos
        // semana 1, genero 2,3,4,5
        // semana 2, genera 6
        // semana 3, genera 7
        // semana 4, genera 8
        const turnosGenerados = []

        // Generamos por semana  -  2 semanas de antelacion minimo 
        // TODO en el properties deberia estar: antelación minima, dia hora del cron y duración minima turnos.
        if(!medico.disponibilidad || medico.disponibilidad.length === 0){
            return turnosGenerados
        }
        medico.disponibilidad.array.forEach(dispo => {
            const turnos = generarTurnoPorDisponibilidad(dispo)
            turnosGenerados.push(...turnos)

        });
        return turnosGenerados
        const disponibilidad
        for(1) {}
        const nuevoTurno = new Turno()
        // sede - medico - estado - 
        const listaPracticasDisponibles = disponibilidad.practicas
        listaPracticasDisponibles.revisar()
        
    }


    // dispo tiene 2 especialidades de 30 y 60 minutos
    // mcd es de 30 minutos -> los turnos los genero de a 30 minutos -> 2 horas = 4 turnos totales

    generarTurnosPorDisponibilidad(disponibilidad){
        const listaDuracionesPracticas = []
        const listaDuracionesExpecialidades = []
        const duraciones = [
            ...disponibilidad.practi
        ]
        
        

        const duracionTurnos = this.calcularMCD()

        

        for (let index = 0; index < cantTurnos; index++) {
            const element = array[index];
            
        }
    }

    calcularMCD(numeros) {
        if (!numeros || numeros.length === 0) return 1;
        const mcd = (a, b) => b === 0 ? a : mcd(b, a % b);
        return numeros.reduce((acc, num) => mcd(acc, num));
    }


    generarTurnosPara(especialidad, medico) {
        //TODO
    }
    generarTurnosPara(practica, medico) {
        //TODO
    }
    refrescarTurnosSegun(practica, medico) {
        //TODO
    }
}