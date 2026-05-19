const paths = {

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

  "/medicos": {
    get: {
      tags: ["Médicos"],
      summary: "Listar todos los médicos",
      parameters: [
        { $ref: "#/components/parameters/pageParam" },
        { $ref: "#/components/parameters/limitParam" },
        { $ref: "#/components/parameters/especialidadIdParam" },
        { $ref: "#/components/parameters/practicaIdParam" },
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
        { $ref: "#/components/parameters/especialidadIdParam" },
        { $ref: "#/components/parameters/practicaIdParam" },
        { $ref: "#/components/parameters/desdeParam" },
        { $ref: "#/components/parameters/hastaParam" },
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

  "/pacientes": {
    get: {
      tags: ["Pacientes"],
      summary: "Listar todos los pacientes",
      parameters: [
        { $ref: "#/components/parameters/pageParam" },
        { $ref: "#/components/parameters/limitParam" },
        { $ref: "#/components/parameters/pacienteIdQueryParam" },
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

  "/turnos": {
    get: {
      tags: ["Turnos"],
      summary: "Listar turnos",
      parameters: [
        { $ref: "#/components/parameters/pageParam" },
        { $ref: "#/components/parameters/limitParam" },
        { $ref: "#/components/parameters/pacienteIdQueryParam" },
        { $ref: "#/components/parameters/medicoIdQueryParam" },
        { $ref: "#/components/parameters/estadoParam" },
        { $ref: "#/components/parameters/especialidadIdParam" },
        { $ref: "#/components/parameters/practicaIdParam" },
        { $ref: "#/components/parameters/sedeIdParam" },
        { $ref: "#/components/parameters/desdeParam" },
        { $ref: "#/components/parameters/hastaParam" },
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
  },
  "/turnos/{id}/reservar": {
    post: {
      tags: ["Turnos"],
      summary: "Reservar un turno",
      parameters: [{ $ref: "#/components/parameters/idParam" }],
      requestBody: {
        required: true,
        content: {
          "application/json": { schema: { $ref: "#/components/schemas/ReservarTurnoInput" } },
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
        content: { "application/json": { schema: { $ref: "#/components/schemas/CancelarTurnoInput" } } },
      },
      responses: {
        200: { description: "Turno cancelado", content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "success" }, data: { $ref: "#/components/schemas/Turno" } } } } } },
        404: { description: "Turno no encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      },
    },
  },

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
        { $ref: "#/components/parameters/usuarioIdQueryParam" },
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
  "/sedes": {
    get: {
      tags: ["Sedes"],
      summary: "Listar todas las sedes",
      parameters: [
        { $ref: "#/components/parameters/pageParam" },
        { $ref: "#/components/parameters/limitParam" },
      ],
      responses: {
        200: {
          description: "Lista paginada de sedes",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "success" },
                  data: { type: "array", items: { $ref: "#/components/schemas/Sede" } },
                  paginacion: { $ref: "#/components/schemas/Paginacion" },
                },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Sedes"],
      summary: "Crear una sede",
      requestBody: {
        required: true,
        content: {
          "application/json": { schema: { $ref: "#/components/schemas/SedeInput" } },
        },
      },
      responses: {
        201: {
          description: "Sede creada",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/Sede" },
                },
              },
            },
          },
        },
        400: { description: "Datos inválidos", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        409: { description: "Sede ya existente", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      },
    },
  },
  "/sedes/{id}": {
    get: {
      tags: ["Sedes"],
      summary: "Obtener una sede por ID",
      parameters: [{ $ref: "#/components/parameters/idParam" }],
      responses: {
        200: {
          description: "Sede encontrada",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/Sede" },
                },
              },
            },
          },
        },
        404: { description: "No encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      },
    },
    },
    "/obras-sociales": {
        get: {
            tags: ["Obras Sociales"],
            summary: "Listar todas las obras sociales",
            parameters: [
                { $ref: "#/components/parameters/pageParam" },
                { $ref: "#/components/parameters/limitParam" },
            ],
            responses: {
                200: {
                    description: "Lista paginada de obras sociales",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    status: { type: "string", example: "success" },
                                    data: { type: "array", items: { $ref: "#/components/schemas/ObraSocial" } },
                                    paginacion: { $ref: "#/components/schemas/Paginacion" },
                                },
                            },
                        },
                    },
                },
            },
        },
        post: {
            tags: ["Obras Sociales"],
            summary: "Crear una obra social",
            requestBody: {
                required: true,
                content: {
                    "application/json": { schema: { $ref: "#/components/schemas/ObraSocialInput" } },
                },
            },
            responses: {
                201: {
                    description: "Obra social creada",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    status: { type: "string", example: "success" },
                                    data: { $ref: "#/components/schemas/ObraSocial" },
                                },
                            },
                        },
                    },
                },
                400: { description: "Datos inválidos", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
                409: { description: "Obra social ya existente", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            },
        },
    },
    "/obras-sociales/{id}": {
        get: {
            tags: ["Obras Sociales"],
            summary: "Obtener una obra social por ID",
            parameters: [{ $ref: "#/components/parameters/idParam" }],
            responses: {
                200: {
                    description: "Obra social encontrada",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    status: { type: "string", example: "success" },
                                    data: { $ref: "#/components/schemas/ObraSocial" },
                                },
                            },
                        },
                    },
                },
                404: { description: "No encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            },
        },  
    },
};

export default paths;
