// Mock de GET /sedes, GET /sedes/:id, POST/PUT/DELETE.
// Modelo backend: packages/backend/domain/Sede.js
// Campos: { id, nombre, direccion }

import { ok } from "./_helpers.js";

export const sedesMock = [
  { id: 1, nombre: "Sede Centro", direccion: "Av. Corrientes 1234, CABA" },
  { id: 2, nombre: "Sede Norte",  direccion: "Av. Cabildo 2500, CABA" },
  { id: 3, nombre: "Sede Sur",    direccion: "Av. Mitre 1100, Avellaneda" },
  { id: 4, nombre: "Sede Oeste",  direccion: "Av. Rivadavia 11500, Liniers" },
];

export const getSedes = () => ok(sedesMock);
