import { PacienteService } from "../services/PacienteService.js";
import { paginacionSchema, paramsIdSchema, tokenSchema } from "../validations/commonValidations.js";
import { pacienteBodySchema, pacienteBodyUpdateSchema } from "../validations/pacienteValidation.js";
import { ForbiddenError } from "../errors/AppErrors.js";

export class PacienteController {
    constructor({
        pacienteService = new PacienteService()
    } = {}) {
        this.pacienteService = pacienteService;
    }

    create = async (req, res, next) => {
        try {
            const datosPaciente = pacienteBodySchema.parse(req.body);
            const pacienteCreado = await this.pacienteService.crear(datosPaciente);
            
            return res.status(201).json({ status: "success", data: pacienteCreado });
        } catch (error) {
            return next(error);
        }
    }

    findAll = async (req, res, next) => {
        try {
            const { page: numeroPagina, limit: limitePorPagina } = paginacionSchema.parse(req.query);
            const filtros = this.extraerFiltros(req.query);
            const resultado = await this.pacienteService.obtenerTodos({
                numeroPagina,
                limitePorPagina,
                filtros
            });
            
            return res.status(200).json({
                status: "success",
                data: resultado.pacientes,
                paginacion: {
                    numeroPagina: resultado.numeroPagina,
                    limitePagina: resultado.limitePorPagina,
                    totalPaginas: resultado.totalPaginas,
                    totalPacientes: resultado.totalPacientes
                }
            });
        } catch (error) {
            return next(error);
        }
    }

    findById = async (req, res, next) => {
       try {
            const { id } = paramsIdSchema.parse(req.params);
            const paciente = await this.pacienteService.obtenerPorId(id);

            return res.status(200).json({ status: "success", data: paciente });
       } catch (error) {
            return next(error);
        }
    }

    update = async (req, res, next) => {
        try {
            const { id } = paramsIdSchema.parse(req.params);
            const datosPaciente = pacienteBodyUpdateSchema.parse(req.body);
            const { userId } = tokenSchema.parse(req.usuario)
            if (userId !== id) throw new ForbiddenError("No se tienen los permisos necesarios para modificar este recurso")

            const pacienteActualizado = await this.pacienteService.actualizar(id, datosPaciente);

            return res.status(200).json({ status: "success", data: pacienteActualizado });
        } catch (error) {
            return next(error);
        }
    }

    delete = async (req, res, next) => {
        try {
            const { id } = paramsIdSchema.parse(req.params);
            const { userId } = tokenSchema.parse(req.usuario)
            if (userId !== id) throw new ForbiddenError("No se tienen los permisos necesarios para modificar este recurso")

            const pacienteEliminado = await this.pacienteService.eliminar(id)

            return res.status(200).json({ status: "success", data: pacienteEliminado });
        } catch (error) {
            return next(error);
        }
    }

    extraerFiltros(query) {
        const filtros = {};
        if (query.pacienteId !== undefined) {
            filtros._id = query.pacienteId;
        }
        if (query.plan !== undefined) {
            filtros.plan = query.plan;
        }
        return filtros;
    }
}