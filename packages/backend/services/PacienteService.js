import { Paciente} from "../domain/Paciente/Paciente.js";

import { PacienteRepository } from "../repositories/PacienteRepository.js";
import { PlanRepository } from "../repositories/PlanRepository.js";
import { ObraSocialRepository } from "../repositories/ObraSocialRepository.js";

import { UsuarioService } from "./UsuarioService.js";

import { NotFoundError} from "../errors/AppErrors.js";

export class PacienteService {
    constructor({
        pacienteRepository = new PacienteRepository(),
        usuarioService = new UsuarioService(),
        planRepository = new PlanRepository(),
        obraSocialRepository = new ObraSocialRepository(),
    } = {}) {
        this.pacienteRepository = pacienteRepository
        this.usuarioService = usuarioService
        this.planRepository = planRepository
        this.obraSocialRepository = obraSocialRepository
    }
   
    async obtenerTodos({ numeroPagina = 1, limitePorPagina = 10, filtros = {} } = {}) {

        const { pacientes, totalPacientes } = await this.pacienteRepository.findPaginados(
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
        const paciente = await this.pacienteRepository.findById(id)
        if (!paciente) {
            throw new NotFoundError(`No se encontró un paciente con el id ${id}`)
        }
     
        return paciente
    }

    async crear(datosPaciente) {
        // consideramos que los planes estan precargados en el sistema, si no esta cargado no existe
        const plan = await this.planRepository.findById(datosPaciente.planId)
        if(!plan) throw new NotFoundError(`No se encontró un plan con el id ${datosPaciente.planId}`)
            
        const obraSocial = await this.obraSocialRepository.findById(datosPaciente.obraSocialId)
        if(!obraSocial) throw new NotFoundError(`No se encontró una obraSocial con el id ${datosPaciente.obraSocialId}`)

        const usuarioGuardado = await this.usuarioService.crear({
            nombreUsuario: datosPaciente.nombreUsuario,
            password: datosPaciente.password
        })

        const paciente= new Paciente({
            dni: datosPaciente.dni,
            nombre: datosPaciente.nombre,
            usuario: usuarioGuardado,
            obraSocial: obraSocial,
            plan: plan,
        })
        
        return await this.pacienteRepository.save(paciente)
    }

    async actualizar(id, datosPaciente) {
        const pacienteExistente = await this.pacienteRepository.findById(id)
        if (!pacienteExistente) {
            throw new NotFoundError(`No se encontró un paciente con el id ${id}`)
        }
        const pacienteActualizado = await this.pacienteRepository.update(id,datosPaciente)
        return pacienteActualizado
    }

    async eliminar(id){
        const pacienteExistente = await this.pacienteRepository.findById(id)
        if (!pacienteExistente) {
            throw new NotFoundError(`No se encontró un paciente con el id ${id}`)
        }
        const pacienteEliminado = await this.pacienteRepository.delete(id)
        return pacienteEliminado
    }

}