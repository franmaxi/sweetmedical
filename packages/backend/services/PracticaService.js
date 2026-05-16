import { Practica } from "../domain/Medico/Servicios/Practica.js";
import { PracticaRepository } from "../repositories/PracticaRepository.js";
import { PracticaGenerica } from "../domain/Medico/Servicios/PracticaGenerica.js";
import { PracticaGenericaRepository } from "../repositories/PracticaGenericaRepository.js";
import {
    BadRequestError,
    ConflictError,
    NotFoundError,
    UnprocessableEntityError,
} from "../errors/AppErrors.js";

export class PracticaService {
    constructor({
        practicaRepository = new PracticaRepository(),
        practicaGenericaRepository = new PracticaGenericaRepository()
    } = {}) {
        this.practicaRepository = practicaRepository
        this.practicaGenericaRepository = practicaGenericaRepository
    }

    async obtenerTodos({ numeroPagina = 1, limitePorPagina = 10, filtros = {} } = {}) {
        this.validarPaginacion(numeroPagina, limitePorPagina)

        const { practicas, totalPracticas } = await this.practicaRepository.findPaginados(
            numeroPagina, 
            limitePorPagina, 
            filtros
        )
        
        const totalPaginas = totalPracticas === 0  ? 0 : Math.ceil(totalPracticas / limitePorPagina)

        return {
            practicas,
            numeroPagina,
            limitePorPagina,
            totalPaginas
        }
    }

    async obtenerPorId(id) {
        this.validarEnteroPositivo(id, "Id")
        const practica = await this.practicaRepository.findById(id)
        if (!practica) {
            throw new NotFoundError(`No se encontró un practica con el id ${id}`)
        }
     
        return practica
    }

    async obtenerPorNombre(nombre){
        this.validarStringNoNulo(nombre, "nombre de la practica")
        return await this.practicaRepository.findByNombre(nombre)
    }

    async obtenerPorIdPadre(idPadre){
        this.validarEnteroPositivo(idPadre, "Id")
     
        return await this.practicaRepository.findByPracticaGenerica(idPadre)
    }

    async validarExistenciaPorId(id){
        this.validarEnteroPositivo(id, "Id")

        const practica = await this.practicaRepository.findById(id)

        if (!practica) {
            false
        }
        return true
    }

    async crear(datosPractica) {
        this.validarDatosPractica(datosPractica)
        
        const practica = new Practica({
            codigo: datosPractica.codigo,
            nombre: datosPractica.nombre,
            duracionTurnoEnMins: datosPractica.duracionTurnoEnMins,
            costo: datosPractica.costo,
        })
        
        return await this.practicaRepository.save(practica)
    }

    async actualizar(id, datosPractica) {
        this.validarEnteroPositivo(id, "Id")
        this.validarDatosPractica(datosPractica)
        const practicaExistente = await this.practicaRepository.findById(id)
        if (!practicaExistente) {
            throw new NotFoundError(`No se encontró un practica con el id ${id}`)
        }
        const practicaActualizada = await this.practicaRepository.update(id,datosPractica)
        return practicaActualizada
    }


    async eliminar(id){
        this.validarEnteroPositivo(id, "Id")
        const practicaExistente = await this.practicaRepository.findById(id)
        if (!practicaExistente) {
            throw new NotFoundError(`No se encontró un practica con el id ${id}`)
        }
        const practicaEliminado = await this.practicaRepository.delete(id)
        return practicaEliminado
    }

    // ---------- PRACTICAS GENERICAS
    async obtenerTodosGenerica({ numeroPagina = 1, limitePorPagina = 10, filtros = {} } = {}) {
        this.validarPaginacion(numeroPagina, limitePorPagina)

        const { practicasGenericas, totalPracticasGenericas } = await this.practicaGenericaRepository.findPaginados(
            numeroPagina, 
            limitePorPagina, 
            filtros
        )
        
        const totalPaginas = totalPracticasGenericas === 0  ? 0 : Math.ceil(totalPracticasGenericas / limitePorPagina)

        return {
            practicasGenericas,
            numeroPagina,
            limitePorPagina,
            totalPaginas
        }
    }

