import { PracticaService } from "../services/PracticaService.js";
import { BadRequestError } from "../errors/AppErrors.js"

export class PracticaController {
    constructor( {
        practicaService = new PracticaService()
    } = {}) {
        this.practicaService = practicaService
    }

    findAll = async (req, res,next) => {
        try{
            const paginacion = this.extraerPaginacion(req.query)
            const resultado = await this.practicaService.obtenerTodos({...paginacion})
            return res.status(200).json({
                status : "success",
                data : resultado.practicas,
                paginacion: {
                    numeroPagina: resultado.numeroPagina,
                    limitePagina: resultado.limitePagina,
                    totalPaginas: resultado.totalPaginas,
                    totalPracticas: resultado.totalPracticas
                }
            })
        }
        catch(error){
            return next(error)
        }
    }

    create = async (req,res, next) => {
        try {
            const datosPractica = this.validarYExtraerBody(req.body, ["codigo","nombre","duracionTurnoEnMins","costo"])
            const practicaCreada = await this.practicaService.crear(datosPractica)
            return res.status(201).json({
                status: "success",
                data : practicaCreada
            })
        }
        catch(error){
            return next(error)
        }
    }

    createGenerica = async (req,res, next) => {
        try {
            const datosPGenerica = this.validarYExtraerBody(req.body, ["codigo","nombre"])
            const pGenericaCreada = await this.practicaService.crearGenerica(datosPGenerica)
            return res.status(201).json({
                status: "success",
                data : pGenericaCreada
            })
        }
        catch(error){
            return next(error)
        }
    }

    delete = async (req,res,next) => {
        try{
            const id = this.parsearId(req.params.id)
            const practicaEliminada = await this.practicaService.eliminar(id)
            return res.status(200).json({
                status : "success",
                data : practicaEliminada
            })
        }
        catch(error){
            return next(error)
        }
    }

    update = async (req,res,next) => {
        try {
            const id = this.parsearId(req.params.id)
            const datosPractica = this.validarYExtraerBody(req.body, ["id","codigo","nombre","duracionTurnoEnMins","costo"])
            const practicaActualizada = await this.practicaService.actualizar(id,datosPractica)
            return res.status(200).json({
                status: "success",
                data : practicaActualizada
            })
        } catch (error) {
            return next(error)
        }
    }

    findById = async (req,res,next) => {
        try {
            const id = this.parsearId(req.params.id)
            const practica = await this.practicaService.obtenerPorId(id)
            return res.status(200).json({
                status: "success",
                data: practica
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