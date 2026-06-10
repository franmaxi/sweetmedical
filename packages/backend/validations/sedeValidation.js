import { z } from "zod";

export const sedeDomainSchema = z.object({
    _id: z.any().optional(),
    nombre: z.string({
        required_error: "El nombre de la sede es requerido.",
        invalid_type_error: "El nombre de la sede debe ser un texto."
    }).trim().min(1, "El nombre de la sede no puede estar vacío."),
    direccion: z.string({
        required_error: "La dirección de la sede es requerida.",
        invalid_type_error: "La dirección de la sede debe ser un texto."
    }).trim().min(1, "La dirección de la sede no puede estar vacía.")
});

export const sedeBodySchema = z.object({
    nombre: z.string({ required_error: "El campo codigo es requerido." })
             .trim().min(1, "El campo codigo no puede estar vacío."),
    direccion: z.string({ required_error: "El campo nombre es requerido." })
             .trim().min(1, "El campo nombre no puede estar vacío.")
}).strict("No se permiten campos adicionales en la solicitud.");