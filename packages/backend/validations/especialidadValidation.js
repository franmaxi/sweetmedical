import { Types } from "mongoose"
import { z } from "zod"

//----- CONTROLLER Y SERVICE -----
const especialidadBaseBodySchema = z.object({
    nombre: z.string({
        required_error: "El nombre es requerido.",
        invalid_type_error: "El nombre debe ser un texto."
    }).trim().min(1, "El nombre no puede estar vacío.")
});

export const especialidadGenericaBodySchema = especialidadBaseBodySchema.extend({
    emoji: z.string({
        required_error: "El emoji es requerido.",
        invalid_type_error: "El emoji debe ser un texto."
    }).emoji("Debe contener un emoji válido.")
}).strict("No se permiten campos adicionales en la solicitud.");

export const especialidadBodySchema = especialidadBaseBodySchema.extend({
    especialidadGenericaId: z.string({
        required_error: "La especialidad genérica es requerida."
    }).refine(val => Types.ObjectId.isValid(val), {
        message: "La especialidad genérica debe ser un ID válido."
    }),

    duracionTurnoEnMins: z.number({
        required_error: "La duración del turno es requerida.",
        invalid_type_error: "La duración del turno debe ser un número."
    }).int("La duración debe ser un número entero.")
      .positive("La duración debe ser un número mayor a 0.")
      .multipleOf(15, "La duración del turno debe ser múltiplo de 15 minutos"),
      
    costo: z.number({
        required_error: "El costo es requerido.",
        invalid_type_error: "El costo debe ser un número."
    }).nonnegative("El costo no puede ser negativo.")
}).strict("No se permiten campos adicionales en la solicitud.");


//-----DOMINIO-----
// Schema base de dominio (sin emoji, usado por la hija Especialidad)
export const especialidadBaseDomainSchema = z.object({
    _id: z.any().optional(),
    nombre: z.string({
        required_error: "El nombre de la especialidad debe ser un texto no vacío.",
        invalid_type_error: "El nombre de la especialidad debe ser un texto válido."
    }).trim().min(1, "El nombre de la especialidad no puede estar vacío."),
});

// Schema de la genérica: agrega emoji requerido
export const especialidadGenericaDomainSchema = especialidadBaseDomainSchema.extend({
    emoji: z.string({
        required_error: "El emoji es requerido.",
        invalid_type_error: "El emoji debe ser un texto."
    }).emoji("Debe contener un emoji válido.")
});

//La especialidad hija hereda del base (sin emoji, ya que el emoji proviene de la genérica)
export const especialidadDomainSchema = especialidadBaseDomainSchema.extend({
    _id: z.any().optional(),
    // Cambiado a un string con Regex: más seguro, tipado y sin 'z.any()'
    especialidadGenerica: z.any().refine(val => Types.ObjectId.isValid(val), {
        message: "El parámetro especialidadGenerica id debe ser un ID válido."
    }),

    duracionTurnoEnMins: z.number({
        required_error: "La duración del turno es requerida.",
        invalid_type_error: "La duración del turno debe ser un número."
    }).positive("La duración del turno debe ser un número positivo.")
    .multipleOf(15, "La duración del turno debe ser múltiplo de 15 minutos"),

    costo: z.number({
        required_error: "El costo es requerido.",
        invalid_type_error: "El costo debe ser un número."
    }).nonnegative("El costo no puede ser negativo.")
});

// Schema para ACTUALIZAR una especialidad hija (solo campos modificables, nombre/emoji son inmutables)
export const especialidadUpdateBodySchema = z.object({
    duracionTurnoEnMins: z.number({
        invalid_type_error: "La duración del turno debe ser un número."
    }).int().positive().multipleOf(15).optional(),
    costo: z.number({
        invalid_type_error: "El costo debe ser un número."
    }).nonnegative().optional()
});




