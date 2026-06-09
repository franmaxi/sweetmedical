import { MedicoService } from "../services/MedicoService.js";
import { paginacionSchema, paramsIdSchema, objectIdSchema } from "../validations/commonValidations.js";
import { 
    medicoBodySchema, 
    medicoBodyUpdateSchema, 
    disponibilidadBodySchema, 
    serviciosBodySchema,
    modificarServicioBodySchema,
    eliminarServicioBodySchema,
    sedesBodySchema
} from "../validations/medicoValidation.js";

export class MedicoController {
    constructor({
        medicoService = new MedicoService()
    } = {}) {
        this.medicoService = medicoService;
    }

    findAll = async (req, res, next) => {
        try {
            const { page: numeroPagina, limit: limitePorPagina } = paginacionSchema.parse(req.query);
            const filtros = this.extraerFiltros(req.query);
            const resultado = await this.medicoService.obtenerTodos({
                numeroPagina,
                limitePorPagina,
                filtros
            });

            return res.status(200).json({
                status: "success",
                data: resultado.medicos,
                paginacion: {
                    numeroPagina: resultado.numeroPagina,
                    limitePagina: resultado.limitePorPagina,
                    totalPaginas: resultado.totalPaginas,
                    totalMedicos: resultado.totalMedicos
                }
            });
        } catch (error) {
            return next(error);
        }
    }

    create = async (req, res, next) => {
        try {
            const datosMedico = medicoBodySchema.parse(req.body);
            const medicoCreado = await this.medicoService.crear(datosMedico);
            return res.status(201).json({
                status: "success",
                data: medicoCreado
            });
        } catch (error) {
            return next(error);
        }
    }

    delete = async (req, res, next) => {
        try {
            const { id } = paramsIdSchema.parse(req.params);
            const medicoEliminado = await this.medicoService.eliminar(id);
            return res.status(200).json({
                status: "success",
                data: medicoEliminado
            });
        } catch (error) {
            return next(error);
        }
    }

    update = async (req, res, next) => {
        try {
            const { id } = paramsIdSchema.parse(req.params);
            const datosMedico = medicoBodyUpdateSchema.parse(req.body);
            const medicoActualizado = await this.medicoService.actualizar(id, datosMedico);
            return res.status(200).json({
                status: "success",
                data: medicoActualizado
            });
        } catch (error) {
            return next(error);
        }
    }

    findById = async (req, res, next) => {
        try {
            const { id } = paramsIdSchema.parse(req.params);
            const medico = await this.medicoService.obtenerPorId(id);
            return res.status(200).json({
                status: "success",
                data: medico
            });
        } catch (error) {
            return next(error);
        }
    }



    // POST /medicos/:id/disponibilidades
    crearDisponibilidad = async (req, res, next) => {
        try {
            const { id: medicoId } = paramsIdSchema.parse(req.params);
            const disponibilidad = disponibilidadBodySchema.parse(req.body);
            const disponibilidadCreada = await this.medicoService.crearDisponibilidad(medicoId, disponibilidad);
            return res.status(201).json({
                status: "success",
                data: disponibilidadCreada
            });
        } catch (error) {
            return next(error);
        }
    }

    // PUT /medicos/:id/disponibilidades/:disponibilidadId
    modificarDisponibilidad = async (req, res, next) => {
        try {
            const { id: medicoId } = paramsIdSchema.parse(req.params);
            const disponibilidadId = objectIdSchema.parse(req.params.disponibilidadId);
            const disponibilidad = disponibilidadBodySchema.parse(req.body);
            const disponibilidadActualizada = await this.medicoService.modificarDisponibilidad(medicoId, disponibilidadId, disponibilidad);
            return res.status(200).json({
                status: "success",
                data: disponibilidadActualizada
            });
        } catch (error) {
            return next(error);
        }
    }

    // GET /medicos/:id/disponibilidades
    listarDisponibilidades = async (req, res, next) => {
        try {
            const { id: medicoId } = paramsIdSchema.parse(req.params);
            const disponibilidades = await this.medicoService.obtenerDisponibilidades(medicoId);
            return res.status(200).json({
                status: "success",
                data: disponibilidades
            });
        } catch (error) {
            return next(error);
        }
    }

