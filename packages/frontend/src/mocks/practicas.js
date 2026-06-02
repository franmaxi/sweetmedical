// Mock de GET /practicas, GET /practicas/:id, POST/PUT/DELETE.
// Modelo backend: packages/backend/domain/Medico/Practica.js
// Campos: { id, codigo, nombre, duracionTurnoEnMins, costo }

import { ok } from "./_helpers.js";

export const practicasMock = [
  { id: 1, codigo: "ECG",   nombre: "Electrocardiograma",        duracionTurnoEnMins: 20, costo:  9500 },
  { id: 2, codigo: "ECO",   nombre: "Ecografía abdominal",       duracionTurnoEnMins: 30, costo: 14000 },
  { id: 3, codigo: "RX",    nombre: "Radiografía",               duracionTurnoEnMins: 15, costo:  7500 },
  { id: 4, codigo: "PAP",   nombre: "Papanicolaou",              duracionTurnoEnMins: 20, costo:  8500 },
  { id: 5, codigo: "LAB",   nombre: "Análisis de laboratorio",   duracionTurnoEnMins: 15, costo:  6000 },
  { id: 6, codigo: "OFT-F", nombre: "Fondo de ojo",              duracionTurnoEnMins: 20, costo: 10500 },
  { id: 7, codigo: "DERM",  nombre: "Dermatoscopía",             duracionTurnoEnMins: 25, costo: 11000 },
  { id: 8, codigo: "FISIO", nombre: "Sesión de kinesiología",    duracionTurnoEnMins: 45, costo:  8000 },
  { id: 9, codigo: "ODO-L", nombre: "Limpieza dental",           duracionTurnoEnMins: 40, costo:  9500 },
  { id: 10, codigo: "ENDO", nombre: "Endoscopía digestiva alta", duracionTurnoEnMins: 60, costo: 28000 },
];

export const getPracticas = () => ok(practicasMock);
