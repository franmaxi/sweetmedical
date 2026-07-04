import axios from 'axios';
import storage from './storage';

const API_BASE_URL = process.env.REACT_APP_API_URL
const STORAGE_KEY = 'sweetmedical_auth';
const TOKEN_KEY = 'sweetmedical_token';

// ---------------------------------------------------------------------------
// Instancia centralizada de Axios
// ---------------------------------------------------------------------------
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Cache-Control': 'no-cache' },
});

// --- Interceptor de REQUEST ---
// Adjunta el JWT solo si existe. Si no hay token (ej. login/registro),
// el request sale limpio y el backend lo trata como público.
apiClient.interceptors.request.use((config) => {
    const token = storage.get(TOKEN_KEY);
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// --- Interceptor de RESPONSE ---
// Si el backend emite un token renovado (sliding window), lo guarda
// automáticamente reemplazando el anterior. El usuario no se entera.
apiClient.interceptors.response.use(
    (response) => {
        const renewedToken = response.headers['x-renewed-token'];
        if (renewedToken) {
            storage.set(TOKEN_KEY, renewedToken);
        }
        return response;
    },
    (error) => {
        // 401 → sesión expirada o token inválido: limpiar y redirigir al login
        if (error.response?.status === 401) {
            storage.remove(TOKEN_KEY);
            storage.remove(STORAGE_KEY);
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ---------------------------------------------------------------------------
// Endpoints de autenticación
// ---------------------------------------------------------------------------

/**
 * Llama a POST /auth con las credenciales.
 * Devuelve el token JWT recibido del backend y lo persiste en storage.
 */
export const loginApi = async ({ nombreUsuario, password }) => {
    const response = await apiClient.post('/auth', { nombreUsuario, password });
    // Verificar que pasa si hay error (por falta de credenciales)
    const { token } = response.data;
    storage.set(TOKEN_KEY, token);
    return token;
};

/**
 * Llama a POST /auth/logout (requiere token válido).
 * El backend lo agrega a la blacklist; el frontend limpia el storage.
 */
export const logoutApi = async () => {
    try {
        await apiClient.post('/auth/logout');
    } finally {
        // Limpiar siempre, incluso si el request falla
        storage.remove(TOKEN_KEY);
        storage.remove(STORAGE_KEY);
    }
};

// ---------------------------------------------------------------------------
// Endpoints de registro (públicos, no requieren token)
// ---------------------------------------------------------------------------

export const registrarPacienteApi = async ({ nombre, dni, nombreUsuario, password, obraSocialId, planId }) => {
    const response = await apiClient.post('/pacientes', { nombre, dni: Number(dni), nombreUsuario, password, obraSocialId, planId });
    return response.data;
};

export const registrarMedicoApi = async ({ nombre, matricula, nombreUsuario, password }) => {
    const response = await apiClient.post('/medicos', { nombre, matricula, nombreUsuario, password });
    return response.data;
};

export const getObrasSocialesApi = async () => {
    const response = await apiClient.get('/obras-sociales');
    return response.data;
};

export const getPlanesPorObraSocialApi = async (obraSocialId) => {
    const response = await apiClient.get(`/obras-sociales/${obraSocialId}/plan`);
    return response.data;
};


export const getTurnos = async ({
    page = 1,
    limit = 8,
    ordenarPor,
    ordenDireccion,
    medicoId,
    estado,
    especialidadId,
    practicaId,
    sedeId,
    desde,
    hasta,
    filtrarPaciente // nuevo flag para indicar si queremos filtrar por el paciente logueado (historial)
} = {}) => {
    try {
        const response = await apiClient.get('/turnos/', {
            params: {
                page,
                limit,
                filtrarPaciente,
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
        const response = await apiClient.get('/sedes/', {
            params: { page, limit }
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
        const response = await apiClient.get('/medicos/short');

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
        const response = await apiClient.get(`/medicos/${medicoId}`);
        return response.data;
    } catch (error) {
        console.error("Error obteniendo el medico", error);
        throw error;
    }
};

export const getPacienteById = async ({
    pacienteId
} = {}) => {
    try {
        const response = await apiClient.get(`/pacientes/${pacienteId}`);
        return response.data;
    } catch (error) {
        console.error("Error obteniendo el paciente", error);
        throw error;
    }
};

export const updatePaciente = async ({ pacienteId, payload }) => {
    try {
        const response = await apiClient.put(`/pacientes/${pacienteId}`, payload);
        return response.data;
    } catch (error) {
        console.error("Error actualizando paciente", error);
        throw error;
    }
};

export const updateMedico = async ({ medicoId, payload }) => {
    try {
        const response = await apiClient.put(`/medicos/${medicoId}`, payload);
        return response.data;
    } catch (error) {
        console.error("Error actualizando medico", error);
        throw error;
    }
};
export const getEspecialidadesGenericas = async ({
    page = 1,
    limit = 100,
} = {}) => {
    try {
        const response = await apiClient.get('/especialidades/genericas', {
            params: { page, limit }
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
        const response = await apiClient.get('/practicas/genericas', {
            params: { page, limit }
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
    especialidadId,
    practicaId
} = {}) => {
    try {
        const payload = { estado };
        if (especialidadId) payload.especialidadId = especialidadId;
        if (practicaId) payload.practicaId = practicaId;

        const response = await apiClient.patch(`/turnos/${turnoId}`, payload);

        return response.data;
    } catch (error) {
        console.error("Error reservando un turno", error);
        throw error;
    }
};

export const cancelarTurnoApi = async (turnoId, motivo) => {
    try {
        const response = await apiClient.patch(`/turnos/${turnoId}`, { estado: "CANCELADO", motivo });
        return response.data;
    } catch (error) {
        console.error("Error cancelando un turno", error);
        throw error;
    }
};

export const getServicios = async ({
    medicoId = "6a14c252688165715658e489"
} = {}) => {
    try {
        const response = await apiClient.get(`/medicos/${medicoId}/servicios`);

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
        const response = await apiClient.post(`/medicos/${medicoId}/servicios`, {
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
        const response = await apiClient.post(`/medicos/${medicoId}/servicios`, {
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
        const response = await apiClient.put(`/medicos/${medicoId}/servicios`, {
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
        const response = await apiClient.delete(`/medicos/${medicoId}/servicios`, {
            data: { especialidadId, practicaId }
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
        const response = await apiClient.post(`/medicos/${medicoId}/disponibilidades`, {
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
        const response = await apiClient.get(`/medicos/${medicoId}/disponibilidades`);
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
        const response = await apiClient.delete(`/medicos/${medicoId}/disponibilidades/${disponibilidadId}`);
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
        const response = await apiClient.patch(`/medicos/${medicoId}/disponibilidades/${disponibilidadId}`, {
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
