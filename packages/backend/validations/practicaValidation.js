import { Types } from "mongoose"
import { z } from "zod"

//----- CONTROLLER Y SERVICE -----
export const practicaGenericaBodySchema = z.object({
    codigo: z.string({ required_error: "El campo codigo es requerido." })
        .trim().min(1, "El campo codigo no puede estar vacío."),
    nombre: z.string({ required_error: "El campo nombre es requerido." })
        .trim().min(1, "El campo nombre no puede estar vacío."),
    emoji: z.string({
        required_error: "El campo emoji es requerido.",
        invalid_type_error: "El campo emoji debe ser un texto."
    }).emoji("El campo debe contener un emoji válido.")
}).strict("No se permiten campos adicionales en la solicitud.");

//La practica hereda de la generica
export const practicaBodySchema = practicaGenericaBodySchema.extend({
    id: z.any().optional(),
    duracionTurnoEnMins: z.number({ required_error: "El campo duracionTurnoEnMins es requerido." })
        .int("La duración debe ser un número entero.")
        .positive("La duración debe ser un número mayor a 0.")
        .multipleOf(15, "La duración del turno debe ser múltiplo de 15 minutos"),
    costo: z.number({ required_error: "El campo costo es requerido." })
        .positive("El costo debe ser un número mayor a 0."),
}).strict("No se permiten campos adicionales en la solicitud.");


//-----DOMINIO-----

// Schema base de dominio (sin emoji, usado por la hija Practica)
export const practicaBaseDomainSchema = z.object({
    _id: z.any().optional(),
    nombre: z.string({
        required_error: "El nombre de la practica debe ser un string no vacío",
        invalid_type_error: "El nombre de la practica debe ser un string no vacío"
    }).trim().min(1, "El nombre de la practica debe ser un string no vacío"),
    codigo: z.string({
        required_error: "El codigo de la practica debe ser un string no vacío",
        invalid_type_error: "El codigo de la practica debe ser un string no vacío"
    }).trim().min(1, "El codigo de la practica debe ser un string no vacío"),
});

// Schema de la genérica: agrega emoji requerido
export const practicaGenericaDomainSchema = practicaBaseDomainSchema.extend({
    emoji: z.string({
        required_error: "El campo emoji es requerido.",
        invalid_type_error: "El campo emoji debe ser un texto."
    }).emoji("El campo debe contener un emoji válido.")
})

// La practica hija extiende del base (sin emoji, ya que el emoji proviene de la genérica)
export const practicaDomainSchema = practicaBaseDomainSchema.extend({
    _id: z.any().optional(),
    practicaGenerica: z.any().refine(val => Types.ObjectId.isValid(val), {
        message: "El parámetro id practicaGenerica debe ser un ID válido de Mongoose."
    }),
    duracionTurnoEnMins: z.number({
        required_error: "duración del turno en minutos debe ser un número positivo",
        invalid_type_error: "duración del turno en minutos debe ser un número positivo"
    })
    .positive("duración del turno en minutos debe ser un número positivo")
    .multipleOf(15, "La duración del turno debe ser múltiplo de 15 minutos"),
    costo: z.number({
        required_error: "costo de la práctica debe ser un número positivo",
        invalid_type_error: "costo de la práctica debe ser un número positivo"
    }).positive("costo de la práctica debe ser un número positivo")
})

// Schema para ACTUALIZAR una práctica hija (solo campos modificables, nombre/codigo son inmutables)
export const practicaUpdateBodySchema = z.object({
    duracionTurnoEnMins: z.number({
        invalid_type_error: "El campo duracionTurnoEnMins debe ser un número."
    }).int().positive().multipleOf(15).optional(),
    costo: z.number({
        invalid_type_error: "El campo costo debe ser un número."
    }).positive().optional()
});



