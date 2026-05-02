import {notFoundError} from "../errors/AppErrors.js";

export default function notFoundHandler(req, res, next) {
    next(new notFoundError(`Ruta ${req.originalUrl} no encontrada`));
}