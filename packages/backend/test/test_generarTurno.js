import { Agenda } from "../domain/Turno/Agenda.js"
import { DisponibilidadHoraria } from "../domain/Medico/DisponibilidadHoraria.js"
import { Especialidad } from "../domain/Medico/Especialidad.js"
import { Practica } from "../domain/Medico/Practica.js"
import { Turno } from "../domain/Turno/Turno.js"
import { EstadoTurno } from "../domain/Enumerados/EstadoTurno.js"
import { CambioEstadoTurno } from "../domain/Turno/CambioEstadoTurno.js"

const agenda = new Agenda()

// TEST calculo MCD
console.log('\n[TEST] calcularMCD')

const mcd1 = agenda.calcularMCD([15, 30, 60])
console.log('MCD [15,30,60] - Esperado: 15 - Resultado: ', mcd1)
console.log(mcd1 === 15 ? 'OK' : 'ERROR')
const mcd2 = agenda.calcularMCD([20])
console.log('MCD [20] - Esperado: 20 - Resultado: ', mcd2)
console.log(mcd2 === 20 ? 'OK' : 'ERROR')

// TEST Turnos de medico sin disponibilidad
console.log('\n[TEST] generarTurnos SIN disponibilidades')

const medicoSinDisponibilidades = {
    disponibilidades: []
}
const turnosVacios = agenda.generarTurnos(
    medicoSinDisponibilidades,
    new Date('2026-05-11'),
    new Date('2026-05-18')
)
console.log('Esperado: []')
console.log('Resultado:', turnosVacios)
console.log(turnosVacios.length === 0 ? 'OK' : 'ERROR')


// TEST generarTurnosPorDisponibilidad
console.log('\n[TEST] generarTurnosPorDisponibilidad')

const especialidad15 = new Especialidad({
    nombre: 'Cardiologia',
    duracionTurnoEnMins: 15,
    costoConsulta: 1000
})

const disponibilidad15 = new DisponibilidadHoraria({
    diaSemana: 1, // lunes
    horaDesde: '10:00',
    horaHasta: '11:00',
    sede: {}
})

disponibilidad15.especialidades.push(especialidad15)

const medico1 = {
    disponibilidades: [disponibilidad15]
}

const turnos15 = agenda.generarTurnosPorDisponibilidad(
    medico1,
    disponibilidad15,
    new Date('2026-05-10'),
    new Date('2026-05-15')
)

console.log('\nCantidad de turnos generados - Esperado: 4')
console.log('Resultado:', turnos15.length)

turnos15.forEach((t, index) => {

    console.log(
        `Turno ${index + 1}:`,
        t.fechaHora.toLocaleTimeString()
    )

})


// TEST MCD entre especialidades y practicas

console.log('\n[TEST] MCD especialidades + practicas')

const especialidad30 = new Especialidad({
    nombre: 'Clinica',
    duracionTurnoEnMins: 30,
    costoConsulta: 1000
})

const practica60 = new Practica({
    codigo: 'RX01',
    nombre: 'Radiografia',
    duracionTurnoEnMins: 60,
    costo: 5000
})

const disponibilidadMixta = new DisponibilidadHoraria({
    diaSemana: 1,
    horaDesde: '10:00',
    horaHasta: '12:00',
    sede: {}
})

disponibilidadMixta.especialidades.push(especialidad30)
disponibilidadMixta.practicas.push(practica60)

const medico2 = {
    disponibilidades: [disponibilidadMixta]
}

const turnosMixtos = agenda.generarTurnosPorDisponibilidad(
    medico2,
    disponibilidadMixta,
    new Date('2026-05-11T00:00:00'),
    new Date('2026-05-11T00:00:00')
)

console.log('Esperado: 4 turnos')
console.log('Resultado:', turnosMixtos.length)

turnosMixtos.forEach((t, index) => {
    console.log(`Turno ${index + 1}`)
    console.log(t)
})

// TEST dia incorrecto
console.log('\n[TEST] disponibilidad otro dia')
const disponibilidadViernes = new DisponibilidadHoraria({
    diaSemana: 5, // viernes
    horaDesde: '10:00',
    horaHasta: '11:00',
    sede: {}
})

disponibilidadViernes.especialidades.push(especialidad15)

const medico3 = {
    disponibilidades: [disponibilidadViernes]
}

const turnosViernes = agenda.generarTurnosPorDisponibilidad(
    medico3,
    disponibilidadViernes,
    new Date('2026-05-11'), // lunes
    new Date('2026-05-11')
)

console.log('Esperado: 0')
console.log('Resultado:', turnosViernes.length)
console.log(turnosViernes.length === 0 ? 'OK' : 'ERROR')





