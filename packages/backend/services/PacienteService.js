import { Paciente} from "../domain/Paciente/Paciente.js";
import { PacienteRepository } from "../repositories/PacienteRepository.js";
import { Usuario } from "../domain/Usuario.js";
import { PlanRepository } from "../repositories/PlanRepository.js";
import { ObraSocialRepository } from "../repositories/ObraSocialRepository.js";
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import {
    BadRequestError,
    NotFoundError,
    UnprocessableEntityError,
} from "../errors/AppErrors.js";

export class PacienteService {
    constructor({
        pacienteRepository = new PacienteRepository(),
        usuarioRepository = new UsuarioRepository(),
        planRepository = new PlanRepository(), //TODO no vamos a tener plan ni obra social repositories
        obraSocialRepository = new ObraSocialRepository(),
    } = {}) {
        this.pacienteRepository = pacienteRepository
        this.usuarioRepository = usuarioRepository
        this.planRepository = planRepository
        this.obraSocialRepository = obraSocialRepository
    }
   
    async obtenerTodos({ numeroPagina = 1, limitePorPagina = 10, filtros = {} } = {}) {
        this.validarPaginacion(numeroPagina, limitePorPagina)

        const { pacientes, totalPacientes } = await this.pacienteRepository.obtenerPaginados(
            numeroPagina, 
            limitePorPagina, 
            filtros
        )
        
        const totalPaginas = totalPacientes === 0  ? 0 : Math.ceil(totalPacientes / limitePorPagina)

        return {
            pacientes,
            numeroPagina,
            limitePorPagina,
            totalPacientes,
            totalPaginas
        }
    }

    async obtenerPorId(id) {
        this.validarEnteroPositivo(id, "Id")
        const paciente = await this.pacienteRepository.obtenerPorId(id)
        if (!paciente) {
            throw new NotFoundError(`No se encontró un paciente con el id ${id}`)
        }
     
        return paciente
    }

    async crear(datosPaciente) {

        this.validarDatosPaciente(datosPaciente)

        const usuario = new Usuario({
            nombreUsuario: datosPaciente.nombreUsuario,
            password: datosPaciente.password
        })

        const usuarioGuardado = await this.usuarioRepository.save(usuario)
        // consideramos que los planes estan precargados en el sistema, si no esta cargado no existe
        const plan = await this.planRepository.findById(datosPaciente.planId)
        if(!plan) throw new NotFoundError(`No se encontró un plan con el id ${datosPaciente.planId}`)

        const obraSocial = await this.obraSocialRepository.findById(datosPaciente.obraSocialId)
        if(!obraSocial) throw new NotFoundError(`No se encontró una obraSocial con el id ${datosPaciente.obraSocialId}`)

        const paciente= new Paciente({
            dni: datosPaciente.dni,
            nombre: datosPaciente.nombre,
            usuario: usuarioGuardado._id,
            obraSocial: obraSocial,
            plan: plan,
        })
        
        this.usuarioRepository.guardar(usuario)
        return await this.pacienteRepository.guardar(paciente)
    }

    async actualizar(id, datosPaciente) {
        this.validarEnteroPositivo(id, "Id")
        this.validarDatosPaciente(datosPaciente)
        const pacienteExistente = await this.pacienteRepository.findById(id)
        if (!pacienteExistente) {
            throw new NotFoundError(`No se encontró un paciente con el id ${id}`)
        }
        const pacienteActualizado = await this.pacienteRepository.actualizar(id,datosPaciente)
        return pacienteActualizado
    }

    async eliminar(id){
        this.validarEnteroPositivo(id, "Id")
        const pacienteExistente = await this.pacienteRepository.findById(id)
        if (!pacienteExistente) {
            throw new NotFoundError(`No se encontró un paciente con el id ${id}`)
        }
        const pacienteEliminado = await this.pacienteRepository.eliminar(id)
        return pacienteEliminado
    }

    // Metodos Auxiliares

    validarDatosPaciente(datos) {
        if (!datos || typeof datos !== "object") {
            throw new BadRequestError("Los datos del paciente son requeridos")
        }

        const {dni, nombre, obraSocialId, planId, nombreUsuario, password} = datos

        if (!Number.isInteger(dni)) {
            throw new UnprocessableEntityError("dni inválido")
        }   

        if (typeof nombre !== "string" || nombre.trim() === "") {
            throw new UnprocessableEntityError("nombre inválido")
        }

        if (!Number.isInteger(obraSocialId)) {
            throw new UnprocessableEntityError("obraSocialId inválido")
        }

        if (!Number.isInteger(planId)) {
            throw new UnprocessableEntityError("planId inválido")
        }
        if (typeof nombreUsuario !== "string" || nombre.trim() === "") {
            throw new UnprocessableEntityError("nombreUsuario inválido")
        }
        if (typeof password !== "string" || nombre.trim() === "") {
            throw new UnprocessableEntityError("password inválido")
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