    async crearGenerica(datosPGenerica){
        this.validarStringNoNulo(datosPGenerica.codigo, "codigo")

        this.validarStringNoNulo(datosPGenerica.nombre, "nombre")

        if(await this.practicaGenericaRepository.findOneByNombre(datosPGenerica.nombre) != null){
            throw new ConflictError("Ya existe una practica de nombre: " + datosPGenerica.nombre)
        }

        if(await this.practicaGenericaRepository.findByCodigo(datosPGenerica.codigo) != null){
            throw new ConflictError("Ya existe una practica de codigo: " + datosPGenerica.codigo)
        }
        
        const practicaGenerica = new PracticaGenerica({nombre: datosPGenerica.nombre, codigo: datosPGenerica.codigo})
    
        return await this.practicaGenericaRepository.save(practicaGenerica)
    }

    async actualizarGenerica(id, datosNuevos){
        //Valida el nuevo codigo y nombre, y que no existan practicas con los mismos valores
        this.validarDatosNuevos(id, datosNuevos)
        
        const practicaGenerica = await this.obtenerPorIdGenerica(id)

        practicaGenerica.nombre = datosNuevos.nombre
        practicaGenerica.codigo = datosNuevos.codigo

        const practicasHijas = await this.obtenerPorIdPadre(id)

        //Si actualizamos datos de una generica, las hijas deberán tener su mismos datos
        if (practicasHijas.length > 0) {

            const cambios = { 
                nombre: datosNuevos.nombre, 
                codigo: datosNuevos.codigo 
            };

            const idsHijas = practicasHijas.map(e => e.id);
            
            await this.practicaRepository.updateMany(idsHijas, cambios);
        }

        return await this.practicaGenericaRepository.update(id,practicaGenerica)
    }

    async obtenerPorIdGenerica(id){
        this.validarEnteroPositivo(id, "Id")
        const practicaGenerica = await this.practicaGenericaRepository.findById(id)
    
        if (!practicaGenerica) {
            throw new NotFoundError("practica no encontrado")
        }
        return practicaGenerica
    }

    // Metodos Auxiliares
    validarDatosPractica(datos) {
        if (!datos || typeof datos !== "object") {
            throw new BadRequestError("Los datos del practica son requeridos")
        }

        const {codigo, nombre, duracionTurnoEnMins, costo} = datos

        this.validarStringNoNulo(codigo, "codigo")
        this.validarStringNoNulo(nombre, "nombre")


        if (!Number.isInteger(duracionTurnoEnMins)) {
            throw new UnprocessableEntityError("duracionTurnoEnMins inválido")
        }

        if (typeof costo !== "number" || isNaN(costo) || costo <= 0) {
            throw new UnprocessableEntityError("costo inválido")
        }
    }

    async validarDatosNuevos(id, datosNuevos){
        this.validarEnteroPositivo(id,"Id")
        this.validarStringNoNulo(datosNuevos.nombre, "nombre de la practica generica")
        this.validarStringNoNulo(datosNuevos.codigo, "codigo de la practica generica")

        const practicaExistentePorNombre = await this.practicaGenericaRepository.findOneByNombre(datosNuevos.nombre)
        const practicaExistentePorCodigo = await this.practicaGenericaRepository.findByCodigo(datosNuevos.codigo);
        if(practicaExistentePorCodigo && practicaExistentePorNombre.id !== id){
            throw new ConflictError("Ya existe una practica de nombre: " + datosNuevos.nombre)
        }
        if(practicaExistentePorCodigo && practicaExistentePorCodigo.id !== id){
            throw new ConflictError("Ya existe una practica de codigo: " + datosNuevos.codigo)
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