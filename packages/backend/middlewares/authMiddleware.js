import jwt from "jsonwebtoken"
import { UnauthorizedError } from "../errors/AppErrors.js"

export const verificarToken = (req, res, next) => {
  const headerName = process.env.TOKEN_HEADER_KEY ? process.env.TOKEN_HEADER_KEY.toLowerCase() : "authorization"
  const authHeader = req.headers[headerName]

  if (!authHeader) {
    return next(new UnauthorizedError("Acceso denegado. Header faltante."));
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;


  try {
    const payloadDecodificado = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.usuario = payloadDecodificado; 
  
    next(); 
  } catch (error) {
    next(new UnauthorizedError("Token inválido o expirado." + (error.message ? ` Detalles: ${error.message}` : "")));
  }
}

// TODO para renovar la expiracion de los tokens tenemos que crear uno nuevo