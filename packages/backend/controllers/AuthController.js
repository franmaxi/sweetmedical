import { usuarioSchema } from "../validations/usuarioValidation.js"
import { UsuarioService } from "../services/UsuarioService.js"
import { addToBlacklist } from "../middlewares/tokenBlacklist.js"

export class AuthController {
    constructor({
            usuarioService = new UsuarioService()
        } = {}) {
            this.usuarioService = usuarioService
        } 

    login = async (req, res, next) => {
        try {
            const { nombreUsuario, password } = usuarioSchema.parse(req.body);
            
            const token = await this.usuarioService.login(nombreUsuario, password);

            res.status(200).json({ token });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /auth/logout
     * Requiere: verificarToken aplicado en el router (así req.tokenActual está disponible).
     * Agrega el token actual a la blacklist para invalidarlo inmediatamente.
     * El token renovado emitido en X-Renewed-Token también queda inutilizable
     * porque el frontend debe descartar ambos al hacer logout.
     */
    logout = async (req, res, next) => {
        try {
            // req.tokenActual es seteado por el middleware verificarToken
            addToBlacklist(req.tokenActual)

            return res.status(200).json({
                status: "success",
                message: "Sesión cerrada exitosamente."
            })
        } catch (error) {
            next(error)
        }
    }
}


