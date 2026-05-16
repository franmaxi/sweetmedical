export class PracticaGenerica{
    
    constructor(nombre,codigo){
        this.validarNombre(nombre, "nombre")
        this.validarNombre(codigo, "codigo")


        this.id = null
        this.nombre = nombre;
        this.codigo = codigo
    }
    
    validarString(nombre, parametro){
        if (typeof nombre !== 'string' || nombre.trim() === '') {
            throw new TypeError(`El ${parametro} de la especialidad debe ser un string no vacío`)
        }
    }
}