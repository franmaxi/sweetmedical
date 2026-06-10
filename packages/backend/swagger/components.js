const components = {
  schemas: {
    Paginacion: {
      type: "object",
      properties: {
        numeroPagina: { type: "integer", example: 1 },
        limitePagina: { type: "integer", example: 10 },
        totalPaginas: { type: "integer", example: 5 },
        total: { type: "integer", example: 42 },
      },
    },
    Error: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["fail", "error"] },
        message: { type: "string", example: "Recurso no encontrado" },
        timestamp: { type: "string", format: "date-time" },
      },
    },
    EspecialidadInput: {
      type: "object",
      required: ["nombre", "duracionTurnoEnMins", "costoConsulta"],
      properties: {
        nombre: { type: "string", example: "Cardiología" },
        duracionTurnoEnMins: { type: "integer", example: 30 },
        costoConsulta: { type: "number", example: 5000 },
      },
    },
    Especialidad: {
      allOf: [
        { $ref: "#/components/schemas/EspecialidadInput" },
        {
          type: "object",
          properties: {
            _id: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d0e" },
          },
        },
      ],
    },
    EspecialidadGenerica: {
      type: "object",
      required: ["nombre"],
      properties: {
        _id: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d0e" },
        nombre: { type: "string", example: "Clínica Médica" },
      },
    },
    DisponibilidadHoraria: {
      type: "object",
      properties: {
        diaSemana: {
          type: "string",
          enum: ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"],
          example: "lunes",
        },
        horaInicio: { type: "string", example: "08:00" },
        horaFin: { type: "string", example: "14:00" },
        sedeId: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d1a" },
      },
    },
    MedicoInput: {
      type: "object",
      required: ["nombre", "matricula", "nombreUsuario", "password"],
      properties: {
        nombre: { type: "string", example: "Dra. Meredith Grey" },
        matricula: { type: "string", example: "MP-12345" },
        nombreUsuario: { type: "string", example: "mgrey" },
        password: { type: "string", format: "password", example: "secret123" },
      },
    },
    MedicoUpdate: {
      type: "object",
      properties: {
        nombre: { type: "string", example: "Dra. Meredith Grey" },
        matricula: { type: "string", example: "MP-12345" },
        nombreUsuario: { type: "string", example: "mgrey" },
        password: { type: "string", format: "password" },
        especialidades: {
          type: "array",
          items: { type: "string" },
          example: ["664a1b2c3d4e5f6a7b8c9d0e"],
        },
        practicas: {
          type: "array",
          items: { type: "string" },
          example: ["664a1b2c3d4e5f6a7b8c9d0f"],
        },
        sedes: {
          type: "array",
          items: { type: "string" },
          example: ["664a1b2c3d4e5f6a7b8c9d1a"],
        },
        disponibilidades: {
          type: "array",
          items: { $ref: "#/components/schemas/DisponibilidadHoraria" },
        },
      },
    },
    Medico: {
      type: "object",
      properties: {
        _id: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d0e" },
        nombre: { type: "string", example: "Dra. Meredith Grey" },
        matricula: { type: "string", example: "MP-12345" },
        nombreUsuario: { type: "string", example: "mgrey" },
        especialidades: {
          type: "array",
          items: { $ref: "#/components/schemas/Especialidad" },
        },
        practicas: {
          type: "array",
          items: { $ref: "#/components/schemas/Practica" },
        },
        sedes: { type: "array", items: { type: "string" } },
        disponibilidades: {
          type: "array",
          items: { $ref: "#/components/schemas/DisponibilidadHoraria" },
        },
      },
    },
    PacienteInput: {
      type: "object",
      required: ["dni", "nombre", "obraSocialId", "planId", "nombreUsuario", "password"],
      properties: {
        dni: { type: "integer", example: 30123456 },
        nombre: { type: "string", example: "Denny Duquette" },
        obraSocialId: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d0e" },
        planId: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d0f" },
        nombreUsuario: { type: "string", example: "dduquette" },
        password: { type: "string", format: "password", example: "secret123" },
      },
    },
    Paciente: {
      type: "object",
      properties: {
        _id: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d0e" },
        dni: { type: "integer", example: 30123456 },
        nombre: { type: "string", example: "Denny Duquette" },
        obraSocialId: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d0e" },
        planId: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d0f" },
        nombreUsuario: { type: "string", example: "dduquette" },
      },
    },
    TurnoInput: {
      type: "object",
      required: ["medicoID", "fechaHora", "sedeId"],
      properties: {
        medicoID: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d0e" },
        paciente: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d0f" },
        fechaHora: {
          type: "string",
          format: "date-time",
          example: "2026-06-15T09:00:00.000Z",
        },
        sedeId: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d1a" },
        especialidadId: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d1b" },
        practicaId: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d1c" },
        costo: { type: "number", example: 5000 },
      },
    },
    Turno: {
      type: "object",
      properties: {
        _id: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d0e" },
        medicoID: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d0e" },
        paciente: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d0f" },
        fechaHora: { type: "string", format: "date-time" },
        sedeId: { type: "string" },
        especialidadId: { type: "string" },
        practicaId: { type: "string" },
        costo: { type: "number" },
        estado: {
          type: "string",
          enum: ["disponible", "reservado", "cancelado", "completado"],
          example: "disponible",
        },
        historialEstados: {
          type: "array",
          items: {
            type: "object",
            properties: {
              estado: { type: "string" },
              fecha: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
    PracticaInput: {
      type: "object",
      required: ["codigo", "nombre", "duracionTurnoEnMins", "costo"],
      properties: {
        codigo: { type: "string", example: "ECG-001" },
        nombre: { type: "string", example: "Electrocardiograma" },
        duracionTurnoEnMins: { type: "integer", example: 20 },
        costo: { type: "number", example: 3500 },
      },
    },
    Practica: {
      allOf: [
        { $ref: "#/components/schemas/PracticaInput" },
        {
          type: "object",
          properties: {
            _id: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d0e" },
          },
        },
      ],
    },
    PracticaGenerica: {
      type: "object",
      required: ["codigo", "nombre"],
      properties: {
        _id: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d0e" },
        codigo: { type: "string", example: "ECG" },
        nombre: { type: "string", example: "Electrocardiograma" },
      },
    },
    Notificacion: {
      type: "object",
      properties: {
        _id: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d0e" },
        usuarioId: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d0f" },
        mensaje: { type: "string", example: "Su turno fue confirmado" },
        leida: { type: "boolean", example: false },
        fecha: { type: "string", format: "date-time" },
      },
    },
    SedeInput: {
      type: "object",
      required: ["nombre", "direccion"],
      properties: {
        nombre: { type: "string", example: "Grey Sloan Memorial Hospital" },
        direccion: { type: "string", example: "123 Main Street" },
     },
    },
    Sede: {
      type: "object",
      properties: {
        _id: { type: "string", example: "sede-664a1b2c" },
        nombre: { type: "string", example: "Grey Sloan Memorial Hospital" },
        direccion: { type: "string", example: "123 Main Street" },
      },
    },
    Plan: {
      type: "object",
      properties: {
        _id: { type: "string", example: "plan-664a1b2c" },
        nombre: { type: "string", example: "Plan Básico" },
        coberturaEspecialidad: {
          type: "array",
          items: {
            type: "object",
            properties: {
              especialidad: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d0e" },
              nivel: { type: "string", example: "ALTO" },
            },
          },
        },
        coberturaPractica: {
          type: "array",
          items: {
            type: "object",
            properties: {
              practica: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d0f" },
              nivel: { type: "string", example: "MEDIO" },
            },
          },
        },
      },
    },
    ObraSocialInput: {
      type: "object",
      required: ["nombre"],
      properties: {
        nombre: { type: "string", example: "Sweet Medical" },
        planes: { type: "array", items: { $ref: "#/components/schemas/Plan" } },
      },
    },
    ObraSocial: {
      type: "object",
      properties: {
        nombre: { type: "string", example: "Sweet Medical" },
        planes: { type: "array", items: { $ref: "#/components/schemas/Plan" } },
      },
    },
    ReservarTurnoInput: {
      type: "object",
      required: ["pacienteId"],
      properties: {
        pacienteId: { type: "string", example: "character-664a1b2c" },
        especialidadId: { type: "string", example: "genre-drama-001" },
        practicaId: { type: "string", example: "episodio-S01E01" },
      },
    },
    CancelarTurnoInput: {
      type: "object",
      required: ["usuario"],
      properties: {
        usuario: { type: "object", description: "Datos del usuario que cancela" },
        motivo: { type: "string", example: "No puedo asistir" },
      },
    },
  },
  parameters: {
    pageParam: {
      in: "query",
      name: "page",
      schema: { type: "integer", minimum: 1, default: 1 },
      description: "Número de página",
    },
    limitParam: {
      in: "query",
      name: "limit",
      schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
      description: "Cantidad de resultados por página",
    },
    especialidadIdParam: {
      in: "query",
      name: "especialidadId",
      schema: { type: "string" },
      description: "Filtrar por ID de especialidad",
    },
    practicaIdParam: {
      in: "query",
      name: "practicaId",
      schema: { type: "string" },
      description: "Filtrar por ID de práctica",
    },
    sedeIdParam: {
      in: "query",
      name: "sedeId",
      schema: { type: "string" },
      description: "Filtrar por ID de sede",
    },
    pacienteIdQueryParam: {
      in: "query",
      name: "pacienteId",
      schema: { type: "string" },
      description: "Filtrar por ID de paciente",
    },
    medicoIdQueryParam: {
      in: "query",
      name: "medicoId",
      schema: { type: "string" },
      description: "Filtrar por ID de médico",
    },
    desdeParam: {
      in: "query",
      name: "desde",
      schema: { type: "string", format: "date-time" },
      description: "Fecha inicio del rango",
    },
    hastaParam: {
      in: "query",
      name: "hasta",
      schema: { type: "string", format: "date-time" },
      description: "Fecha fin del rango",
    },
    estadoParam: {
      in: "query",
      name: "estado",
      schema: { type: "string", enum: ["disponible", "reservado", "cancelado", "completado"] },
      description: "Filtrar por estado",
    },
    idParam: {
      in: "path",
      name: "id",
      required: true,
      schema: { type: "string" },
      description: "ID del recurso (MongoDB ObjectId)",
    },
    usuarioIdQueryParam: {
      in: "query",
      name: "usuarioId",
      schema: { type: "string" },
      description: "ID del usuario (contexto opcional)",
    },
  },
  
};

export default components;
