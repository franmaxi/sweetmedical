// Mock de GET /medicos, GET /medicos/:id, GET /medicos/:id/disponibilidades, etc.
// Modelo backend: packages/backend/domain/Medico/Medico.js
//
// El médico tiene UNA especialidad personalizada (`especialidadId`) que a su
// vez referencia a una especialidad genérica del catálogo
// (ver especialidades.js y especialidadesGenericas.js).
// Resto de relaciones (prácticas, sedes) se exponen como ids para mantener
// la respuesta plana como haría una API REST típica.

import { ok, nextId } from "./_helpers.js";
import { DiaSemana } from "./enumerados.js";
import { especialidadesMock } from "./especialidades.js";
import { especialidadesGenericasMock } from "./especialidadesGenericas.js";
import { practicasMock } from "./practicas.js";

export const medicosMock = [
  {
    id: 1,
    usuarioId: 101,
    matricula: "MN 45821",
    nombre: "Dra. Jessica Joan",
    especialidadId: 101, // Nefrología (personalizada → genérica id 16)
    practicas: [5],
    sedes: [1],
    disponibilidades: [
      { diaSemana: DiaSemana.LUNES,     horaDesde: "09:00", horaHasta: "13:00" },
      { diaSemana: DiaSemana.MIERCOLES, horaDesde: "14:00", horaHasta: "18:00" },
    ],
  },
  {
    id: 2,
    usuarioId: 102,
    matricula: "MN 52114",
    nombre: "Dra. Alexandra Pérez",
    especialidadId: 102, // Gastroenterología
    practicas: [2, 10],
    sedes: [2],
    disponibilidades: [
      { diaSemana: DiaSemana.MARTES, horaDesde: "08:00", horaHasta: "12:00" },
      { diaSemana: DiaSemana.JUEVES, horaDesde: "08:00", horaHasta: "12:00" },
    ],
  },
  {
    id: 3,
    usuarioId: 103,
    matricula: "MN 38902",
    nombre: "Dra. Kimberly López",
    especialidadId: 103, // Neurología
    practicas: [],
    sedes: [3],
    disponibilidades: [
      { diaSemana: DiaSemana.LUNES,   horaDesde: "10:00", horaHasta: "16:00" },
      { diaSemana: DiaSemana.VIERNES, horaDesde: "10:00", horaHasta: "16:00" },
    ],
  },
  {
    id: 4,
    usuarioId: 104,
    matricula: "MN 60012",
    nombre: "Dr. Tomás Carol",
    especialidadId: 104, // Obstetricia
    practicas: [3],
    sedes: [1],
    disponibilidades: [
      { diaSemana: DiaSemana.MARTES, horaDesde: "09:00", horaHasta: "13:00" },
    ],
  },
  {
    id: 5,
    usuarioId: 105,
    matricula: "MN 41203",
    nombre: "Dra. Rebecca Rose",
    especialidadId: 105, // Ginecología
    practicas: [4],
    sedes: [1],
    disponibilidades: [
      { diaSemana: DiaSemana.LUNES,     horaDesde: "08:00", horaHasta: "12:00" },
      { diaSemana: DiaSemana.MIERCOLES, horaDesde: "14:00", horaHasta: "18:00" },
      { diaSemana: DiaSemana.VIERNES,   horaDesde: "08:00", horaHasta: "12:00" },
    ],
  },
  {
    id: 6,
    usuarioId: 106,
    matricula: "MN 58844",
    nombre: "Dra. Stephanie Sue",
    especialidadId: 106, // Hematología
    practicas: [5],
    sedes: [2],
    disponibilidades: [
      { diaSemana: DiaSemana.JUEVES, horaDesde: "13:00", horaHasta: "19:00" },
    ],
  },
  {
    id: 7,
    usuarioId: 107,
    matricula: "MN 47301",
    nombre: "Dra. Penélope Cruz",
    especialidadId: 107, // Fisioterapia
    practicas: [8],
    sedes: [3],
    disponibilidades: [
      { diaSemana: DiaSemana.MARTES, horaDesde: "14:00", horaHasta: "20:00" },
      { diaSemana: DiaSemana.JUEVES, horaDesde: "14:00", horaHasta: "20:00" },
    ],
  },
  {
    id: 8,
    usuarioId: 108,
    matricula: "MN 33205",
    nombre: "Dra. Lauren Leah",
    especialidadId: 108, // Oncología
    practicas: [],
    sedes: [1],
    disponibilidades: [
      { diaSemana: DiaSemana.MIERCOLES, horaDesde: "09:00", horaHasta: "15:00" },
    ],
  },
  {
    id: 9,
    usuarioId: 109,
    matricula: "MN 27110",
    nombre: "Dr. Martín Ríos",
    especialidadId: 109, // Cardiología
    practicas: [1],
    sedes: [1, 2],
    disponibilidades: [
      { diaSemana: DiaSemana.LUNES,  horaDesde: "08:00", horaHasta: "12:00" },
      { diaSemana: DiaSemana.JUEVES, horaDesde: "15:00", horaHasta: "20:00" },
    ],
  },
  {
    id: 10,
    usuarioId: 110,
    matricula: "MN 29812",
    nombre: "Dra. Carolina Méndez",
    especialidadId: 110, // Pediatría
    practicas: [],
    sedes: [4],
    disponibilidades: [
      { diaSemana: DiaSemana.MARTES,  horaDesde: "09:00", horaHasta: "13:00" },
      { diaSemana: DiaSemana.VIERNES, horaDesde: "09:00", horaHasta: "13:00" },
    ],
  },
];

