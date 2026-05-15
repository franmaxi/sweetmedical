import { Especialidad } from "../domain/Medico/Especialidad";
import { EspecialidadRepository } from "../repositories/EspecialidadRepository.js";
import {
    BadRequestError,
    NotFoundError,
    UnprocessableEntityError,
} from "../errors/AppErrors.js";

export class EspecialidadService{
     constructor({
        especialidadRepository = new EspecialidadRepository(),
    } = {}) {
        this.especialidadRepository = especialidadRepository;
    }

    async obtenerTodos({numeroPagina = 1, limitePorPagina = 10, filtros = {} } = {}){
        this.validarPaginacion(numeroPagina,limitePorPagina)
        //TODO Agregar filtros
        const {especialidades,totalEspecialidades} = await this.especialidadRepository.findPaginados(
            numeroPagina,
            limitePorPagina,
            filtros
        ) 
        const totalPaginas = totalEspecialidades === 0 ? 0 : Math.ceil(totalEspecialidades/limitePorPagina)
        return {
            especialidades,
            numeroPagina,
            limitePorPagina,
            totalPaginas,
            totalEspecialidades
        }
    }

    async obtenerPorId(id){
        this.validarEnteroPositivo(id, "Id")
        const especialidad = await this.especialidadRepository.findById(id)

        if (!especialidad) {
            throw new NotFoundError("Especialidad no encontrado")
        }
        return especialidad
    }

    async validarExistenciaPorId(id){
        this.validarEnteroPositivo(id, "Id")

        const especialidad = await this.especialidadRepository.findById(id)

        if (!especialidad) {
            false
        }
        return true
    }

    async crear(datosEspecialidad){
        this.validarDatosEspecialidad(datosEspecialidad)
        
        const especialidad = new Medico({
            nombre: datosEspecialidad.nombre,    
            duracionTurnoEnMins : datosEspecialidad.duracionTurnoEnMins,
            costoConsulta : datosEspecialidad.costoConsulta
        })
        return await this.especialidadRepository.save(especialidad) 
    }

    async actualizar(id, datosEspecialidad){
        this.validarEnteroPositivo(id,"Id")
        this.validarDatosEspecialidad(datosEspecialidad) 

        const especialidad = await this.obtenerPorId(id)

        especialidad.nombre = datosEspecialidad.nombre
        especialidad.duracionTurnoEnMins = datosEspecialidad.duracionTurnoEnMins
        especialidad.costoConsulta = datosEspecialidad.costoConsulta

        return await this.especialidadRepository.save(especialidad)
    }



    // Métodos Auxiliares
    validarDatosEspecialidad(datosEspecialidad){
        if (!datosEspecialidad || typeof datosEspecialidad !== "object" || Array.isArray(datosEspecialidad)) {
            throw new BadRequestError("Los datos del medico son invalidos")
        }
        const {nombre, duracionTurnoEnMins, costoConsulta} = datosEspecialidad

         if (typeof nombre !== "string" ) {
            throw new UnprocessableEntityError("El nombre de la especialidad es invalida")
        }
        if (typeof duracionTurnoEnMins !== "number" ) {
            throw new UnprocessableEntityError("La duracionTurnoEnMins de la especialidad es invalida")
        }
        if (typeof costoConsulta !== "number" ) {
            throw new UnprocessableEntityError("El costoConsulta de la especialidad es invalida")
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