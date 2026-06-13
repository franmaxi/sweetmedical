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
    page = 1,
    limit = 100,
} = {}) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/medicos/`, {
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
export const getEspecialidades = async ({
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
export const getPracticas = async ({
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