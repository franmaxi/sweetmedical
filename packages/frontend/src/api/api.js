import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL


export const getTurnos = async ({
    page = 1,
    limit = 8,
    pacienteId = "6a22243ea59d0c59c2916fd2",
    ordenarPor,
    ordenDireccion,
    medicoId,
    estado = "DISPONIBLE",
    especialidadId,
    practicaId,
    sedeId,
    desde,
    hasta
} = {}) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/turnos/`, {
            headers: {
                'Cache-Control': 'no-cache'
            },
            params: {
                page,
                limit,
                pacienteId,
                ordenarPor,
                ordenDireccion,
                medicoId,
                estado,
                especialidadId,
                practicaId,
                sedeId,
                desde,
                hasta
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error obteniendo los turnos", error);
        throw error;
    }
};

export const getSedes = async ({
    page = 1,
    limit = 100,
} = {}) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/sedes/`, {
            headers: {
                'Cache-Control': 'no-cache'
            },
            params: {
                page,
                limit,
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error obteniendo los turnos", error);
        throw error;
    }
};
export const getMedicos = async ({

} = {}) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/medicos/short`, {
            headers: {
                'Cache-Control': 'no-cache'
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error obteniendo los turnos", error);
        throw error;
    }
};
export const getEspecialidadesGenericas = async ({
    page = 1,
    limit = 100,
} = {}) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/especialidades/genericas`, {
            headers: {
                'Cache-Control': 'no-cache'
            },
            params: {
                page,
                limit,
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error obteniendo los turnos", error);
        throw error;
    }
};
export const getPracticasGenericas = async ({
    page = 1,
    limit = 100,
} = {}) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/practicas/genericas`, {
            headers: {
                'Cache-Control': 'no-cache'
            },
            params: {
                page,
                limit,
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error obteniendo los turnos", error);
        throw error;
    }
};

export const reservarTurno = async ({
    turnoId,
    estado = "RESERVADO",
    pacienteId = "6a22243ea59d0c59c2916fd2",
    especialidadId,
    practicaId
} = {}) => {
    try {
        const payload = { estado, pacienteId };
        if (especialidadId) payload.especialidadId = especialidadId;
        if (practicaId) payload.practicaId = practicaId;

        const response = await axios.patch(`${API_BASE_URL}/turnos/${turnoId}`, payload, {
            headers: {
                'Cache-Control': 'no-cache'
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error reservando el turno", error);
        throw error;
    }
};