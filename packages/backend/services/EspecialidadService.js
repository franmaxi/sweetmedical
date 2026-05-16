import { Especialidad } from "../domain/Medico/Servicios/Especialidad.js";
import { EspecialidadRepository } from "../repositories/EspecialidadRepository.js";
import { EspecialidadGenericaRepository } from "../repositories/EspecialidadGenericaRepository.js";
import { EspecialidadGenerica } from "../domain/Medico/Servicios/EspecialidadGenerica.js";
import {
    BadRequestError,
    ConflictError,
    NotFoundError,
} from "../errors/AppErrors.js";
import { paginacionSchema, objectIdSchema, stringNoNuloSchema } from "../validations/commonValidations.js";
import { especialidadBodySchema, especialidadGenericaBodySchema } from "../validations/especialidadValidation.js";

export class EspecialidadService {
    constructor({
        especialidadRepository = new EspecialidadRepository(),
        especialidadGenericaRepository = new EspecialidadGenericaRepository()
    } = {}) {
        this.especialidadRepository = especialidadRepository;
        this.especialidadGenericaRepository = especialidadGenericaRepository;
    }

    async obtenerTodos({ numeroPagina = 1, limitePorPagina = 10, filtros = {} } = {}) {
        const { page, limit } = paginacionSchema.parse({ page: numeroPagina, limit: limitePorPagina });
        //TODO Agregar filtros
        const { especialidades, totalEspecialidades } = await this.especialidadRepository.findPaginados(
            page,
            limit,
            filtros
        ); 
        const totalPaginas = totalEspecialidades === 0 ? 0 : Math.ceil(totalEspecialidades / limit);
        return {
            especialidades,
            numeroPagina: page,
            limitePorPagina: limit,
            totalPaginas,
            totalEspecialidades
        };
    }

    async obtenerPorId(id) {
        const validId = objectIdSchema.parse(id);
        const especialidad = await this.especialidadRepository.findById(validId);

        if (!especialidad) {
            throw new NotFoundError("Especialidad no encontrado");
        }
        return especialidad;
    }

    async obtenerPorIdGenerica(id) {
        const validId = objectIdSchema.parse(id);
        const especialidadGenerica = await this.especialidadGenericaRepository.findById(validId);

        if (!especialidadGenerica) {
            throw new NotFoundError("Especialidad no encontrado");
        }
        return especialidadGenerica;
    }

    async obtenerPorNombre(nombre) {
        const validNombre = stringNoNuloSchema.parse(nombre);
        return await this.especialidadRepository.findByNombre(validNombre);
    }

    async obtenerPorIdPadre(idPadre) {
        const validIdPadre = objectIdSchema.parse(idPadre);
        return await this.especialidadRepository.findByIdEspecialidadGenerica(validIdPadre);
    }

    async validarExistenciaPorId(id) {
        const validId = objectIdSchema.parse(id);
        const especialidad = await this.especialidadRepository.findById(validId);

        if (!especialidad) {
            return false;
        }
        return true;
    }

    async crear(datosEspecialidad) {
        const validDatos = especialidadBodySchema.parse(datosEspecialidad);
        const especialidadGenerica = await this.especialidadGenericaRepository.findOneByNombre(validDatos.nombre);
        if (especialidadGenerica == null) {
            throw new BadRequestError("No existe una especialidad generica de nombre: " + validDatos.nombre + ". No se podrá asociar una concreta");
        }

        const especialidad = new Especialidad({
            especialidadGenerica: especialidadGenerica._id,   
            nombre: validDatos.nombre, 
            duracionTurnoEnMins: validDatos.duracionTurnoEnMins,
            costo: validDatos.costo
        });
        return await this.especialidadRepository.save(especialidad); 
    }

    async actualizar(id, datosEspecialidad) {
        const validId = objectIdSchema.parse(id);
        const validDatos = especialidadBodySchema.parse(datosEspecialidad);

        const especialidad = await this.obtenerPorId(validId);

        if (especialidad?.nombre.toLowerCase() !== validDatos?.nombre.toLowerCase()) {
            throw new BadRequestError("No se puede modificar el nombre de una especialidad. Se deberá modificar la genérica");
        }
        
        especialidad.duracionTurnoEnMins = validDatos.duracionTurnoEnMins;
        especialidad.costo = validDatos.costo;

        return await this.especialidadRepository.update(validId, especialidad);
    }

    // ---------- Especialidades Genericas ----------
    async crearGenerica(datosEGenerica) {
        const validDatos = especialidadGenericaBodySchema.parse(datosEGenerica);

        if (await this.especialidadGenericaRepository.findOneByNombre(validDatos.nombre) != null) {
            throw new ConflictError("Ya existe una especialidad de nombre: " + validDatos.nombre);
        }

        const especialidadGenerica = new EspecialidadGenerica({ nombre: validDatos.nombre });

        return await this.especialidadGenericaRepository.save(especialidadGenerica);
    }

    async obtenerTodosGenerica({ numeroPagina = 1, limitePorPagina = 10, filtros = {} } = {}) {
        const { page, limit } = paginacionSchema.parse({ page: numeroPagina, limit: limitePorPagina });
        //TODO Agregar filtros
        const { especialidadesGenericas, totalEspecialidadesGenericas } = await this.especialidadGenericaRepository.findPaginados(
            page,
            limit,
            filtros
        ); 
        const totalPaginas = totalEspecialidadesGenericas === 0 ? 0 : Math.ceil(totalEspecialidadesGenericas / limit);
        return {
            especialidadesGenericas,
            numeroPagina: page,
            limitePorPagina: limit,
            totalPaginas,
            totalEspecialidadesGenericas
        };
    }

    async actualizarGenerica(id, datosNuevo) {
        const validId = objectIdSchema.parse(id);
        const nombreNuevo = typeof datosNuevo === "object" && datosNuevo !== null && "nombre" in datosNuevo
            ? stringNoNuloSchema.parse(datosNuevo.nombre)
            : stringNoNuloSchema.parse(datosNuevo);

        if (await this.especialidadGenericaRepository.findOneByNombre(nombreNuevo) != null) {
            throw new ConflictError("Ya existe una especialidad de nombre: " + nombreNuevo);
        }

        const especialidadGenerica = await this.obtenerPorIdGenerica(validId);

        especialidadGenerica.nombre = nombreNuevo;

        const especialidadesHijas = await this.obtenerPorIdPadre(validId);

        //Si actualizamos el nombre de una generica, las hijas deberán tener su mismo nombre
        if (especialidadesHijas.length > 0) {
            const idsHijas = especialidadesHijas.map(e => e.id);
            await this.especialidadRepository.updateManyNombres(idsHijas, nombreNuevo);
        }

        return await this.especialidadGenericaRepository.update(validId, especialidadGenerica);
    }
}