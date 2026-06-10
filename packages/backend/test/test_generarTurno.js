import { Agenda } from "../domain/Turno/Agenda.js"
import { DisponibilidadHoraria } from "../domain/Medico/DisponibilidadHoraria.js"
import { Especialidad } from "../domain/Medico/Servicios/Especialidad.js"
import { Practica } from "../domain/Medico/Servicios/Practica.js"
import { Medico } from "../domain/Medico/Medico.js"
import { Sede } from "../domain/Sede.js"

const agenda = new Agenda()
const sedeMock = new Sede({ nombre: "Sede Central", direccion: "Av. Corrientes 1234" })

// TEST calculo MCD
console.log('\n[TEST] calcularMCD')

const mcd1 = agenda.calcularMCD([15, 30, 60])
console.log('MCD [15,30,60] - Esperado: 15 - Resultado: ', mcd1)
console.log(mcd1 === 15 ? 'OK' : 'ERROR')
const mcd2 = agenda.calcularMCD([20])
console.log('MCD [20] - Esperado: 20 - Resultado: ', mcd2)
console.log(mcd2 === 20 ? 'OK' : 'ERROR')

// TEST Turnos de medico sin disponibilidad
console.log('\n [TEST] generarTurnos SIN disponibilidades \n')

const medicoSinDisponibilidades = new Medico({
    usuario: "000000000000000000000000",
    matricula: "M-0000",
    nombre: "Dr. Vacio"
})
const turnosVacios = agenda.generarTurnos(
    medicoSinDisponibilidades,
    new Date('2026-05-11'),
    new Date('2026-05-18')
)
console.log('Esperado: []')
console.log('Resultado:', turnosVacios)
console.log(turnosVacios.length === 0 ? 'OK' : 'ERROR')


// TEST generarTurnosPorDisponibilidad
console.log('\n [TEST] generarTurnosPorDisponibilidad \n')

const especialidad15 = new Especialidad({
    especialidadGenerica: "000000000000000000000000",
    nombre: 'Cardiologia',
    duracionTurnoEnMins: 15,
    costo: 1000
})

const disponibilidad15 = new DisponibilidadHoraria({
    diaSemana: 1, // lunes
    horaDesde: '10:00',
    horaHasta: '11:00',
    sede: sedeMock
})

disponibilidad15.especialidades.push(especialidad15)

const medico1 = new Medico({
    usuario: "000000000000000000000000",
    matricula: "M-1234",
    nombre: "Dr. Perez"
})
medico1.disponibilidades.push(disponibilidad15)

const turnos15 = agenda.generarTurnosPorDisponibilidad(
    medico1,
    disponibilidad15,
    new Date('2026-05-10'),
    new Date('2026-05-15')
)

console.log('\n Cantidad de turnos generados - Esperado: 4')
console.log('Resultado:', turnos15.length)

turnos15.forEach((t, index) => {
    console.log(
        `Turno ${index + 1}:`,
        t.fechaHora.toLocaleTimeString()
    )
})


// TEST MCD entre especialidades y practicas

console.log('\n [TEST] MCD especialidades + practicas \n')

const especialidad30 = new Especialidad({
    especialidadGenerica: "000000000000000000000000",
    nombre: 'Clinica',
    duracionTurnoEnMins: 30,
    costo: 1000
})

const practica60 = new Practica({
    practicaGenerica: "000000000000000000000000",
    codigo: 'RX01',
    nombre: 'Radiografia',
    duracionTurnoEnMins: 60,
    costo: 5000
})

const disponibilidadMixta = new DisponibilidadHoraria({
    diaSemana: 1,
    horaDesde: '21:00',
    horaHasta: '23:00',
    sede: sedeMock
})

disponibilidadMixta.especialidades.push(especialidad30)
disponibilidadMixta.practicas.push(practica60)

const medico2 = new Medico({
    usuario: "000000000000000000000000",
    matricula: "M-5678",
    nombre: "Dr. Gomez"
})
medico2.disponibilidades.push(disponibilidadMixta)

const turnosMixtos = agenda.generarTurnosPorDisponibilidad(
    medico2,
    disponibilidadMixta,
    new Date('2026-05-11T00:00:00'),
    new Date('2026-05-11T00:00:00')
)

console.log('Esperado: 4 turnos')
console.log('Resultado:', turnosMixtos.length)

turnosMixtos.forEach((t, index) => {
    console.log(`\nTurno ${index + 1}`)
    console.log(t)
})

// TEST dia incorrecto
console.log('\n [TEST] disponibilidad otro dia \n')
const disponibilidadViernes = new DisponibilidadHoraria({
    diaSemana: 5, // viernes
    horaDesde: '20:00',
    horaHasta: '23:00',
    sede: sedeMock
})

disponibilidadViernes.especialidades.push(especialidad15)

const medico3 = new Medico({
    usuario: "000000000000000000000000",
    matricula: "M-9999",
    nombre: "Dr. Viernes"
})
medico3.disponibilidades.push(disponibilidadViernes)

const turnosViernes = agenda.generarTurnosPorDisponibilidad(
    medico3,
    disponibilidadViernes,
    new Date('2026-05-11'), // lunes
    new Date('2026-05-11')
)

console.log('Esperado: 0')
console.log('Resultado:', turnosViernes.length)
console.log(turnosViernes.length === 0 ? 'OK' : 'ERROR')
