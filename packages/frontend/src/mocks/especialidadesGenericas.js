// Mock de GET /especialidades-genericas — catálogo común de especialidades.
// Esta entidad NO tiene duración/costo: esos datos viven en la "especialidad
// personalizada" de cada médico (ver especialidades.js).
// Campos: { id, nombre, descripcion }

import { ok } from "./_helpers.js";

export const especialidadesGenericasMock = [
  { id: 1,  nombre: "Cardiología",        descripcion: "Cuidamos la salud de tu corazón con estudios y seguimiento personalizado." },
  { id: 2,  nombre: "Ginecología",        descripcion: "Atención integral en salud femenina, controles y prevención." },
  { id: 3,  nombre: "Traumatología",      descripcion: "Lesiones deportivas, fracturas y rehabilitación con especialistas." },
  { id: 4,  nombre: "Neumonología",       descripcion: "Diagnóstico y tratamiento de enfermedades respiratorias." },
  { id: 5,  nombre: "Oftalmología",       descripcion: "Controles visuales y tratamientos para el cuidado de tus ojos." },
  { id: 6,  nombre: "Pediatría",          descripcion: "Atención dedicada al crecimiento y bienestar de los más chicos." },
  { id: 7,  nombre: "Dermatología",       descripcion: "Cuidado integral de la piel, tratamientos clínicos y estéticos." },
  { id: 8,  nombre: "Clínica Médica",     descripcion: "Consulta general y derivaciones a especialistas según tu caso." },
  { id: "6a0b5138544283eee122e587",  nombre: "Odontología",        descripcion: "Salud bucal, limpieza, ortodoncia y tratamientos preventivos." },
  { id: 10, nombre: "Neurología",         descripcion: "Diagnóstico y tratamiento de enfermedades del sistema nervioso." },
  { id: 11, nombre: "Obstetricia",        descripcion: "Acompañamiento durante el embarazo, parto y posparto." },
  { id: 12, nombre: "Oncología",          descripcion: "Diagnóstico, tratamiento y seguimiento oncológico integral." },
  { id: 13, nombre: "Hematología",        descripcion: "Estudio y tratamiento de enfermedades de la sangre." },
  { id: 14, nombre: "Fisioterapia",       descripcion: "Rehabilitación física, deportiva y neurológica." },
  { id: 15, nombre: "Gastroenterología",  descripcion: "Tratamiento de patologías del aparato digestivo." },
  { id: 16, nombre: "Nefrología",         descripcion: "Cuidado del riñón y enfermedades asociadas." },
];

export const getEspecialidadesGenericas = () => ok(especialidadesGenericasMock);
