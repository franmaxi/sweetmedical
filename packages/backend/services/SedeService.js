import {
    BadRequestError,
    NotFoundError
} from "../errors/AppErrors.js"

import { SedeRepository } from "../repositories/SedeRepository.js";
import { Sede } from "../domain/Sede.js";

export class SedeService{
    constructor( sedeRepository = new SedeRepository()){
        this.sedeRepository = sedeRepository
    }

    async crear(datosSede) {

        if (await this.existeDireccionSede(datosSede.direccion)) {
            throw new BadRequestError("Ya existe una sede con la direccion"+ datosSede.direccion );
        }

        if (await this.existeNombreSede(datosSede.nombre)) {
            throw new BadRequestError("Ya existe una sede con ese nombre" + datosSede.nombre);
        }

        const sede = new Sede({
            nombre: datosSede.nombre,
            direccion: datosSede.direccion
        });

        return await this.sedeRepository.save(sede)
    }
    
    async obtenerTodos({ numeroPagina = 1, limitePorPagina = 10,} = {}) {
        const { sedes, totalSedes } = await this.sedeRepository.findPaginados(
            numeroPagina,
            limitePorPagina,
        );
        const totalPaginas = totalSedes === 0 ? 0 : Math.ceil(totalSedes / limitePorPagina);
        return {
            sedes,
            numeroPagina,
            limitePorPagina,
            totalPaginas,
            totalSedes
        };
    }
    
    async obtenerPorId(id) {
        const sede = await this.sedeRepository.findById(id)
        if (!sede) {
            throw new NotFoundError(`No se encontró una sede con el id ${id}`)
        }
        return sede
    }

    async actualizar(id, datosSede) {
        const sede = await this.obtenerPorId(id);

        const sedePorNombre = await this.sedeRepository.findByNombre(datosSede.nombre);
        if (sedePorNombre && sedePorNombre._id.toString() !== String(id)) {
            throw new BadRequestError("Ya existe una sede con ese nombre " + datosSede.nombre);
        }

        const sedePorDireccion = await this.sedeRepository.findByDireccion(datosSede.direccion);
        if (sedePorDireccion && sedePorDireccion._id.toString() !== String(id)) {
            throw new BadRequestError("Ya existe una sede con la direccion " + datosSede.direccion);
        }

        sede.nombre = datosSede.nombre;
        sede.direccion = datosSede.direccion;

        return await this.sedeRepository.update(id, sede);
    }

    async eliminar(id) {
        await this.obtenerPorId(id);
        return await this.sedeRepository.delete(id);
    }
    async existeDireccionSede(direccionSede) {
        const sede = await this.sedeRepository.findByDireccion(direccionSede);
        return !!sede;
    }

    async existeNombreSede(nombreSede) {
        const sede = await this.sedeRepository.findByNombre(nombreSede);
        return !!sede;
    }
}