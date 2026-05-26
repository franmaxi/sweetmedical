import { Types } from "mongoose"
import { z } from "zod"

//----- CONTROLLER Y SERVICE -----
export const especialidadGenericaBodySchema = z.object({
    nombre: z.string({
        required_error: "El campo nombre es requerido.",
        invalid_type_error: "El campo nombre debe ser un texto."
    }).trim().min(1, "El campo nombre no puede estar vacío.")
}).strict("No se permiten campos adicionales en la solicitud.");

//La especialidad hereda de la generica
export const especialidadBodySchema = especialidadGenericaBodySchema.extend({
    duracionTurnoEnMins: z.number({
        required_error: "El campo duracionTurnoEnMins es requerido.",
        invalid_type_error: "El campo duracionTurnoEnMins debe ser un número."
    }).int("La duración debe ser un número entero.").positive("La duración debe ser un número mayor a 0."),
    costo: z.number({
        required_error: "El campo costo es requerido.",
        invalid_type_error: "El campo costo debe ser un número."
    }).nonnegative("El costo no puede ser negativo.")
}).strict("No se permiten campos adicionales en la solicitud.");


//-----DOMINIO-----
export const especialidadGenericaDomainSchema = z.object({
    _id: z.any().optional(),
    nombre: z.string({
        required_error: "El nombre de la especialidad debe ser un string no vacío",
        invalid_type_error: "El nombre de la especialidad debe ser un string no vacío"
    }).trim().min(1, "El nombre de la especialidad debe ser un string no vacío")
});

//La especialidad hereda de la generica
export const especialidadDomainSchema = especialidadGenericaDomainSchema.extend({
    _id: z.any().optional(),
    // Cambiado a un string con Regex: más seguro, tipado y sin 'z.any()'
    especialidadGenerica: z.any().refine(val => Types.ObjectId.isValid(val), {
        message: "El parámetro especialidadGenerica id debe ser un ID válido de Mongoose."
    }),

    duracionTurnoEnMins: z.number({
        required_error: "La duración del turno en minutos debe ser un número positivo",
        invalid_type_error: "La duración del turno en minutos debe ser un número positivo"
    }).positive("La duración del turno en minutos debe ser un número positivo"),

    costo: z.number({
        required_error: "El costo de la consulta debe ser un número no negativo",
        invalid_type_error: "El costo de la consulta debe ser un número no negativo"
    }).nonnegative("El costo de la consulta debe ser un número no negativo")
});



