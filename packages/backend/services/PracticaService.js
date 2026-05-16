import { Practica } from "../domain/Medico/Servicios/Practica.js";
import { PracticaRepository } from "../repositories/PracticaRepository.js";
import { PracticaGenerica } from "../domain/Medico/Servicios/PracticaGenerica.js";
import { PracticaGenericaRepository } from "../repositories/PracticaGenericaRepository.js";
import {
    BadRequestError,
    ConflictError,
    NotFoundError,
} from "../errors/AppErrors.js";
import { paginacionSchema, objectIdSchema, stringNoNuloSchema } from "../validations/commonValidations.js";
import { practicaBodySchema, practicaGenericaBodySchema } from "../validations/practicaValidation.js";

export class PracticaService {
    constructor({
        practicaRepository = new PracticaRepository(),
        practicaGenericaRepository = new PracticaGenericaRepository()
    } = {}) {
        this.practicaRepository = practicaRepository;
        this.practicaGenericaRepository = practicaGenericaRepository;
    }

    async obtenerTodos({ numeroPagina = 1, limitePorPagina = 10, filtros = {} } = {}) {
        const { page, limit } = paginacionSchema.parse({ page: numeroPagina, limit: limitePorPagina });

        const { practicas, totalPracticas } = await this.practicaRepository.findPaginados(
            page, 
            limit, 
            filtros
        );
        
        const totalPaginas = totalPracticas === 0 ? 0 : Math.ceil(totalPracticas / limit);

        return {
            practicas,
            numeroPagina: page,
            limitePorPagina: limit,
            totalPaginas
        };
    }

    async obtenerPorId(id) {
        const validId = objectIdSchema.parse(id);
        const practica = await this.practicaRepository.findById(validId);
        if (!practica) {
            throw new NotFoundError(`No se encontró un practica con el id ${id}`);
        }
     
        return practica;
    }

    async obtenerPorNombre(nombre) {
        const validNombre = stringNoNuloSchema.parse(nombre);
        return await this.practicaRepository.findByNombre(validNombre);
    }

    async obtenerPorIdPadre(idPadre) {
        const validIdPadre = objectIdSchema.parse(idPadre);
        return await this.practicaRepository.findByPracticaGenerica(validIdPadre);
    }

    async validarExistenciaPorId(id) {
        const validId = objectIdSchema.parse(id);
        const practica = await this.practicaRepository.findById(validId);

        if (!practica) {
            return false;
        }
        return true;
    }

    async crear(datosPractica) {
        const validDatos = practicaBodySchema.parse(datosPractica);
        
        const practicaGenerica = await this.practicaGenericaRepository.findByCodigo(validDatos.codigo);

        if (!practicaGenerica) {
            throw new NotFoundError(`No se encontró un practica generica con el codigo ${validDatos.codigo}. Debe existir, para poder asociarla a una concreta`);
        }

        if (practicaGenerica.nombre.toLowerCase() !== validDatos.nombre.toLowerCase()) {
            throw new NotFoundError(`El nombre no coincide con el código de práctica provisto.`);
        }

        const practica = new Practica({
            codigo: validDatos.codigo,
            practicaGenerica: practicaGenerica._id,
            nombre: validDatos.nombre,
            duracionTurnoEnMins: validDatos.duracionTurnoEnMins,
            costo: validDatos.costo,
        });
        
        return await this.practicaRepository.save(practica);
    }

    async actualizar(id, datosPractica) {
        const validId = objectIdSchema.parse(id);
        const validDatos = practicaBodySchema.parse(datosPractica);
        const practicaExistente = await this.practicaRepository.findById(validId);
        if (!practicaExistente) {
            throw new NotFoundError(`No se encontró un practica con el id ${id}`);
        }
        const practicaGenerica = await this.practicaGenericaRepository.findById(practicaExistente.practicaGenerica);

        if (!practicaGenerica) {
            throw new NotFoundError(`No se encontró un practica generica con id ${practicaExistente.practicaGenerica}.`);
        }

        if (practicaExistente?.nombre.toLowerCase() !== validDatos?.nombre.toLowerCase()) {
            throw new BadRequestError("No se puede modificar el nombre de una practica. Se deberá modificar la genérica");
        }
        if (practicaExistente?.codigo.toLowerCase() !== validDatos?.codigo.toLowerCase()) {
            throw new BadRequestError("No se puede modificar el codigo de una practica. Se deberá modificar la genérica");
        }

        practicaExistente.costo = validDatos.costo;
        practicaExistente.duracionTurnoEnMins = validDatos.duracionTurnoEnMins;

        return await this.practicaRepository.update(validId, practicaExistente);
    }

