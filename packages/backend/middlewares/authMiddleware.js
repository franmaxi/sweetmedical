import jwt from "jsonwebtoken"
import { UnauthorizedError } from "../errors/AppErrors.js"
import { isBlacklisted } from "./tokenBlacklist.js"

// Duración de inactividad permitida. Cada request exitoso renueva el token.
const TOKEN_EXPIRATION = process.env.JWT_EXPIRATION ?? "10m"

export const verificarToken = (req, res, next) => {
    const headerName = process.env.TOKEN_HEADER_KEY
        ? process.env.TOKEN_HEADER_KEY.toLowerCase()
        : "authorization"
    const authHeader = req.headers[headerName]

    if (!authHeader) {
        return next(new UnauthorizedError("Acceso denegado. Header faltante."))
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader

    // Verificar que el token no fue invalidado por un logout previo
    if (isBlacklisted(token)) {
        return next(new UnauthorizedError("Token inválido: la sesión fue cerrada."))
    }

    try {
        const payloadDecodificado = jwt.verify(token, process.env.JWT_SECRET_KEY)
        req.usuario = payloadDecodificado

        // Guardar el token original para que AuthController.logout pueda blacklistearlo
        req.tokenActual = token

        // Renovación automática (sliding window):
        // Se emite un token nuevo con fecha de expiración fresca.
        // Se excluyen los campos reservados de JWT (iat, exp, etc.)
        // para que jwt.sign los calcule de nuevo.
        const { iat, exp, nbf, jti, ...cleanPayload } = payloadDecodificado
        const tokenRenovado = jwt.sign(cleanPayload, process.env.JWT_SECRET_KEY, {
            expiresIn: TOKEN_EXPIRATION
        })

        // El frontend debe leer este header y reemplazar el token almacenado
        res.setHeader("X-Renewed-Token", tokenRenovado)

        next()
    } catch (error) {
        next(new UnauthorizedError(
            "Token inválido o expirado." + (error.message ? ` Detalles: ${error.message}` : "")
        ))
    }
}

// TODO para renovar la expiracion de los tokens tenemos que crear uno nuevo