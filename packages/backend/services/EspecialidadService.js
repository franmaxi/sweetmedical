import { Especialidad } from "../domain/Medico/Servicios/Especialidad.js";
import { EspecialidadRepository } from "../repositories/EspecialidadRepository.js";
import { EspecialidadGenericaRepository } from "../repositories/EspecialidadGenericaRepository.js";
import { EspecialidadGenerica } from "../domain/Medico/Servicios/EspecialidadGenerica.js";
import {
    BadRequestError,
    ConflictError,
    NotFoundError,
    UnprocessableEntityError,
} from "../errors/AppErrors.js";

export class EspecialidadService{
     constructor({
        especialidadRepository = new EspecialidadRepository(),
        especialidadGenericaRepository = new EspecialidadGenericaRepository()
    } = {}) {
        this.especialidadRepository = especialidadRepository;
        this.especialidadGenericaRepository = especialidadGenericaRepository
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

    async obtenerPorIdGenerica(id){
        this.validarEnteroPositivo(id, "Id")
        const especialidadGenerica = await this.especialidadGenericaRepository.findById(id)

        if (!especialidadGenerica) {
            throw new NotFoundError("Especialidad no encontrado")
        }
        return especialidadGenerica
    }

    async obtenerPorNombre(nombre){
        this.validarStringNoNulo(nombre, "nombre de la especialidad")
        return await this.especialidadRepository.findByNombre(nombre)
    }

    async obtenerPorIdPadre(idPadre){
        this.validarEnteroPositivo(idPadre, "Id")
     
        return await this.especialidadRepository.findByIdEspecialidadGenerica(idPadre)
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
        
        const especialidad = new Especialidad({
            nombre: datosEspecialidad.nombre,    
            duracionTurnoEnMins : datosEspecialidad.duracionTurnoEnMins,
            costoConsulta : datosEspecialidad.costoConsulta
        })
        return await this.especialidadRepository.save(especialidad) 
    }

    async crearGenerica(datosEGenerica){
        this.validarStringNoNulo(datosEGenerica.nombre, "nombre de la especialidad")

        if(await this.especialidadGenericaRepository.findOneByNombre(datosEGenerica.nombre) != null){
            throw new ConflictError("Ya existe una especialidad de nombre: " + datosEGenerica.nombre)
        }

        const especialidadGenerica = new EspecialidadGenerica({nombre: datosEGenerica.nombre})

        return await this.especialidadGenericaRepository.save(especialidadGenerica)
    }

    async actualizar(id, datosEspecialidad){
        this.validarEnteroPositivo(id,"Id")
        this.validarDatosEspecialidad(datosEspecialidad) 

        const especialidad = await this.obtenerPorId(id)

        especialidad.nombre = datosEspecialidad.nombre
        especialidad.duracionTurnoEnMins = datosEspecialidad.duracionTurnoEnMins
        especialidad.costoConsulta = datosEspecialidad.costoConsulta

        return await this.especialidadRepository.update(id,especialidad)
    }

    // ---------- Especialidades Genericas
    async obtenerTodosGenerica({numeroPagina = 1, limitePorPagina = 10, filtros = {} } = {}){
        this.validarPaginacion(numeroPagina,limitePorPagina)
        //TODO Agregar filtros
        const {especialidadesGenericas,totalEspecialidadesGenericas} = await this.especialidadGenericaRepository.findPaginados(
            numeroPagina,
            limitePorPagina,
            filtros
        ) 
        const totalPaginas = totalEspecialidadesGenericas === 0 ? 0 : Math.ceil(totalEspecialidadesGenericas/limitePorPagina)
        return {
            especialidadesGenericas,
            numeroPagina,
            limitePorPagina,
            totalPaginas,
            totalEspecialidadesGenericas
        }
    }

    async actualizarGenerica(id, nombreNuevo){
        this.validarEnteroPositivo(id,"Id")
        this.validarStringNoNulo(nombreNuevo, "nombre de la especialidad generica")

        if(await this.especialidadGenericaRepository.findOneByNombre(nombreNuevo) != null){
            throw new ConflictError("Ya existe una especialidad de nombre: " + nombreNuevo)
        }

        const especialidadGenerica = await this.obtenerPorIdGenerica(id)

        especialidadGenerica.nombre = nombreNuevo

        const especialidadesHijas = await this.obtenerPorIdPadre(id)

        //Si actualizamos el nombre de una generica, las hijas deberán tener su mismo nombre
        if (especialidadesHijas.length > 0) {
            const idsHijas = especialidadesHijas.map(e => e.id);
            
            await this.especialidadRepository.updateManyNombres(idsHijas, nombreNuevo);
        }

        return await this.especialidadGenericaRepository.update(id,especialidadGenerica)
    }

    // Métodos Auxiliares
    validarDatosEspecialidad(datosEspecialidad){
        if (!datosEspecialidad || typeof datosEspecialidad !== "object" || Array.isArray(datosEspecialidad)) {
            throw new BadRequestError("Los datos del medico son invalidos")
        }
        const {nombre, duracionTurnoEnMins, costoConsulta} = datosEspecialidad

        this.validarStringNoNulo(nombre, "nombre de la especialidad")

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

    validarStringNoNulo(string, parametro){
        if (typeof string !== 'string' || string.trim() === '') {
            throw new UnprocessableEntityError(`${parametro} debe ser un string no nulo`)
        }
    }
}