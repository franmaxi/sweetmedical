class Medico {
    constructor(usuario, matricula, nombre, especialidades, practicas, sedes){
        this.id = null; //todo
        this.usuario = usuario
        this.matricula = matricula
        this.nombre = nombre
        this.especialidades = especialidades
        this.practicas = practicas
        this.sedes = sedes
        this.disponibilidades = []
    }

    definirDisponibilidad(...disponibilidad){
        this.disponibilidades.push(...disponibilidad)
    }

    eliminarDisponibilidad(disponibilidad){
        //TODO
    }

}