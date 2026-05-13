import { PacienteService } from "../services/PacienteService.js";
import {BadRequestError} from "../errors/AppErrors.js"

export class PacienteController {

    constructor( {
        pacienteService = new PacienteService()
    } = {})    {
        this.pacienteService = pacienteService;
    }

    create = async (req,res, next) => {
        try {
            const datosPaciente = this.extraerYValidarBodyPaciente(req.body);
            const pacienteCreado = await this.pacienteService.crear(datosPaciente)
            
            return res.status(201).json({ status: "success", data: pacienteCreado })
        } catch (error) {
            return next(error)
        }
    }

    findAll = async (req,res,next) => {
        try{
            const paginacion = this.extraerPaginacion(req.query)
            const filtros = this.extraerFiltros(req.query)
            const resultado = await this.pacienteService.obtenerTodos({
                ...paginacion,
                filtros
            })
            
            return res.status(200).json({
                status : "success",
                data : resultado.pacientes,
                paginacion: {
                    numeroPagina: resultado.numeroPagina,
                    limitePagina: resultado.limitePagina,
                    totalPaginas: resultado.totalPaginas,
                    totalPacientes: resultado.totalPacientes
                }
            })
        }
        catch(error){
            return next(error)
        }
    }



    findById = async (req, res,next) => {
       try {
            const id = this.parsearId(req.params.id)
            const paciente = await this.pacienteService.obtenerPorId(id)

            return res.status(200).json({ status: "success", data: paciente })
       } catch (error) {
            return next(error)
        }
    }

    update = async (req, res, next) => {
        try {
            const id = this.parsearId(req.params.id)
            const datosPaciente = this.extraerYValidarBodyPaciente(req.body)
            const pacienteActualizado = await this.pacienteService.actualizar(id, datosPaciente)

            return res.status(200).json({ status: "success", data: pacienteActualizado })
        } catch (error) {
            return next(error)
        }
    }

    delete = async (req, res, next) => {
        try {
            const id = this.parsearId(req.params.id)
            const pacienteEliminado = await this.pacienteService.eliminar(id)

            return res.status(200).json({ status: "success", data: pacienteEliminado })
        } catch (error) {
            return next(error)
        }
    }




    parsearId(idParam) {
        const id = Number(idParam)

        this.validarEnteroPositivo(id, "id")

        return id
    }


    extraerYValidarBodyPaciente(body) {
        if (!body || typeof body !== "object" || Array.isArray(body)) {
            throw new BadRequestError("El cuerpo de la solicitud debe ser un objeto JSON válido.")
        }

        const camposPermitidos = [
            "dni",
            "nombre",
            "plan"]
        const camposBody = Object.keys(body)
        const camposNoPermitidos = camposBody.filter((campo) => !camposPermitidos.includes(campo))

        if (camposNoPermitidos.length > 0) {
            throw new BadRequestError(`Campos no permitidos en la request: ${camposNoPermitidos.join(", ")}`)
        }

        const camposFaltantes = camposPermitidos.filter((campo) => body[campo] === undefined)

        if (camposFaltantes.length > 0) {
            throw new BadRequestError(`Faltan campos obligatorios en la request: ${camposFaltantes.join(", ")}`)
        }

        return {
            dni: body.dni,
            nombre: body.nombre,
            plan: body.plan,
        }
    }

    validarEnteroPositivo(numero, parametro) {
        if (!Number.isInteger(numero) || numero <= 0) {
            throw new BadRequestError(`El parámetro ${parametro} debe ser un entero positivo`)
        }
    }

    extraerFiltros(query) {
        const filtros = {}

    
        if(query.pacienteId !== undefined) {
            filtros.pacienteId = Number(query.pacienteId);
        }
        
        if(query.plan !== undefined) {
            filtros.plan = query.plan;
        }

        return filtros;
    }
    
    extraerPaginacion(query) {
        const numeroPagina = query?.page === undefined ? 1 : Number(query.page)
        const limitePorPagina = query?.limit === undefined ? 10 : Number(query.limit)

        this.validarEnteroPositivo(numeroPagina, "page")
        this.validarEnteroPositivo(limitePorPagina, "limit")

        return { numeroPagina, limitePorPagina }
    }

}