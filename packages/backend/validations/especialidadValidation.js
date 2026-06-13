import { Types } from "mongoose"
import { z } from "zod"

//----- CONTROLLER Y SERVICE -----
const especialidadBaseBodySchema = z.object({
    nombre: z.string({
        required_error: "El campo nombre es requerido.",
        invalid_type_error: "El campo nombre debe ser un texto."
    }).trim().min(1, "El campo nombre no puede estar vacío.")
});

export const especialidadGenericaBodySchema = especialidadBaseBodySchema.extend({
    emoji: z.string({
        required_error: "El campo emoji es requerido.",
        invalid_type_error: "El campo emoji debe ser un texto."
    }).emoji("El campo debe contener un emoji válido.")
}).strict("No se permiten campos adicionales en la solicitud.");

export const especialidadBodySchema = especialidadBaseBodySchema.extend({
    especialidadGenericaId: z.string({
        required_error: "El ID de la especialidad genérica es requerido."
    }).refine(val => Types.ObjectId.isValid(val), {
        message: "El especialidadGenericaId debe ser un ID válido de Mongoose."
    }),

    duracionTurnoEnMins: z.number({
        required_error: "El campo duracionTurnoEnMins es requerido.",
        invalid_type_error: "El campo duracionTurnoEnMins debe ser un número."
    }).int("La duración debe ser un número entero.")
      .positive("La duración debe ser un número mayor a 0.")
      .multipleOf(15, "La duración del turno debe ser múltiplo de 15 minutos"),
      
    costo: z.number({
        required_error: "El campo costo es requerido.",
        invalid_type_error: "El campo costo debe ser un número."
    }).nonnegative("El costo no puede ser negativo.")
}).strict("No se permiten campos adicionales en la solicitud.");


//-----DOMINIO-----
// Schema base de dominio (sin emoji, usado por la hija Especialidad)
export const especialidadBaseDomainSchema = z.object({
    _id: z.any().optional(),
    nombre: z.string({
        required_error: "El nombre de la especialidad debe ser un string no vacío",
        invalid_type_error: "El nombre de la especialidad debe ser un string no vacío"
    }).trim().min(1, "El nombre de la especialidad debe ser un string no vacío"),
});

// Schema de la genérica: agrega emoji requerido
export const especialidadGenericaDomainSchema = especialidadBaseDomainSchema.extend({
    emoji: z.string({
        required_error: "El campo emoji es requerido.",
        invalid_type_error: "El campo emoji debe ser un texto."
    }).emoji("El campo debe contener un emoji válido.")
});

//La especialidad hija hereda del base (sin emoji, ya que el emoji proviene de la genérica)
export const especialidadDomainSchema = especialidadBaseDomainSchema.extend({
    _id: z.any().optional(),
    // Cambiado a un string con Regex: más seguro, tipado y sin 'z.any()'
    especialidadGenerica: z.any().refine(val => Types.ObjectId.isValid(val), {
        message: "El parámetro especialidadGenerica id debe ser un ID válido de Mongoose."
    }),

    duracionTurnoEnMins: z.number({
        required_error: "La duración del turno en minutos debe ser un número positivo",
        invalid_type_error: "La duración del turno en minutos debe ser un número positivo"
    }).positive("La duración del turno en minutos debe ser un número positivo")
    .multipleOf(15, "La duración del turno debe ser múltiplo de 15 minutos"),

    costo: z.number({
        required_error: "El costo de la consulta debe ser un número no negativo",
        invalid_type_error: "El costo de la consulta debe ser un número no negativo"
    }).nonnegative("El costo de la consulta debe ser un número no negativo")
});

// Schema para ACTUALIZAR una especialidad hija (solo campos modificables, nombre/emoji son inmutables)
export const especialidadUpdateBodySchema = z.object({
    duracionTurnoEnMins: z.number({
        invalid_type_error: "El campo duracionTurnoEnMins debe ser un número."
    }).int().positive().multipleOf(15).optional(),
    costo: z.number({
        invalid_type_error: "El campo costo debe ser un número."
    }).nonnegative().optional()
});




