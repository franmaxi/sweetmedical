const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Sistema de Turnos Médicos – API",
    version: "1.0.0",
    description:
      "API REST para la gestión de turnos médicos, pacientes, médicos, especialidades, prácticas y notificaciones.",
  },
  servers: [
    { url: "http://localhost:8080", description: "Servidor de desarrollo" },
  ],
  tags: [
    { name: "Health", description: "Estado del servidor" },
    { name: "Especialidades", description: "Gestión de especialidades médicas" },
    { name: "Médicos", description: "Gestión de médicos" },
    { name: "Pacientes", description: "Gestión de pacientes" },
    { name: "Turnos", description: "Gestión de turnos" },
    { name: "Prácticas", description: "Gestión de prácticas médicas" },
    { name: "Notificaciones", description: "Gestión de notificaciones" },
  ],
  components: {
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
          nombre: { type: "string", example: "Dr. Juan Pérez" },
          matricula: { type: "string", example: "MP-12345" },
          nombreUsuario: { type: "string", example: "jperez" },
          password: { type: "string", format: "password", example: "secret123" },
        },
      },
      MedicoUpdate: {
        type: "object",
        properties: {
          nombre: { type: "string", example: "Dr. Juan Pérez" },
          matricula: { type: "string", example: "MP-12345" },
          nombreUsuario: { type: "string", example: "jperez" },
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
          nombre: { type: "string", example: "Dr. Juan Pérez" },
          matricula: { type: "string", example: "MP-12345" },
          nombreUsuario: { type: "string", example: "jperez" },
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
          nombre: { type: "string", example: "María García" },
          obraSocialId: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d0e" },
          planId: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d0f" },
          nombreUsuario: { type: "string", example: "mgarcia" },
          password: { type: "string", format: "password", example: "secret123" },
        },
      },
      Paciente: {
        type: "object",
        properties: {
          _id: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d0e" },
          dni: { type: "integer", example: 30123456 },
          nombre: { type: "string", example: "María García" },
          obraSocialId: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d0e" },
          planId: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d0f" },
          nombreUsuario: { type: "string", example: "mgarcia" },
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
      idParam: {
        in: "path",
        name: "id",
        required: true,
        schema: { type: "string" },
        description: "ID del recurso (MongoDB ObjectId)",
      },
    },
  },
  paths: {
    // ── Health ──────────────────────────────────────────────────────────
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Estado del servidor",
        responses: {
          200: {
            description: "Servidor en funcionamiento",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Servidor en funcionamiento" },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ── Especialidades ──────────────────────────────────────────────────
    "/especialidades": {
      get: {
        tags: ["Especialidades"],
        summary: "Listar todas las especialidades",
        parameters: [
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
        ],
        responses: {
          200: {
            description: "Lista paginada de especialidades",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { type: "array", items: { $ref: "#/components/schemas/Especialidad" } },
                    paginacion: { $ref: "#/components/schemas/Paginacion" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Especialidades"],
        summary: "Crear una especialidad",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/EspecialidadInput" } },
          },
        },
        responses: {
          201: {
            description: "Especialidad creada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/Especialidad" },
                  },
                },
              },
            },
          },
          400: { description: "Datos inválidos", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          409: { description: "Especialidad ya existente", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/especialidades/{id}": {
      get: {
        tags: ["Especialidades"],
        summary: "Obtener una especialidad por ID",
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        responses: {
          200: {
            description: "Especialidad encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/Especialidad" },
                  },
                },
              },
            },
          },
          404: { description: "No encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      put: {
        tags: ["Especialidades"],
        summary: "Actualizar una especialidad",
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/EspecialidadInput" } },
          },
        },
        responses: {
          200: {
            description: "Especialidad actualizada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/Especialidad" },
                  },
                },
              },
            },
          },
          404: { description: "No encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      delete: {
        tags: ["Especialidades"],
        summary: "Eliminar una especialidad",
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        responses: {
          200: {
            description: "Especialidad eliminada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/Especialidad" },
                  },
                },
              },
            },
          },
          404: { description: "No encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/especialidades/genericas": {
      get: {
        tags: ["Especialidades"],
        summary: "Listar todas las especialidades genéricas",
        parameters: [
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
        ],
        responses: {
          200: {
            description: "Lista paginada de especialidades genéricas",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { type: "array", items: { $ref: "#/components/schemas/EspecialidadGenerica" } },
                    paginacion: { $ref: "#/components/schemas/Paginacion" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Especialidades"],
        summary: "Crear una especialidad genérica",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/EspecialidadGenerica" } },
          },
        },
        responses: {
          201: {
            description: "Especialidad genérica creada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/EspecialidadGenerica" },
                  },
                },
              },
            },
          },
          409: { description: "Ya existe", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/especialidades/genericas/{id}": {
      get: {
        tags: ["Especialidades"],
        summary: "Obtener una especialidad genérica por ID",
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        responses: {
          200: {
            description: "Especialidad genérica encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/EspecialidadGenerica" },
                  },
                },
              },
            },
          },
          404: { description: "No encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      put: {
        tags: ["Especialidades"],
        summary: "Actualizar una especialidad genérica",
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/EspecialidadGenerica" } },
          },
        },
        responses: {
          200: {
            description: "Especialidad genérica actualizada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/EspecialidadGenerica" },
                  },
                },
              },
            },
          },
          404: { description: "No encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    // ── Médicos ─────────────────────────────────────────────────────────
    "/medicos": {
      get: {
        tags: ["Médicos"],
        summary: "Listar todos los médicos",
        parameters: [
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
          { in: "query", name: "especialidadId", schema: { type: "string" }, description: "Filtrar por ID de especialidad" },
          { in: "query", name: "practicaId", schema: { type: "string" }, description: "Filtrar por ID de práctica" },
        ],
        responses: {
          200: {
            description: "Lista paginada de médicos",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { type: "array", items: { $ref: "#/components/schemas/Medico" } },
                    paginacion: { $ref: "#/components/schemas/Paginacion" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Médicos"],
        summary: "Crear un médico",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/MedicoInput" } },
          },
        },
        responses: {
          201: {
            description: "Médico creado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/Medico" },
                  },
                },
              },
            },
          },
          400: { description: "Datos inválidos", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          409: { description: "Médico ya existente", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/medicos/{id}": {
      get: {
        tags: ["Médicos"],
        summary: "Obtener un médico por ID",
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        responses: {
          200: {
            description: "Médico encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/Medico" },
                  },
                },
              },
            },
          },
          404: { description: "No encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      put: {
        tags: ["Médicos"],
        summary: "Actualizar un médico",
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/MedicoUpdate" } },
          },
        },
        responses: {
          200: {
            description: "Médico actualizado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/Medico" },
                  },
                },
              },
            },
          },
          404: { description: "No encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      delete: {
        tags: ["Médicos"],
        summary: "Eliminar un médico",
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        responses: {
          200: {
            description: "Médico eliminado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/Medico" },
                  },
                },
              },
            },
          },
          404: { description: "No encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/medicos/{id}/agenda": {
      get: {
        tags: ["Médicos"],
        summary: "Consultar la agenda de un médico",
        description: "Devuelve los turnos disponibles del médico, opcionalmente filtrados por especialidad, práctica y rango de fechas.",
        parameters: [
          { $ref: "#/components/parameters/idParam" },
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
          { in: "query", name: "especialidadId", schema: { type: "string" }, description: "Filtrar por ID de especialidad" },
          { in: "query", name: "practicaId", schema: { type: "string" }, description: "Filtrar por ID de práctica" },
          { in: "query", name: "desde", schema: { type: "string", format: "date-time" }, description: "Fecha inicio del rango" },
          { in: "query", name: "hasta", schema: { type: "string", format: "date-time" }, description: "Fecha fin del rango" },
        ],
        responses: {
          200: {
            description: "Turnos disponibles del médico",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { type: "array", items: { $ref: "#/components/schemas/Turno" } },
                    paginacion: { $ref: "#/components/schemas/Paginacion" },
                  },
                },
              },
            },
          },
          404: { description: "Médico no encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    // ── Pacientes ───────────────────────────────────────────────────────
    "/pacientes": {
      get: {
        tags: ["Pacientes"],
        summary: "Listar todos los pacientes",
        parameters: [
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
          { in: "query", name: "pacienteId", schema: { type: "string" }, description: "Filtrar por ID de paciente" },
          { in: "query", name: "plan", schema: { type: "string" }, description: "Filtrar por plan de obra social" },
        ],
        responses: {
          200: {
            description: "Lista paginada de pacientes",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { type: "array", items: { $ref: "#/components/schemas/Paciente" } },
                    paginacion: { $ref: "#/components/schemas/Paginacion" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Pacientes"],
        summary: "Crear un paciente",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/PacienteInput" } },
          },
        },
        responses: {
          201: {
            description: "Paciente creado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/Paciente" },
                  },
                },
              },
            },
          },
          400: { description: "Datos inválidos", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          409: { description: "Paciente ya existente", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/pacientes/{id}": {
      get: {
        tags: ["Pacientes"],
        summary: "Obtener un paciente por ID",
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        responses: {
          200: {
            description: "Paciente encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/Paciente" },
                  },
                },
              },
            },
          },
          404: { description: "No encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      put: {
        tags: ["Pacientes"],
        summary: "Actualizar un paciente",
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/PacienteInput" } },
          },
        },
        responses: {
          200: {
            description: "Paciente actualizado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/Paciente" },
                  },
                },
              },
            },
          },
          404: { description: "No encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      delete: {
        tags: ["Pacientes"],
        summary: "Eliminar un paciente",
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        responses: {
          200: {
            description: "Paciente eliminado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/Paciente" },
                  },
                },
              },
            },
          },
          404: { description: "No encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    // ── Turnos ──────────────────────────────────────────────────────────
    "/turnos": {
      get: {
        tags: ["Turnos"],
        summary: "Listar turnos",
        parameters: [
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
          { in: "query", name: "pacienteId", schema: { type: "string" }, description: "Filtrar por ID de paciente" },
          { in: "query", name: "medicoId", schema: { type: "string" }, description: "Filtrar por ID de médico" },
          {
            in: "query",
            name: "estado",
            schema: { type: "string", enum: ["disponible", "reservado", "cancelado", "completado"] },
            description: "Filtrar por estado",
          },
          { in: "query", name: "especialidadId", schema: { type: "string" }, description: "Filtrar por ID de especialidad" },
          { in: "query", name: "practicaId", schema: { type: "string" }, description: "Filtrar por ID de práctica" },
          { in: "query", name: "sedeId", schema: { type: "string" }, description: "Filtrar por ID de sede" },
          { in: "query", name: "desde", schema: { type: "string", format: "date-time" }, description: "Fecha inicio del rango (ISO 8601)" },
          { in: "query", name: "hasta", schema: { type: "string", format: "date-time" }, description: "Fecha fin del rango (ISO 8601)" },
        ],
        responses: {
          200: {
            description: "Lista paginada de turnos",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { type: "array", items: { $ref: "#/components/schemas/Turno" } },
                    paginacion: { $ref: "#/components/schemas/Paginacion" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Turnos"],
        summary: "Crear un turno",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/TurnoInput" } },
          },
        },
        responses: {
          201: {
            description: "Turno creado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/Turno" },
                  },
                },
              },
            },
          },
          400: { description: "Datos inválidos", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          409: { description: "Conflicto de horario", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/turnos/{id}": {
      get: {
        tags: ["Turnos"],
        summary: "Obtener un turno por ID",
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        responses: {
          200: {
            description: "Turno encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/Turno" },
                  },
                },
              },
            },
          },
          404: { description: "No encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      delete: {
        tags: ["Turnos"],
        summary: "Eliminar un turno",
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        responses: {
          200: {
            description: "Turno eliminado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/Turno" },
                  },
                },
              },
            },
          },
          404: { description: "No encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/turnos/{id}/reservar": {
        post: {
            tags: ["Turnos"],
            summary: "Reservar un turno",
            parameters: [{ $ref: "#/components/parameters/idParam" }],
            requestBody: {
            required: true,
            content: {
                "application/json": {
                schema: {
                    type: "object",
                    required: ["pacienteId"],
                    properties: {
                    pacienteId: { type: "integer", example: 1 },
                    especialidadId: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d1b" },
                    practicaId: { type: "string", example: "664a1b2c3d4e5f6a7b8c9d1c" },
                    },
                },
                },
            },
            },
            responses: {
            200: { description: "Turno reservado", content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "success" }, data: { $ref: "#/components/schemas/Turno" } } } } } },
            404: { description: "Turno o paciente no encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            422: { description: "Turno no disponible o sin tiempo suficiente", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            },
        },
    },
    "/turnos/{id}/cancelar": {
        post: {
            tags: ["Turnos"],
            summary: "Cancelar un turno",
            parameters: [{ $ref: "#/components/parameters/idParam" }],
            requestBody: {
            required: true,
            content: {
                "application/json": {
                schema: {
                    type: "object",
                    required: ["usuario"],
                    properties: {
                    usuario: { type: "object", description: "Datos del usuario que cancela" },
                    motivo: { type: "string", example: "No puedo asistir" },
                    },
                },
                },
            },
            },
            responses: {
            200: { description: "Turno cancelado", content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "success" }, data: { $ref: "#/components/schemas/Turno" } } } } } },
            404: { description: "Turno no encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            },
        },
    },

    // ── Prácticas ───────────────────────────────────────────────────────
    "/practicas": {
      get: {
        tags: ["Prácticas"],
        summary: "Listar todas las prácticas",
        parameters: [
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
        ],
        responses: {
          200: {
            description: "Lista paginada de prácticas",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { type: "array", items: { $ref: "#/components/schemas/Practica" } },
                    paginacion: { $ref: "#/components/schemas/Paginacion" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Prácticas"],
        summary: "Crear una práctica",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/PracticaInput" } },
          },
        },
        responses: {
          201: {
            description: "Práctica creada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/Practica" },
                  },
                },
              },
            },
          },
          400: { description: "Datos inválidos", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          409: { description: "Práctica ya existente", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/practicas/{id}": {
      get: {
        tags: ["Prácticas"],
        summary: "Obtener una práctica por ID",
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        responses: {
          200: {
            description: "Práctica encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/Practica" },
                  },
                },
              },
            },
          },
          404: { description: "No encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      put: {
        tags: ["Prácticas"],
        summary: "Actualizar una práctica",
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/PracticaInput" } },
          },
        },
        responses: {
          200: {
            description: "Práctica actualizada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/Practica" },
                  },
                },
              },
            },
          },
          404: { description: "No encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      delete: {
        tags: ["Prácticas"],
        summary: "Eliminar una práctica",
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        responses: {
          200: {
            description: "Práctica eliminada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/Practica" },
                  },
                },
              },
            },
          },
          404: { description: "No encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/practicas/genericas": {
      get: {
        tags: ["Prácticas"],
        summary: "Listar todas las prácticas genéricas",
        parameters: [
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
        ],
        responses: {
          200: {
            description: "Lista paginada de prácticas genéricas",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { type: "array", items: { $ref: "#/components/schemas/PracticaGenerica" } },
                    paginacion: { $ref: "#/components/schemas/Paginacion" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Prácticas"],
        summary: "Crear una práctica genérica",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/PracticaGenerica" } },
          },
        },
        responses: {
          201: {
            description: "Práctica genérica creada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/PracticaGenerica" },
                  },
                },
              },
            },
          },
          409: { description: "Ya existe", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/practicas/genericas/{id}": {
      get: {
        tags: ["Prácticas"],
        summary: "Obtener una práctica genérica por ID",
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        responses: {
          200: {
            description: "Práctica genérica encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/PracticaGenerica" },
                  },
                },
              },
            },
          },
          404: { description: "No encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      put: {
        tags: ["Prácticas"],
        summary: "Actualizar una práctica genérica",
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/PracticaGenerica" } },
          },
        },
        responses: {
          200: {
            description: "Práctica genérica actualizada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/PracticaGenerica" },
                  },
                },
              },
            },
          },
          404: { description: "No encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    // ── Notificaciones ──────────────────────────────────────────────────
    "/notificaciones": {
      get: {
        tags: ["Notificaciones"],
        summary: "Listar notificaciones",
        parameters: [
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/limitParam" },
          { in: "query", name: "usuarioId", schema: { type: "string" }, description: "Filtrar por ID de usuario" },
          { in: "query", name: "leida", schema: { type: "boolean" }, description: "Filtrar por estado de lectura (true | false)" },
        ],
        responses: {
          200: {
            description: "Lista paginada de notificaciones",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { type: "array", items: { $ref: "#/components/schemas/Notificacion" } },
                    paginacion: { $ref: "#/components/schemas/Paginacion" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/notificaciones/{id}": {
      patch: {
        tags: ["Notificaciones"],
        summary: "Marcar una notificación como leída",
        parameters: [
          { $ref: "#/components/parameters/idParam" },
          { in: "query", name: "usuarioId", schema: { type: "string" }, description: "ID del usuario (contexto opcional)" },
        ],
        responses: {
          200: {
            description: "Notificación marcada como leída",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/Notificacion" },
                  },
                },
              },
            },
          },
          404: { description: "No encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
  },
};

export default swaggerSpec;
