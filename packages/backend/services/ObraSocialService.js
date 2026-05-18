import {
    BadRequestError,
    NotFoundError
} from "../errors/AppErrors.js"

import { ObraSocialRepository } from "../repositories/ObraSocialRepository.js";
import { PlanRepository } from "../repositories/PlanRepository.js";
import { EspecialidadGenericaRepository } from "../repositories/EspecialidadGenericaRepository.js";
import { PracticaGenericaRepository } from "../repositories/PracticaGenericaRepository.js";

import { ObraSocial } from "../domain/Paciente/ObraSocial.js";
import { Plan } from "../domain/Plan/Plan.js";

export class ObraSocialService {
    constructor({ 
        obraSocialRepository = new ObraSocialRepository(),
        planRepository = new PlanRepository(),
        especialidadGenericaRepository = new EspecialidadGenericaRepository(),
        practicaGenericaRepository = new PracticaGenericaRepository() 
    } = {}) {
        this.obraSocialRepository = obraSocialRepository
        this.planRepository = planRepository
        this.especialidadGenericaRepository = especialidadGenericaRepository
        this.practicaGenericaRepository = practicaGenericaRepository
    }

    //   Obras Sociales ----------  

    async obtenerTodosObraSocial(){
        const obrasSociales = await this.obraSocialRepository.findAll()
        return obrasSociales
    }

    async obtenerPorIdObraSocial(id) {
        const obraSocial = await this.obraSocialRepository.findById(id)
        if (!obraSocial) {
            throw new NotFoundError(`No se encontró una obra social con el id ${id}`)
        }
        return obraSocial
    }

    async crearObraSocial(nombre){
        const obraSocialExistente = await this.obraSocialRepository.findByNombre(nombre)
        if (obraSocialExistente) {
            throw new BadRequestError(`Ya existe una obra social con el nombre ${nombre}`)
        }
        const nuevaObraSocial = new ObraSocial({nombre: nombre})
        await this.obraSocialRepository.save(nuevaObraSocial)
    }

    async obtenerPlanesPorObraSocial(idObraSocial){
        const obraSocial = await this.obtenerPorId(idObraSocial)
        
        if (obraSocial.planes == null || obraSocial.planes.length == 0) {
            return []
        }

        return obraSocial.planes
    }

    //TODO verificar si necesitamos el delete
    //Lo mismo para el patch

    // ---------- Planes ----------
   
    async obtenerTodosPlan({ numeroPagina = 1, limitePorPagina = 10 } = {}) {
        const { medicos, totalPlanes } = await this.planRepository.obtenerPaginados(
            numeroPagina,
            limitePorPagina,
        );
        const totalPaginas = totalPlanes === 0 ? 0 : Math.ceil(totalPlanes / limitePorPagina);
        return {
            medicos,
            numeroPagina,
            limitePorPagina,
            totalPaginas,
            totalPlanes
        };
    }

    async obtenerPlanPorId(id){
        const plan = await this.planRepository.findById(id)
        if (!plan) {
            throw new NotFoundError(`No se encontró un plan con el id ${id}`)
        }
        return plan
    }

    //async cargarNuevoPlan(idObraSocial, nombre, coberturasEspecialidades = null, coberturasPracticas = null){
    async cargarNuevoPlan(datosPlan){
        const obraSocial = await this.obtenerPorId(datosPlan.idObraSocial)

        if (datosPlan.coberturasEspecialidades != null) {
            const idsEspecialidadesGenericas = this.especialidadGenericaRepository.obtenerEspecialidadIds()
            const idsCoberturasEspecialidadesGenericas = datosPlan.coberturasEspecialidades.map(c => c.especialidadGenerica)
            
            const hayElementosNoPermitidos =idsCoberturasEspecialidadesGenericas.some(
                id => !idsEspecialidadesGenericas.includes(id)
            )
            if (hayElementosNoPermitidos) {              
                throw new BadRequestError("Una o más especialidades no pertenecen a las prácticas genéricas permitidas");
            }
        }

        if (datosPlan.coberturasPracticas != null) {
            const idsPracticasGenericas = this.practicaGenericaRepository.obtenerPracticaIds()
            const idsCoberturasPracticasGenericas = datosPlan.coberturasPracticas.map(c => c.practicaGenerica)
            
            const hayElementosNoPermitidos =idsCoberturasPracticasGenericas.some(
                id => !idsPracticasGenericas.includes(id)
            )
            if (hayElementosNoPermitidos) {              
                throw new BadRequestError("Una o más prácticas no pertenecen a las prácticas genéricas permitidas");
            }
        }

        const plan = new Plan({
            nombre: datosPlan.nombre,
            coberturaEspecialidad: datosPlan.coberturasEspecialidades,
            coberturaPractica: datosPlan.coberturasPracticas
        })
        await this.planRepository.save(plan)

        obraSocial.planes.push(plan)
        await this.obraSocialRepository.update(obraSocial._id, obraSocial)
    }

    //TODO pendiente eliminar y cambiar un plan

}