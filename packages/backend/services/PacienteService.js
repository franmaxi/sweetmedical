import { Paciente} from "../domain/Paciente/Paciente.js";
import {TipoUsuario} from "../domain/Enumerados/TipoUsuario.js";
import { PacienteRepository } from "../repositories/PacienteRepository.js";
import { ObraSocialRepository } from "../repositories/ObraSocialRepository.js";

import { UsuarioService } from "./UsuarioService.js";

import { NotFoundError} from "../errors/AppErrors.js";

export class PacienteService {
    constructor({
        pacienteRepository = new PacienteRepository(),
        usuarioService = new UsuarioService(),
        obraSocialRepository = new ObraSocialRepository(),
    } = {}) {
        this.pacienteRepository = pacienteRepository
        this.usuarioService = usuarioService
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
        // Buscamos la obra social para validar que existe
        const obraSocial = await this.obraSocialRepository.findById(datosPaciente.obraSocialId)
        if(!obraSocial) throw new NotFoundError(`No se encontró una obraSocial con el id ${datosPaciente.obraSocialId}`)

        // El plan es un subdocumento embebido dentro de la obra social
        const plan = await this.obraSocialRepository.findPlanById(datosPaciente.planId)
        if(!plan) throw new NotFoundError(`No se encontró un plan con el id ${datosPaciente.planId}`)

        const usuarioGuardado = await this.usuarioService.crear({
            nombreUsuario: datosPaciente.nombreUsuario,
            password: datosPaciente.password,
            TipoUsuario: TipoUsuario.PACIENTE
        })
        const paciente = new Paciente({
            dni: datosPaciente.dni,
            nombre: datosPaciente.nombre,
            usuario: usuarioGuardado._id,
            obraSocial: obraSocial._id,
            plan: plan._id,
        })
        paciente._id = usuarioGuardado._id   // pacienteId === userId
        
        return await this.pacienteRepository.save(paciente)
    }

    async actualizar(id, datosPaciente) {
        const pacienteExistente = await this.pacienteRepository.findByUserId(id)
        if (!pacienteExistente) {
            throw new NotFoundError(`No se encontró un paciente con el id de usuario ${id}`)
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