// El dominio guarda UNA especialidad por médico (`especialidadId`), pero la
// pantalla "Mis Especialidades" permite gestionar varias. Inicializamos una
// lista `especialidades` por médico a partir de su especialidad actual; el
// campo `especialidadId` se mantiene para el resto de las pantallas.
medicosMock.forEach((m) => {
  m.especialidades = [m.especialidadId];
});

export const getMedicos = ({ especialidadId, especialidadGenericaId, sedeId, q } = {}) => {
  let lista = medicosMock;
  if (especialidadId != null) {
    lista = lista.filter((m) => m.especialidadId === Number(especialidadId));
  }
  if (especialidadGenericaId != null) {
    const idsPersonalizadas = especialidadesMock
      .filter((e) => e.especialidadGenericaId === Number(especialidadGenericaId))
      .map((e) => e.id);
    lista = lista.filter((m) => idsPersonalizadas.includes(m.especialidadId));
  }
  if (sedeId != null) {
    lista = lista.filter((m) => m.sedes.includes(Number(sedeId)));
  }
  if (q && q.trim()) {
    const needle = q.trim().toLowerCase();
    lista = lista.filter((m) => m.nombre.toLowerCase().includes(needle));
  }
  return ok(lista);
};

export const getDisponibilidadesDeMedico = (id) => {
  const medico = medicosMock.find((m) => m.id === Number(id));
  return ok(medico?.disponibilidades ?? []);
};

export const agregarDisponibilidad = (id, disponibilidad) => {
  const medico = medicosMock.find((m) => m.id === Number(id));
  medico.disponibilidades.push(disponibilidad);
  return ok(medico.disponibilidades);
};

export const eliminarDisponibilidad = (id, indice) => {
  const medico = medicosMock.find((m) => m.id === Number(id));
  medico.disponibilidades.splice(indice, 1);
  return ok(medico.disponibilidades);
};

// --- Especialidades del médico (CRUD) -------------------------------------
// El `nombre` de la especialidad personalizada se toma del catálogo genérico.
const nombreGenerica = (genericaId) =>
  especialidadesGenericasMock.find((g) => g.id === Number(genericaId))?.nombre ?? "—";

export const getEspecialidadesDeMedico = (medicoId) => {
  const medico = medicosMock.find((m) => m.id === Number(medicoId));
  const lista = (medico?.especialidades ?? [])
    .map((id) => especialidadesMock.find((e) => e.id === id))
    .filter(Boolean);
  return ok(lista);
};

export const agregarEspecialidad = (medicoId, datos) => {
  const medico = medicosMock.find((m) => m.id === Number(medicoId));
  const nueva = {
    id: nextId(especialidadesMock),
    especialidadGenericaId: Number(datos.especialidadGenericaId),
    nombre: nombreGenerica(datos.especialidadGenericaId),
    duracionTurnoEnMins: Number(datos.duracionTurnoEnMins),
    costoConsulta: Number(datos.costoConsulta),
  };
  especialidadesMock.push(nueva);
  medico.especialidades.push(nueva.id);
  return ok(nueva);
};

export const editarEspecialidad = (especialidadId, datos) => {
  const esp = especialidadesMock.find((e) => e.id === Number(especialidadId));
  esp.especialidadGenericaId = Number(datos.especialidadGenericaId);
  esp.nombre = nombreGenerica(datos.especialidadGenericaId);
  esp.duracionTurnoEnMins = Number(datos.duracionTurnoEnMins);
  esp.costoConsulta = Number(datos.costoConsulta);
  return ok(esp);
};

export const eliminarEspecialidad = (medicoId, especialidadId) => {
  const medico = medicosMock.find((m) => m.id === Number(medicoId));
  medico.especialidades = medico.especialidades.filter((id) => id !== Number(especialidadId));
  return ok(medico.especialidades);
};

// --- Prácticas del médico (CRUD) ------------------------------------------
export const getPracticasDeMedico = (medicoId) => {
  const medico = medicosMock.find((m) => m.id === Number(medicoId));
  const lista = (medico?.practicas ?? [])
    .map((id) => practicasMock.find((p) => p.id === id))
    .filter(Boolean);
  return ok(lista);
};

export const agregarPractica = (medicoId, datos) => {
  const medico = medicosMock.find((m) => m.id === Number(medicoId));
  const nueva = {
    id: nextId(practicasMock),
    codigo: datos.codigo,
    nombre: datos.nombre,
    duracionTurnoEnMins: Number(datos.duracionTurnoEnMins),
    costo: Number(datos.costo),
  };
  practicasMock.push(nueva);
  medico.practicas.push(nueva.id);
  return ok(nueva);
};

export const editarPractica = (practicaId, datos) => {
  const prac = practicasMock.find((p) => p.id === Number(practicaId));
  prac.codigo = datos.codigo;
  prac.nombre = datos.nombre;
  prac.duracionTurnoEnMins = Number(datos.duracionTurnoEnMins);
  prac.costo = Number(datos.costo);
  return ok(prac);
};

export const eliminarPractica = (medicoId, practicaId) => {
  const medico = medicosMock.find((m) => m.id === Number(medicoId));
  medico.practicas = medico.practicas.filter((id) => id !== Number(practicaId));
  return ok(medico.practicas);
};
