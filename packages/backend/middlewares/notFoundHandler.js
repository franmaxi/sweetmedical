import {NotFoundError} from "../errors/AppErrors.js";

export function NotFoundHandler(req, res, next) {
    next(new NotFoundError(`Ruta ${req.originalUrl} no encontrada`));
}