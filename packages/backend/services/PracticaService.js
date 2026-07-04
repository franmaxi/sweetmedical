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
import { practicaBodySchema, practicaGenericaBodySchema, practicaUpdateBodySchema } from "../validations/practicaValidation.js";

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
            totalPaginas,
            totalPracticas
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

    async crear(datosPractica, idGenerica, session = null) {
         if (datosPractica.duracionTurnoEnMins % 15 !== 0) {
            throw new BadRequestError("La duración de la practica debe ser múltiplo de 15 minutos");
        }
        const validDatos = practicaBodySchema.parse(datosPractica);

        const practica = new Practica({
            codigo: validDatos.codigo,
            practicaGenerica: idGenerica,
            nombre: validDatos.nombre,
            duracionTurnoEnMins: validDatos.duracionTurnoEnMins,
            costo: validDatos.costo,
        });
        
        return await this.practicaRepository.save(practica, session);
    }

    async actualizar(id, datosPractica, session = null) {
        const validId = objectIdSchema.parse(id);
        const validDatos = practicaUpdateBodySchema.parse(datosPractica);
        const practicaExistente = await this.practicaRepository.findById(validId);
        if (!practicaExistente) {
            throw new NotFoundError(`No se encontró una practica con el id ${id}`);
        }

        if (validDatos.duracionTurnoEnMins !== undefined) practicaExistente.duracionTurnoEnMins = validDatos.duracionTurnoEnMins;
        if (validDatos.costo !== undefined) practicaExistente.costo = validDatos.costo;

        return await this.practicaRepository.update(validId, practicaExistente, session);
    }


    async eliminar(id, session = null) {
        const idValidado = objectIdSchema.parse(String(id));
    
        const cantidadExistente = await this.practicaRepository.countDocuments({
            _id: idValidado,
            eliminado: false
        });
    
        if (cantidadExistente === 0) {
            throw new NotFoundError("La practica no fue encontrada o ya fue eliminada.");
        }
            
        return await this.practicaRepository.delete(idValidado, session);
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
            totalPaginas,
            totalPracticasGenericas
        };
    }

    async obtenerPorCodigoGenerica(nombre) {
        const validNombre = stringNoNuloSchema.parse(nombre);
        return await this.practicaGenericaRepository.findByCodigo(validNombre);
    }


    async crearGenerica(validDatos) {

        if (await this.practicaGenericaRepository.findOneByNombre(validDatos.nombre) != null) {
            throw new ConflictError("Ya existe una practica de nombre: " + validDatos.nombre);
        }

        if (await this.practicaGenericaRepository.findByCodigo(validDatos.codigo) != null) {
            throw new ConflictError("Ya existe una practica de codigo: " + validDatos.codigo);
        }
        
        const practicaGenerica = new PracticaGenerica({ nombre: validDatos.nombre, codigo: validDatos.codigo , emoji: validDatos.emoji});
    
        return await this.practicaGenericaRepository.save(practicaGenerica);
    }

    async actualizarGenerica(id, datosNuevos) {
        await this.validarDatosNuevos(id, datosNuevos);

        const practicaGenerica = await this.obtenerPorIdGenerica(id);

        const seDebeModificarHijas = (datosNuevos.nombre !== practicaGenerica.nombre) || (datosNuevos.codigo !== practicaGenerica.codigo)

        practicaGenerica.nombre = datosNuevos.nombre;
        practicaGenerica.codigo = datosNuevos.codigo;
        practicaGenerica.emoji = datosNuevos.emoji;

        if(seDebeModificarHijas){
            const practicasHijas = await this.obtenerPorIdPadre(id);

            if (practicasHijas.length > 0) {
                const cambios = { 
                    nombre: datosNuevos.nombre, 
                    codigo: datosNuevos.codigo 
                };
                const idsHijas = practicasHijas.map(e => e._id);
                await this.practicaRepository.updateMany(idsHijas, cambios);
            }
        }

        return await this.practicaGenericaRepository.update(id, practicaGenerica);
    }

    async obtenerPorIdGenerica(id) {
        const validId = objectIdSchema.parse(id);
        const practicaGenerica = await this.practicaGenericaRepository.findById(validId);
        if (!practicaGenerica) {
            throw new NotFoundError("practica no encontrado");
        }
        return practicaGenerica;
    }

    async eliminarGenerica(id) {
        const validId = objectIdSchema.parse(id);

        // Valida existencia (lanza NotFoundError si no existe)
        await this.obtenerPorIdGenerica(validId);

        // Baja lógica en cascada de las prácticas hijas
        const practicasHijas = await this.obtenerPorIdPadre(validId);
        if (practicasHijas.length > 0) {
            const idsHijas = practicasHijas.map(p => p._id);
            await this.practicaRepository.deleteMany(idsHijas);
        }

        return await this.practicaGenericaRepository.delete(validId);
    }

    // Metodos Auxiliares
    async validarDatosNuevos(id, datosNuevos) {
        const validId = objectIdSchema.parse(id);
        const validDatos = practicaGenericaBodySchema.parse(datosNuevos);

        const practicaExistentePorNombre = await this.practicaGenericaRepository.findOneByNombre(validDatos.nombre);
        const practicaExistentePorCodigo = await this.practicaGenericaRepository.findByCodigo(validDatos.codigo);
        
        if (practicaExistentePorNombre && practicaExistentePorNombre._id.toString() !== validId) {
            throw new ConflictError("Ya existe una practica de nombre: " + validDatos.nombre);
        }
        if (practicaExistentePorCodigo && practicaExistentePorCodigo._id.toString() !== validId) {
            throw new ConflictError("Ya existe una practica de codigo: " + validDatos.codigo);
        }
    }
}