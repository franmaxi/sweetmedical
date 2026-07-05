export const EstadoTurno = {
    DISPONIBLE: "DISPONIBLE",
    RESERVADO: "RESERVADO",
    CONFIRMADO: "CONFIRMADO",
    CANCELADO: "CANCELADO",
    REALIZADO: "REALIZADO",
    COMBINADO: "COMBINADO"
};

export function nombreEstado(estado) {
    return estado || "";
}
