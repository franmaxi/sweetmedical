import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL


export const getTurnos = async ({
    page = 1,
    limit = 8,
    pacienteId = "6a22243ea59d0c59c2916fd2",
    ordenarPor,
    ordenDireccion,
    medicoId,
    estado,
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
        console.error("Error obteniendo las sedes", error);
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
        console.error("Error obteniendo los medicos", error);
        throw error;
    }
};
export const getMedicoById = async ({
    medicoId
} = {}) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/medicos/${medicoId}`, {
            headers: {
                'Cache-Control': 'no-cache'
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error obteniendo el medico", error);
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
        console.error("Error al obtener especialidades genericas", error);
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
        console.error("Error al obtener practicas genericas ", error);
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
        console.error("Error reservando un turno", error);
        throw error;
    }
};

export const getServicios = async ({
    medicoId = "6a14c252688165715658e489"
} = {}) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/medicos/${medicoId}/servicios`, {
            headers: {
                'Cache-Control': 'no-cache'
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error obteniendo los servicios del médico", error);
        throw error;
    }
};

export const crearEspecialidad = async ({
    medicoId = "6a14c252688165715658e489",
    especialidadGenericaId,
    duracionTurnoEnMins,
    costo,
} = {}) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/medicos/${medicoId}/servicios`, {
            especialidad: { especialidadGenericaId, duracionTurnoEnMins, costo },
            practica: null,
        });
        return response.data;
    } catch (error) {
        console.error("Error creando especialidad", error);
        throw error;
    }
};

export const crearPractica = async ({
    medicoId = "6a14c252688165715658e489",
    practicaGenericaId,
    duracionTurnoEnMins,
    costo,
} = {}) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/medicos/${medicoId}/servicios`, {
            especialidad: null,
            practica: { practicaGenericaId, duracionTurnoEnMins, costo },
        });
        return response.data;
    } catch (error) {
        console.error("Error creando práctica", error);
        throw error;
    }
};

export const editarServicio = async ({
    medicoId = "6a14c252688165715658e489",
    especialidadId = null,
    practicaId = null,
    duracionTurnoEnMins,
    costo,
} = {}) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/medicos/${medicoId}/servicios`, {
            especialidadId,
            practicaId,
            duracionTurnoEnMins,
            costo,
        });
        return response.data;
    } catch (error) {
        console.error("Error editando servicio", error);
        throw error;
    }
};

export const eliminarServicio = async ({
    medicoId = "6a14c252688165715658e489",
    especialidadId = null,
    practicaId = null,
} = {}) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/medicos/${medicoId}/servicios`, {
            especialidadId, 
            practicaId 
            
        });
        return response.data;
    } catch (error) {
        console.error("Error eliminando servicio", error);
        throw error;
    }
};
export const crearDisponibilidad = async ({
    medicoId = "6a14c252688165715658e489",
    especialidades = null,
    practicas = null,
    sedeId,
    horaDesde,
    horaHasta,
    diaSemana
} = {}) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/medicos/${medicoId}/disponibilidades`, {
            especialidades, 
            practicas,
            sede: sedeId,
            horaDesde,
            horaHasta,
            diaSemana
            
        });
        return response.data;
    } catch (error) {
        console.error("Error al crear una disponibilidad", error);
        throw error;
    }
};

export const getDisponibilidades = async ({
    medicoId = "6a14c252688165715658e489",
} = {}) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/medicos/${medicoId}/disponibilidades`, {  
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener disponibilidades", error);
        throw error;
    }
};

export const eliminarDisponibilidad = async ({
    medicoId = "6a14c252688165715658e489",
    disponibilidadId
} = {}) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/medicos/${medicoId}/disponibilidades/${disponibilidadId}`, {
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error eliminando disponibilidad", error);
        throw error;
    }
};

export const modificarDisponibilidad = async ({
    medicoId = "6a14c252688165715658e489",
    disponibilidadId,
    especialidades,
    practicas,
    sede
} = {}) => {
    try {
        const response = await axios.patch(`${API_BASE_URL}/medicos/${medicoId}/disponibilidades/${disponibilidadId}`, {
            especialidades,
            practicas,
            sede
        });
        return response.data;
    } catch (error) {
        console.error("Error modificando disponibilidad", error);
        throw error;
    }
};
