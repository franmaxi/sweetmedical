import { Practica } from "../domain/Medico/Practica.js";
import { PracticaRepository } from "../repositories/PracticaRepository.js";
import {
    BadRequestError,
    NotFoundError,
    UnprocessableEntityError,
} from "../errors/AppErrors.js";

export class PracticaService {
    constructor({
        practicaRepository = new PracticaRepository()
    } = {}) {
        this.practicaRepository = practicaRepository
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

    // Metodos Auxiliares

    validarDatosPractica(datos) {
        if (!datos || typeof datos !== "object") {
            throw new BadRequestError("Los datos del practica son requeridos")
        }

        const {codigo, nombre, duracionTurnoEnMins, costo} = datos

        if (typeof codigo !== "string" || codigo.trim() === "") {
            throw new UnprocessableEntityError("codigo inválido")
        }

        if (typeof nombre !== "string" || nombre.trim() === "") {
            throw new UnprocessableEntityError("nombre inválido")
        }

        if (!Number.isInteger(duracionTurnoEnMins)) {
            throw new UnprocessableEntityError("duracionTurnoEnMins inválido")
        }

        if (typeof costo !== "number" || isNaN(costo) || costo <= 0) {
            throw new UnprocessableEntityError("costo inválido")
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