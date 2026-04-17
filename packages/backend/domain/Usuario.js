export class Usuario {
    constructor( {nombreUsuario, password} ) {
        this.validarString(nombreUsuario, 'nombreUsuario')
        this.validarString(password, 'password')
        
        this.idioma = 'es' //idioma por defecto, la idea es que al registrarlo copie el idioma del navegador, pero que tenga la posibilidad de cambiarlo posteriormente
        this.id = null //todo
        this.nombreUsuario = nombreUsuario
        this.password = password
        
    }
    
    // Validacion Constructor

    validarString(string, nombreCampo){
        if (typeof string !== 'string' || string.trim() === '') {
            throw new TypeError(`El ${nombreCampo} debe ser un string no vacío`)
        }
    }
}