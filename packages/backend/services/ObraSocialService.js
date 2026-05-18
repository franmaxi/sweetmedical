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
        const { planes, totalPlanes } = await this.planRepository.findPaginados(
            numeroPagina,
            limitePorPagina,
        );
        const totalPaginas = totalPlanes === 0 ? 0 : Math.ceil(totalPlanes / limitePorPagina);
        return {
            planes,
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
        const obraSocial = await this.obtenerPorIdObraSocial(datosPlan.idObraSocial)

        // Validación de Especialidades
        if (datosPlan.coberturasEspecialidades != null && datosPlan.coberturasEspecialidades.length > 0) {
            console.log("\n Encontramos Especialidades")
            const idsEspecialidadesGenericas = await this.especialidadGenericaRepository.obtenerEspecialidadIds()
            
            const idsDbStrings = idsEspecialidadesGenericas.map(id => id.toString());
            const idsCoberturasEspecialidadesGenericas = datosPlan.coberturasEspecialidades.map(c => c.especialidadGenerica.toString())
            
            const hayElementosNoPermitidos = idsCoberturasEspecialidadesGenericas.some(
                id => !idsDbStrings.includes(id)
            )
            if (hayElementosNoPermitidos) {              
                throw new BadRequestError("Una o más especialidades no pertenecen a las prácticas genéricas permitidas");
            }
        }

        // Validación de Prácticas
        if (datosPlan.coberturasPracticas != null && datosPlan.coberturasPracticas.length > 0) {
            console.log("\n Encontramos Practicas")
            const idsPracticasGenericas = await this.practicaGenericaRepository.obtenerPracticaIds()
            
            const idsPracticasGenericasStrings = idsPracticasGenericas.map(id => id.toString());
            const idsCoberturasPracticasGenericas = datosPlan.coberturasPracticas.map(c => c.practicaGenerica.toString())
            
            const hayElementosNoPermitidos = idsCoberturasPracticasGenericas.some(
                id => !idsPracticasGenericasStrings.includes(id)
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
        const planNuevo = await this.planRepository.save(plan)

        obraSocial.planes.push(plan)

        await this.obraSocialRepository.update(obraSocial._id, obraSocial)
        
        return planNuevo
    }

    //TODO pendiente eliminar y cambiar un plan

}

//TODO validar nombre nuevo al crear plan