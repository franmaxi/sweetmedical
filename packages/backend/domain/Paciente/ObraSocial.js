export class ObraSocial{
    constructor( {nombre} ){
        this.id = null; //todo
        this.nombre = nombre;
        this.planes = [];
    }
    agregarPlanes(...planes){
        this.planes.push(...planes);
    }
   
}