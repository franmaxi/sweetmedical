import { sedeBodySchema } from "../validations/sedeValidation.js";
import { SedeService } from "../services/SedeService.js";
import { paginacionSchema, paramsIdSchema, tokenSchema } from "../validations/commonValidations.js";
import { tipoUsuario } from "../domain/Enumerados/TipoUsuario.js";
import { ForbiddenError } from "../errors/AppErrors.js";

export class SedeController{
    constructor({
        sedeService = new SedeService()
    } = {}){
        this.sedeService = sedeService
    }
    
    findAll = async (req, res, next) => {
        try {
            const { page: numeroPagina, limit: limitePorPagina } = paginacionSchema.parse(req.query);
            const resultado = await this.sedeService.obtenerTodos({ numeroPagina, limitePorPagina });
            return res.status(200).json({
                status: "success",
                data: resultado.sedes,
                paginacion: {
                    numeroPagina: resultado.numeroPagina,
                    limitePagina: resultado.limitePorPagina,
                    totalPaginas: resultado.totalPaginas,
                    totalSedes: resultado.totalSedes
                }
            });
        } catch (error) {
            return next(error);
        }
    }

    create = async (req, res, next) => {
        try {

            const {userId, userRol, userName} = tokenSchema.parse(req.usuario)
            this.validarAdmin(userRol)
            
            const datos = sedeBodySchema.parse(req.body);
            const sede = await this.sedeService.crear(datos);
            
            

            return res.status(201).json({
                status: "success",
                data: sede
            });
        } catch (error) {
            return next(error)
        }
    }
    
    findById = async (req, res, next) => {
        try {
            const { id } = paramsIdSchema.parse(req.params);
            const sede = await this.sedeService.obtenerPorId(id);
            return res.status(200).json({
                status: "success",
                data: sede
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