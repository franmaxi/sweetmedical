import {usuarioSchema} from "../validations/usuarioValidation.js"
import { UsuarioService } from "../services/UsuarioService.js"

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
            next(error); // Se lo pasamos a tu errorLogger y errorHandler automáticos
        }
    };
    //TODO ver log out
    //ver que no se llame al authMiddleware para esto, sino nunca vamos a poder hacer log in
    //Validar que userId = MedicoId o PacienteId
    //Revisar que las rutas esten bien securizadas y se obtengan correctamente los ids
    //revisar cual es la mejor manera para que un usuario obtenga sus datos, por ejemplo mi perfil, el front debería utilizar el token?
}

