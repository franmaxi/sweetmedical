export const DiaSemana = {
    DOMINGO: 0,
    LUNES: 1,
    MARTES: 2,
    MIERCOLES: 3,
    JUEVES: 4,
    VIERNES: 5,
    SABADO: 6
};

const NOMBRES_DIAS = {
    [DiaSemana.DOMINGO]: "DOMINGO",
    [DiaSemana.LUNES]: "LUNES",
    [DiaSemana.MARTES]: "MARTES",
    [DiaSemana.MIERCOLES]: "MIERCOLES",
    [DiaSemana.JUEVES]: "JUEVES",
    [DiaSemana.VIERNES]: "VIERNES",
    [DiaSemana.SABADO]: "SABADO"
};

export function nombreDia(numero) {
    return NOMBRES_DIAS[numero] || "";
}
