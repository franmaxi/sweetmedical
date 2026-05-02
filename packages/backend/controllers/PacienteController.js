import { PacienteService } from "../services/PacienteService.js";

export class PacienteController {

    constructor( {
        pacienteService = new PacienteService()
    } = {})    {
        this.pacienteService = pacienteService;
    }

    create = async (req,res) => {
        try {
            const datosPaciente = this.extraerYValidarBodyPaciente(req.body);
            const pacienteCreado = await this.pacienteService.create(datosPaciente)
            
            return res.status(201).json({ status: "success", data: pacienteCreado })
        } catch (error) {
            return this.manejarError(res, error);
        }
    }

    findAll = async (req, res,next) => {
        try{
            const paginacion = this.extraerPaginacion(req.query)
            const filtros = this.extraerFiltros(req.query)
            const resultado = this.pacienteService.obtenerTodos({
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



    findById = async (req, res) => {
       try {
            const id = this.parsearId(req.params.id)
            const paciente = this.paciente.obtenerPorId(id)

            return res.status(200).json({ status: "success", data: paciente })
       } catch (error) {
            return this.manejarError(res, error)
        }
    }

    update = async (req, res) => {
        try {
            const id = this.parsearId(req.params.id)
            const datosPaciente = this.extraerYValidarBodyPaciente(req.body)
            const pacienteActualizado = this.pacienteService.actualizar(id, datosPaciente)

            return res.status(200).json({ status: "success", data: pacienteActualizado })
        } catch (error) {
            return this.manejarError(res, error)
        }
    }

    delete = async (req, res) => {
        try {
            const id = this.parsearId(req.params.id)
            const pacienteEliminado = this.pacienteService.eliminar(id)

            return res.status(200).json({ status: "success", data: pacienteEliminado })
        } catch (error) {
            return this.manejarError(res, error)
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
            "DNI",
            "Nombre",
            "Plan"]
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
            filtros.pacienteId = Number(query.pacineteId);
        }
        
        if(query.plan !== undefined) {
            filtros.plan = query.plan;
        }

        return filtros;
    }
    


}