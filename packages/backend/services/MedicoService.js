import { Medico } from "../domain/Medico/Medico.js";
import { Usuario } from "../domain/Usuario.js"
import { MedicoRepository } from "../repositories/MedicoRepository.js";
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import {
    BadRequestError,
    NotFoundError,
    UnprocessableEntityError,
} from "../errors/AppErrors.js";

export class MedicoService{
    constructor({
        medicoRepository = new MedicoRepository(),
        usuarioRepository = new UsuarioRepository()
    } = {}) {
        this.medicoRepository = medicoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    obtenerTodos({numeroPagina = 1, limitePorPagina = 10, filtros = {} } = {}){
        this.validarPaginacion(numeroPagina,limitePorPagina)
        //TODO Agregar filtros para medico (especialidad/practica/sede/etc.)
        const {medicos,totalMedicos} = this.medicoRepository.obtenerPaginados(
            numeroPagina,
            limitePorPagina
        ) 
        const totalPaginas = totalMedicos === 0 ? 0 : Math.ceil(totalMedicos/limitePorPagina)
        return {
            medicos,
            numeroPagina,
            limitePorPagina,
            totalPaginas,
            totalMedicos
        }
    }

    obtenerPorId(id){
        this.validarEnteroPositivo(id, "Id")
        const medico = this.medicoRepository.obtenerPorId(id)

        if (!medico) {
            throw new NotFoundError("Medico no encontrado")
        }
        return medico
    }

    crear(datosMedico){
        this.validarDatosMedico(datosMedico)
        const usuario = new Usuario({
            nombreUsuario: datosMedicos.nombreUsuario,
            password: datosMedicos.password
        })
        const medico = new Medico({
            usuario: usuario,    
            matricula : datosMedicos.matricula,
            nombre : datosMedicos.nombre
        })
        this.usuarioRepository.guardar(usuario) //TODO ver si es necesario guardar usuarioRepository por guardar en cascada
        return this.medicoRepository.guardar(medico) 
    }
    
    actualizar(id, datosMedico){
        this.validarEnteroPositivo(id,"Id")
        this.validarDatosMedico(datosMedico) 
        // TODO los datos de actualizar deben tener todos los datos posibles del medico, osea sede, especialidad, practica, disponibilidad, etc.

        const medicoExistente = this.obtenerPorId(id)
        const usuarioExistente = this.obtenerUsuarioPorId(id)

        const usuarioActualizado = new Usuario({
            nombreUsuario: datosMedicos.nombreUsuario,
            password: datosMedicos.password
        })
        usuarioActualizado.id = usuarioExistente.id
        this.usuarioRepository.guardar(usuario) //TODO ver si es necesario guardar usuarioRepository por guardar en cascada

        const medicoActualizado = new Medico({
            usuario: usuario,    
            matricula : datosMedicos.matricula,
            nombre : datosMedicos.nombre
        })

        medicoActualizado.id = medicoExistente.id
        return this.medicoRepository.guardar(medicoActualizado)
    }
    
    eliminar(id){
        this.validarEnteroPositivo(id,"Id")
        const medico = this.obtenerPorId(id)
        const usuario = this.obtenerUsuarioPorId(id)
        medico.eliminado = true
        usuario.eliminado = true
        //TODO ver la logica de que pasa con los distintos turnos que tiene el medico.
        this.usuarioRepository.guardar(usuario) //TODO ver si es necesario guardar usuarioRepository por guardar en cascada
        return this.medicoRepository.guardar(medico)
    }

    validarDatosMedico(datosMedico){
        if (!datosMedico || typeof datosMedico !== "object" || Array.isArray(datosMedico)) {
            throw new BadRequestError("Los datos del medico son invalidos")
        }
        const {nombre, matricula, nombreUsuario,password} = datosMedico

         if (typeof nombre !== "string" ) {
            throw new UnprocessableEntityError("El nombre del medico es invalido")
        }
        if (typeof matricula !== "string" ) {
            throw new UnprocessableEntityError("La matricula del medico es invalida")
        }
        if (typeof nombreUsuario !== "string" ) {
            throw new UnprocessableEntityError("El nombreUsuario del medico es invalido")
        }
        if (typeof password !== "string" ) {
            throw new UnprocessableEntityError("La contraseña del medico es invalida")
        }
    }

    validarPaginacion(numeroPagina, limitePorPagina) {
        this.validarEnteroPositivo(numeroPagina, "Numero de página")
        this.validarEnteroPositivo(limitePorPagina, "Límite por página")
    }

    validarEnteroPositivo(numero, parametro) {
        if (!Number.isInteger(numero) || numero <= 0) {
            throw new BadRequestError(`${parametro} debe ser un entero positivo`)
        }
    }
}
