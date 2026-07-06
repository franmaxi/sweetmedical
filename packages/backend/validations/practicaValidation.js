import { Types } from "mongoose"
import { z } from "zod"

//----- CONTROLLER Y SERVICE -----
const practicaBaseBodySchema = z.object({
    codigo: z.string({ required_error: "El código es requerido." })
        .trim().min(1, "El código no puede estar vacío."),
    nombre: z.string({ required_error: "El nombre es requerido." })
        .trim().min(1, "El nombre no puede estar vacío.")
});

export const practicaGenericaBodySchema = practicaBaseBodySchema.extend({
    emoji: z.string({
        required_error: "El emoji es requerido.",
        invalid_type_error: "El emoji debe ser un texto."
    }).emoji("Debe contener un emoji válido.")
}).strict("No se permiten campos adicionales en la solicitud.");

export const practicaBodySchema = practicaBaseBodySchema.extend({
    practicaGenericaId: z.string({
        required_error: "La práctica genérica es requerida."
    }).refine(val => Types.ObjectId.isValid(val), {
        message: "La práctica genérica debe ser un ID válido."
    }),
    duracionTurnoEnMins: z.number({ required_error: "La duración del turno es requerida." })
        .int("La duración debe ser un número entero.")
        .positive("La duración debe ser un número mayor a 0.")
        .multipleOf(15, "La duración del turno debe ser múltiplo de 15 minutos"),
    costo: z.number({ required_error: "El costo es requerido." })
        .positive("El costo debe ser un número mayor a 0."),
}).strict("No se permiten campos adicionales en la solicitud.");

//-----DOMINIO-----
// Schema base de dominio (sin emoji, usado por la hija Practica)
export const practicaBaseDomainSchema = z.object({
    _id: z.any().optional(),
    nombre: z.string({
        required_error: "El nombre de la práctica debe ser un texto no vacío.",
        invalid_type_error: "El nombre de la práctica debe ser un texto válido."
    }).trim().min(1, "El nombre de la práctica no puede estar vacío."),
    codigo: z.string({
        required_error: "El código de la práctica debe ser un texto no vacío.",
        invalid_type_error: "El código de la práctica debe ser un texto válido."
    }).trim().min(1, "El código de la práctica no puede estar vacío."),
});

// Schema de la genérica: agrega emoji requerido
export const practicaGenericaDomainSchema = practicaBaseDomainSchema.extend({
    emoji: z.string({
        required_error: "El emoji es requerido.",
        invalid_type_error: "El emoji debe ser un texto."
    }).emoji("Debe contener un emoji válido.")
})

// La practica hija extiende del base (sin emoji, ya que el emoji proviene de la genérica)
export const practicaDomainSchema = practicaBaseDomainSchema.extend({
    _id: z.any().optional(),
    practicaGenerica: z.any().refine(val => Types.ObjectId.isValid(val), {
        message: "La práctica genérica debe ser un ID válido."
    }),
    duracionTurnoEnMins: z.number({
        required_error: "La duración del turno es requerida.",
        invalid_type_error: "La duración del turno debe ser un número."
    })
    .positive("La duración del turno debe ser un número positivo.")
    .multipleOf(15, "La duración del turno debe ser múltiplo de 15 minutos"),
    costo: z.number({
        required_error: "El costo es requerido.",
        invalid_type_error: "El costo debe ser un número."
    }).positive("El costo debe ser un número positivo.")
})

// Schema para ACTUALIZAR una práctica hija (solo campos modificables, nombre/codigo son inmutables)
export const practicaUpdateBodySchema = z.object({
    duracionTurnoEnMins: z.number({
        invalid_type_error: "La duración del turno debe ser un número."
    }).int().positive().multipleOf(15).optional(),
    costo: z.number({
        invalid_type_error: "El costo debe ser un número."
    }).positive().optional()
});



