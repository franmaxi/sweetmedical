import { paginacionSchema, paramsIdSchema, tokenSchema } from "../validations/commonValidations.js";
import { tipoUsuario } from "../domain/Enumerados/TipoUsuario.js";
import { ObraSocialService } from "../services/ObraSocialService.js";
import { obraSocialDomainSchema, planBodySchema } from "../validations/obraSocialValidation.js";
import { ForbiddenError } from "../errors/AppErrors.js";

export class ObraSocialController{
    constructor({
        obraSocialService = new ObraSocialService()
    }= {}){
        this.obraSocialService = obraSocialService
    }

    // ------------  Obra Social ------------ 
    findAllObraSocial = async (req, res, next) => {
            try {
                const resultado = await this.obraSocialService.obtenerTodosObraSocial();
                return res.status(200).json({
                    status: "success",
                    data: resultado
                });
            } catch (error) {
                return next(error);
            }
        }

    createObraSocial = async (req, res, next) => {
        try {
            const { userRol } = tokenSchema.parse(req.usuario)
            this.validarAdmin(userRol)

            const datos = obraSocialDomainSchema.parse(req.body);
            const obraSocial = await this.obraSocialService.crearObraSocial(datos.nombre);

            return res.status(201).json({
                status: "success",
                data: obraSocial
            });
        } catch (error) {
            return next(error)
        }
    }
    
    findByIdObraSocial = async (req, res, next) => {
        try {
            const { id } = paramsIdSchema.parse(req.params);
            const obraSocial = await this.obraSocialService.obtenerPorIdObraSocial(id);
            return res.status(200).json({
                status: "success",
                data: obraSocial
            })
        } catch (error) {
            return next(error)
        }
    }

    // ------------  Plan ------------ 
    findAllPlan = async (req, res, next) => {
        try {
            const { page: numeroPagina, limit: limitePorPagina } = paginacionSchema.parse(req.query);
            const resultado = await this.obraSocialService.obtenerTodosPlan({ numeroPagina, limitePorPagina });
            return res.status(200).json({
                status: "success",
                data: resultado.planes
            });
        } catch (error) {
            return next(error);
        }
    }

    createPlan = async (req, res, next) => {
        try {
            const { userRol } = tokenSchema.parse(req.usuario)
            this.validarAdmin(userRol)

            const datos = planBodySchema.parse(req.body);
            const resp = await this.obraSocialService.cargarNuevoPlan(datos);

            return res.status(201).json({
                status: "success",
                data: resp
            });
        } catch (error) {
            return next(error)
        }
    }

    findByIdPlan = async (req, res, next) => {
        try {
            const { id } = paramsIdSchema.parse(req.params);
            const plan = await this.obraSocialService.obtenerPlanPorId(id);
            return res.status(200).json({
                status: "success",
                data: plan
            })
        } catch (error) {
            return next(error)
        }
    }

    findPlanByObraSocial= async (req, res, next) => {
        try {
            const { id } = paramsIdSchema.parse(req.params);
            const planes = await this.obraSocialService.obtenerPlanesPorObraSocial(id);
            return res.status(200).json({
                status: "success",
                data: planes
            })
        } catch (error) {
            return next(error)
        }
    }

    validarAdmin(rolUsuario) {
    if (rolUsuario != tipoUsuario.ADMIN) 
        throw new ForbiddenError("No cuenta con los permisos necesarios para realizar dicha accion")
    }
}