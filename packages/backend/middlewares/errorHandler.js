import { AppError } from "../errors/AppErrors.js";
import { ZodError } from "zod";

export function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err)
    }

    if (err instanceof ZodError) {
        const listaIssues = err.issues || err.errors || [];

        const errores = listaIssues.map(e => {
            const campo = e.path.length > 0 ? `${e.path.join('.')}: ` : "";
            return `${campo}${e.message}`;
        }).join("; ");

        return res.status(400).json({
            status: "fail",
            message: `Error de validación: ${errores}`,
            timestamp: new Date().toISOString(),
        })
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            timestamp: err.timestamp,
        })
    }

    return res.status(500).json({
        status: "error",
        message: "Error Interno",
        timestamp: new Date().toISOString(),
    })
}