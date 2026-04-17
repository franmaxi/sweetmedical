import { Usuario } from "../Usuario.js";

export class Notificacion {

    constructor( {destinatario, remitente, mensaje} ) {
        this.validarUsuario(destinatario, 'destinatario')
        this.validarUsuario(remitente, 'remitente')
        this.validarMensaje(mensaje)

        this.id = null; //todo revisar como se asigna el id para persistir
        this.destinatario = destinatario;
        this.remitente = remitente;
        this.mensaje = mensaje;
        this.fechaHoraCreacion =  Date.now();
        this.leida = false
    }

    marcarComoLeida(){
        this.leida = true
        this.fechaHoraLeida = Date.now()
    }

    // Validacion Constructor

    validarUsuario(usuario, campo){
        if (!usuario instanceof Usuario) {
            throw new TypeError(`El ${campo} debe ser un objeto usuario válido`)
        }
    }

    validarMensaje(mensaje){
        if (typeof mensaje !== 'string' || mensaje.trim() === '') {
            throw new TypeError('El mensaje debe ser un string no vacío')
        }  
    }

}