const openApiConfig = {
  openapi: "3.0.0",
  info: {
    title: "Sweet Medical – API",
    version: "1.0.0",
    description:
      "API REST para la gestión de turnos médicos, pacientes, médicos, especialidades, prácticas y notificaciones.",
  },
  servers: [
    { url: "http://localhost:8080", description: "Servidor de desarrollo" },
  ],
  tags: [
    { name: "Especialidades", description: "Gestión de especialidades médicas" },
    { name: "Médicos", description: "Gestión de médicos" },
    { name: "Pacientes", description: "Gestión de pacientes" },
    { name: "Turnos", description: "Gestión de turnos" },
    { name: "Prácticas", description: "Gestión de prácticas médicas" },
    { name: "Notificaciones", description: "Gestión de notificaciones" },
    { name: "Sedes", description: "Gestión de sedes médicas" },
    { name: "Obras Sociales", description: "Gestión de obras sociales" },
  ],
};

export default openApiConfig;
