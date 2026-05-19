import { NotFoundError } from "../errors/AppErrors.js";

export function notFoundHandler(req, res, next) {
    next(new NotFoundError(`Ruta ${req.originalUrl} no encontrada`));
}

export const NotFoundHandler = notFoundHandler;