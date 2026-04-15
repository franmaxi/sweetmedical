export class Usuario {
    constructor( {nombreUsuario, password} ) {
        this.validarString(nombreUsuario, 'nombreUsuario')
        this.validarString(password, 'password')
        this.id = null //todo
        this.nombreUsuario = nombreUsuario
        this.password = password
        
    }        
    validarString(string, nombreCampo){
         if (typeof string !== 'string' || string.trim() === '') {
             throw new TypeError(`El ${nombreCampo} debe ser un string no vacío`)
         }
        }
}