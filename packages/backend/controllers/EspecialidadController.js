import {BadRequestError} from "../errors/AppErrors.js"
import { EspecialidadService } from "../services/EspecialidadService.js"

export class ServicioController{
    constructor({
        especialidadService = new EspecialidadService()
    } = {}){
        this.especialidadService = especialidadService
    } 

    findAll = async (req, res,next) => {
        try {
            const paginacion = this.extraerPaginacion(req.query)
            const resultado = await this.especialidadService.obtenerTodos({...paginacion})
            return res.status(200).json({
                status : "success",
                data : resultado.especialidades,
                paginacion: {
                    numeroPagina: resultado.numeroPagina,
                    limitePagina: resultado.limitePagina,
                    totalPaginas: resultado.totalPaginas,
                    totalEspecialidades: resultado.totalEspecialidades
                }
            })
        } catch (error) {
            return next(error)
        }
    }

    create = async (req, res,next) => {
        try {
            const datosEspecialidad = this.validarYExtraerBody(req.body,["nombre","duracionTurnoEnMins","costoConsulta"])
            const especialidadCreada = await this.especialidadService.crear(datosEspecialidad)
            return res.status(201).json({
                status: "success",
                data : especialidadCreada
            })
        } catch (error) {
            return next(error)
        }
    }

    createGenerica = async (req, res,next) => {
        try {
            const datosEGenerica = this.validarYExtraerBody(req.body, ["nombre"])
            const eGenericaCreada = await this.especialidadService.crearGenerica(datosEGenerica)
            return res.status(201).json({
                status: "success",
                data : eGenericaCreada
            })
        } catch (error) {
            return next(error)
        }
    }

    delete = async (req, res,next) => {
        try {
            const id = this.parsearId(req.params.id)
            const especialidadEliminada = await this.especialidadService.eliminar(id)
            return res.status(200).json({
                status : "success",
                data : especialidadEliminada
            })
        } catch (error) {
            return next(error)
        }
    }

    update = async (req, res,next) => {
        try {
            const id = this.parsearId(req.params.id)
            const datosEspecialidad = this.validarYExtraerBody(req.body,["nombre","duracionTurnoEnMins","costoConsulta"])
            const especialidadActualizada = await this.especialidadService.actualizar(id,datosEspecialidad)
            return res.status(200).json({
                status: "success",
                data : especialidadActualizada
            })
        } catch (error) {
            return next(error)
        }
    }

    findById = async (req, res,next) => {
        try {
            const id = this.parsearId(req.params.id)
            const especialidad = await this.especialidadService.obtenerPorId(id)
            return res.status(200).json({
                status: "success",
                data: especialidad
            })
        } catch (error) {
            return next(error)
        }
    }


    // Métodos auxiliares
    extraerPaginacion(query) {
        const numeroPagina = query?.page === undefined ? 1 : Number(query.page)
        const limitePorPagina = query?.limit === undefined ? 10 : Number(query.limit)

        this.validarEnteroPositivo(numeroPagina, "page")
        this.validarEnteroPositivo(limitePorPagina, "limit")

        return { numeroPagina, limitePorPagina }
    }

    validarEnteroPositivo(numero, parametro) {
        if (!Number.isInteger(numero) || numero <= 0) {
            throw new BadRequestError(`El parámetro ${parametro} debe ser un entero positivo`)
        }
    }
 
    
    parsearId(idParam) {
        const id = Number(idParam)

        this.validarEnteroPositivo(id, "id")

        return id
    }

    validarYExtraerBody(body, camposRequeridos = []) {
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            throw new BadRequestError("El cuerpo de la solicitud debe ser un objeto JSON válido.");
        }

        const camposBody = Object.keys(body);

        const camposNoPermitidos = camposBody.filter(campo => !camposRequeridos.includes(campo));
        if (camposNoPermitidos.length > 0) {
            throw new BadRequestError(`Campos no permitidos en la solicitud: ${camposNoPermitidos.join(", ")}`);
        }

        const camposFaltantes = camposRequeridos.filter(campo => body[campo] === undefined || body[campo] === null);
        if (camposFaltantes.length > 0) {
            throw new BadRequestError(`Faltan campos obligatorios en la solicitud: ${camposFaltantes.join(", ")}`);
        }

        const bodyLimpio = {};
        camposRequeridos.forEach(campo => {
            bodyLimpio[campo] = body[campo];
        });

        return bodyLimpio;
    }
}

    