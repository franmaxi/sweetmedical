import { Paciente} from "../domain/Paciente.js";
import { PacienteRepository } from "../repositories/PacienteRepository.js";
import { Usuario } from "../domain/Usuario.js";
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import {
    BadRequestError,
    NotFoundError,
    UnprocessableEntityError,
} from "../errors/AppErrors.js";

// todo


export class Paciente {
    constructor({
        pacienteRepository = new pacienteRepository(),
        usuarioRepository = new usuarioRepository(),
        planRepository = new planRepository(),
        obraSocialRepository = new obraSocialRepository(),
    } = {}) {
        this.pacienteRepository = pacienteRepository
        this.usuarioRepository = medicoRepository
        this.planRepository = planRepository
        this.obraSocialRepository = obraSocialRepository
    }
    //TODO Deberiamos preguntar si es necesario, poder consultar los ppacientes
    // obtenerTodos({ numeroPagina = 1, limitePorPagina = 10, filtro = {} } = {}) {
    //     this.validarPaginacion(numeroPagina, limitePorPagina)

    //     const { pacientes, totalPacientes } = this.pacienteRepository.obtenerPaginados(
    //         numeroPagina, 
    //         limitePorPagina, 
    //         filtros
    //     )
        
    //     const totalPaginas = totalPacientes === 0  ? 0 : Math.ceil(totalPacientes / limitePorPagina)

    //     return {
    //         pacientes,
    //         numeroPagina,
    //         limitePorPagina,
    //         totalPacientes,
    //         totalPaginas
    //     }

    
    // }

    // obtenerPorId(id) {
    //     this.validarEnteroPositivo(id, "Id")

    //     const paciente = this.pacienteRepository.obtenerPorId(id)

    //     if (!paciente) {
    //         throw new NotFoundError(`No se encontró un paciente con el id ${id}`)
    //     }
        
    //     return paciente
    // }

    crear(datosPaciente) {

        this.validarDatosPaciente(datosPaciente)

        const usuario = new Usuario({
            nombreUsuario: datosMedicos.nombreUsuario,
            password: datosMedicos.password
        })

        /
smpc 
        const plan = this.planRepository.obtenerPorId(datosPaciente.planId)
        if(!plan) throw new NotFoundError(`No se encontró un plan con el id ${datosPaciente.planId}`)

        const obraSocial = this.obraSocialRepository.obtenerPorId(datosPaciente.obraSocialId)
        if(!obraSocial) throw new NotFoundError(`No se encontró una obraSocial con el id ${datosPaciente.obraSocialId}`)

        const paciente= new Paciente({
            dni: datosPaciente.dni,
            nombre: datosPaciente.nombre,
            obraSocial: obraSocial,
            plan: plan,
        })
        
        this.usuarioRepository.guardar(usuario)
        return this.pacienteRepository.guardar(paciente)
    }   


    
    validarDatosPaciente(datos) {
        if (!datos || typeof datos !== "object") {
            throw new BadRequestError("Los datos del paciente son requeridos")
        }

        const {dni, nombre, obraSocialId, planId} = datos

        if (!Number.isInteger(dni)) {
            throw new UnprocessableEntityError("medicoId inválido")
        }   

        if (typeof nombre !== "string" || nombre.trim() === "") {
            throw new UnprocessableEntityError("nombre inválido")
        }

        if (!Number.isInteger(obraSocialId)) {
            throw new UnprocessableEntityError("sedeId inválido")
        }

        if (!Number.isInteger(planId)) {
            throw new UnprocessableEntityError("Plan inválido")
        }
    }

    validarPaginacion(numeroPagina, limitePorPagina) {
        this.validarEnteroPositivo(numeroPagina, "Numero de página")
        this.validarEnteroPositivo(limitePorPagina, "Límite por página")
    }

    validarEnteroPositivo(numero, parametro) {
        if (!Number.isInteger(numero) || numero <= 0) {
            throw new BadRequestError(`${parametro} debe ser un entero positivo`)
        }
    }



    
}