    async eliminar(id) {
        const validId = objectIdSchema.parse(id);
        const practicaExistente = await this.practicaRepository.findById(validId);
        if (!practicaExistente) {
            throw new NotFoundError(`No se encontró un practica con el id ${id}`);
        }
        const practicaEliminado = await this.practicaRepository.delete(validId);
        return practicaEliminado;
    }

    // ---------- PRACTICAS GENERICAS
    async obtenerTodosGenerica({ numeroPagina = 1, limitePorPagina = 10, filtros = {} } = {}) {
        const { page, limit } = paginacionSchema.parse({ page: numeroPagina, limit: limitePorPagina });

        const { practicasGenericas, totalPracticasGenericas } = await this.practicaGenericaRepository.findPaginados(
            page, 
            limit, 
            filtros
        );
        
        const totalPaginas = totalPracticasGenericas === 0 ? 0 : Math.ceil(totalPracticasGenericas / limit);

        return {
            practicasGenericas,
            numeroPagina: page,
            limitePorPagina: limit,
            totalPaginas
        };
    }

    async crearGenerica(datosPGenerica) {
        const validDatos = practicaGenericaBodySchema.parse(datosPGenerica);

        if (await this.practicaGenericaRepository.findOneByNombre(validDatos.nombre) != null) {
            throw new ConflictError("Ya existe una practica de nombre: " + validDatos.nombre);
        }

        if (await this.practicaGenericaRepository.findByCodigo(validDatos.codigo) != null) {
            throw new ConflictError("Ya existe una practica de codigo: " + validDatos.codigo);
        }
        
        const practicaGenerica = new PracticaGenerica({ nombre: validDatos.nombre, codigo: validDatos.codigo });
    
        return await this.practicaGenericaRepository.save(practicaGenerica);
    }

    async actualizarGenerica(id, datosNuevos) {
        const validId = objectIdSchema.parse(id);
        const validDatos = practicaGenericaBodySchema.parse(datosNuevos);

        await this.validarDatosNuevos(validId, validDatos);
        
        const practicaGenerica = await this.obtenerPorIdGenerica(validId);

        practicaGenerica.nombre = validDatos.nombre;
        practicaGenerica.codigo = validDatos.codigo;

        const practicasHijas = await this.obtenerPorIdPadre(validId);

        if (practicasHijas.length > 0) {
            const cambios = { 
                nombre: validDatos.nombre, 
                codigo: validDatos.codigo 
            };
            const idsHijas = practicasHijas.map(e => e.id);
            await this.practicaRepository.updateMany(idsHijas, cambios);
        }

        return await this.practicaGenericaRepository.update(validId, practicaGenerica);
    }

    async obtenerPorIdGenerica(id) {
        const validId = objectIdSchema.parse(id);
        const practicaGenerica = await this.practicaGenericaRepository.findById(validId);
    
        if (!practicaGenerica) {
            throw new NotFoundError("practica no encontrado");
        }
        return practicaGenerica;
    }

    // Metodos Auxiliares
    async validarDatosNuevos(id, datosNuevos) {
        const validId = objectIdSchema.parse(id);
        const validDatos = practicaGenericaBodySchema.parse(datosNuevos);

        const practicaExistentePorNombre = await this.practicaGenericaRepository.findOneByNombre(validDatos.nombre);
        const practicaExistentePorCodigo = await this.practicaGenericaRepository.findByCodigo(validDatos.codigo);
        
        if (practicaExistentePorNombre && practicaExistentePorNombre.id !== validId) {
            throw new ConflictError("Ya existe una practica de nombre: " + validDatos.nombre);
        }
        if (practicaExistentePorCodigo && practicaExistentePorCodigo.id !== validId) {
            throw new ConflictError("Ya existe una practica de codigo: " + validDatos.codigo);
        }
    }
}