    // GET /medicos/:id/disponibilidades/:disponibilidadId
    obtenerDisponibilidad = async (req, res, next) => {
        try {
            const { id: medicoId } = paramsIdSchema.parse(req.params);
            const disponibilidadId = objectIdSchema.parse(req.params.disponibilidadId);
            const disponibilidad = await this.medicoService.obtenerDisponibilidad(medicoId, disponibilidadId);
            return res.status(200).json({
                status: "success",
                data: disponibilidad
            });
        } catch (error) {
            return next(error);
        }
    }

    // POST /medicos/:id/servicios
    agregarServicios = async (req, res, next) => {
        try {
            const { id: medicoId } = paramsIdSchema.parse(req.params);
            const { especialidades, practicas } = serviciosBodySchema.parse(req.body);
            const medicoActualizado = await this.medicoService.agregarServicios(
                medicoId,
                especialidades,
                practicas
            );
            return res.status(200).json({
                status: "success",
                data: medicoActualizado
            });
        } catch (error) {
            return next(error);
        }
    }

    // PUT /medicos/:id/servicios/:servicioId
    modificarServicio = async (req, res, next) => {
        try {
            const { id: medicoId } = paramsIdSchema.parse(req.params);
            const servicioId = objectIdSchema.parse(req.params.servicioId);
            const servicio = modificarServicioBodySchema.parse(req.body);
            const medicoActualizado = await this.medicoService.modificarServicio(medicoId, servicioId, servicio);
            return res.status(200).json({
                status: "success",
                data: medicoActualizado
            });
        } catch (error) {
            return next(error);
        }
    }

    // DELETE /medicos/:id/servicios/:servicioId
    eliminarServicio = async (req, res, next) => {
        try {
            const { id: medicoId } = paramsIdSchema.parse(req.params);
            const servicioId = objectIdSchema.parse(req.params.servicioId);
            const { tipo } = eliminarServicioBodySchema.parse(req.body);
            const medicoActualizado = await this.medicoService.eliminarServicio(medicoId, servicioId, tipo);
            return res.status(200).json({
                status: "success",
                data: medicoActualizado
            });
        } catch (error) {
            return next(error);
        }
    }

    // DELETE /medicos/:id/disponibilidades/:disponibilidadId
    eliminarDisponibilidad = async (req, res, next) => {
        try {
            const { id: medicoId } = paramsIdSchema.parse(req.params);
            const disponibilidadId = objectIdSchema.parse(req.params.disponibilidadId);
            const medicoActualizado = await this.medicoService.eliminarDisponibilidad(medicoId, disponibilidadId);
            return res.status(200).json({
                status: "success",
                data: medicoActualizado
            });
        } catch (error) {
            return next(error);
        }
    }

    // POST /medicos/:id/sedes  — body: { sedesId: ["id1", "id2"] }
    agregarSedes = async (req, res, next) => {
        try {
            const { id: medicoId } = paramsIdSchema.parse(req.params);
            const { sedesId } = sedesBodySchema.parse(req.body);
            const medicoActualizado = await this.medicoService.agregarSedes(medicoId, sedesId);
            return res.status(200).json({
                status: "success",
                data: medicoActualizado
            });
        } catch (error) {
            return next(error);
        }
    }

    // DELETE /medicos/:id/sedes  — body: { sedesId: ["id1", "id2"] }
    quitarSedes = async (req, res, next) => {
        try {
            const { id: medicoId } = paramsIdSchema.parse(req.params);
            const { sedesId } = sedesBodySchema.parse(req.body);
            const medicoActualizado = await this.medicoService.quitarSedes(medicoId, sedesId);
            return res.status(200).json({
                status: "success",
                data: medicoActualizado
            });
        } catch (error) {
            return next(error);
        }
    }

    extraerFiltros(query) {
        const filtros = {};
        if (query.especialidadId) filtros.especialidades = query.especialidadId;
        if (query.practicaId) filtros.practicas = query.practicaId;
        if (query.sedeId) filtros.sedes = query.sedeId;
        return filtros;
    }
}