import { AppError } from "../errors/AppErrors";

export function errorHandler(err, req, res, next){
    if(res,headersSent){
        return next(err)
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
        timestamp: new Date().toISOString,
    })
}