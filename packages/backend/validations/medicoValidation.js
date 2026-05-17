import { z } from "zod"
import { objectIdSchema } from "./commonValidations.js"

// MEDICO BODY CONTROLLER
export const medicoBodySchema = z.object({
    nombre: z.string({
        required_error: "El nombre es requerido.",
        invalid_type_error: "El nombre debe ser un texto."
    }).trim().min(1, "El nombre no puede estar vacío."),
    matricula: z.string({
        required_error: "La matrícula es requerida.",
        invalid_type_error: "La matrícula debe ser un texto."
    }).trim().min(1, "La matrícula no puede estar vacía."),
    nombreUsuario: z.string({
        required_error: "El nombre de usuario es requerido.",
        invalid_type_error: "El nombre de usuario debe ser un texto."
    }).trim().min(1, "El nombre de usuario no puede estar vacío."),
    password: z.string({
        required_error: "La contraseña es requerida.",
        invalid_type_error: "La contraseña debe ser un texto."
    }).min(6, "La contraseña debe tener al menos 6 caracteres.")
}).strict("No se permiten campos adicionales en la solicitud.")

export const medicoBodyUpdateSchema = z.object({
    nombre: z.string({
        required_error: "El nombre es requerido.",
        invalid_type_error: "El nombre debe ser un texto."
    }).trim().min(1, "El nombre no puede estar vacío."),
    matricula: z.string({
        required_error: "La matrícula es requerida.",
        invalid_type_error: "La matrícula debe ser un texto."
    }).trim().min(1, "La matrícula no puede estar vacía."),
    nombreUsuario: z.string({
        required_error: "El nombre de usuario es requerido.",
        invalid_type_error: "El nombre de usuario debe ser un texto."
    }).trim().min(1, "El nombre de usuario no puede estar vacío."),
    password: z.string({
        required_error: "La contraseña es requerida.",
        invalid_type_error: "La contraseña debe ser un texto."
    }).min(6, "La contraseña debe tener al menos 6 caracteres."),
    especialidades: z.array(objectIdSchema, {
        invalid_type_error: "especialidades debe ser una lista de IDs de Mongoose."
    }).default([]),
    practicas: z.array(objectIdSchema, {
        invalid_type_error: "practicas debe ser una lista de IDs de Mongoose."
    }).default([]),
    sedes: z.array(objectIdSchema, {
        invalid_type_error: "sedes debe ser una lista de IDs de Mongoose."
    }).default([]),
    disponibilidades: z.array(z.any()).default([])
}).strict("No se permiten campos adicionales en la solicitud.")

export const disponibilidadBodySchema = z.object({
    diaSemana: z.coerce.number({
        required_error: "El día de la semana es requerido.",
        invalid_type_error: "El día de la semana debe ser un número."
    }).int().min(0, "El día de la semana debe ser entre 0 y 6").max(6, "El día de la semana debe ser entre 0 y 6"),
    horaDesde: z.string({
        required_error: "La horaDesde es requerida.",
        invalid_type_error: "La horaDesde debe ser un texto."
    }).regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "La horaDesde debe tener el formato HH:mm (ej: 08:30)"),
    horaHasta: z.string({
        required_error: "La horaHasta es requerida.",
        invalid_type_error: "La horaHasta debe ser un texto."
    }).regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "La horaHasta debe tener el formato HH:mm (ej: 17:00)"),
    sede: z.any({
        required_error: "La sede es requerida."
    }),
    especialidades: z.array(objectIdSchema).optional().default([]),
    practicas: z.array(objectIdSchema).optional().default([])
}).refine(data => {
    const [hDesde, mDesde] = data.horaDesde.split(':').map(Number);
    const [hHasta, mHasta] = data.horaHasta.split(':').map(Number);
    return (hDesde * 60 + mDesde) < (hHasta * 60 + mHasta);
}, {
    message: "La hora de inicio debe ser menor que la hora de fin",
    path: ["horaHasta"]
})

export const servicioBodySchema = z.object({
    especialidad: z.any().optional().nullable(),
    practica: z.any().optional().nullable()
}).refine(data => data.especialidad != null || data.practica != null, {
    message: "Debe proporcionar especialidad o practica"
})

// MEDICO DOMAIN
export const medicoDomainSchema = z.object({
    usuario: z.any({
        required_error: "El usuario es requerido."
    }),
    matricula: z.string({
        required_error: "La matrícula es requerida.",
        invalid_type_error: "La matrícula debe ser un texto."
    }).trim().min(1, "La matrícula no puede estar vacía."),
    nombre: z.string({
        required_error: "El nombre es requerido.",
        invalid_type_error: "El nombre debe ser un texto."
    }).trim().min(1, "El nombre no puede estar vacío.")
})

export const disponibilidadDomainSchema = z.object({
    diaSemana: z.coerce.number({
        required_error: "El día de la semana es requerido.",
        invalid_type_error: "El día de la semana debe ser un número."
    }).int().min(0, "El día de la semana debe ser entre 0 y 6").max(6, "El día de la semana debe ser entre 0 y 6"),
    horaDesde: z.string({
        required_error: "La horaDesde es requerida.",
        invalid_type_error: "La horaDesde debe ser un texto."
    }).regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "La horaDesde debe tener el formato HH:mm"),
    horaHasta: z.string({
        required_error: "La horaHasta es requerida.",
        invalid_type_error: "La horaHasta debe ser un texto."
    }).regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "La horaHasta debe tener el formato HH:mm"),
    sede: z.any({
        required_error: "La sede es requerida."
    })
}).refine(data => {
    const [hDesde, mDesde] = data.horaDesde.split(':').map(Number);
    const [hHasta, mHasta] = data.horaHasta.split(':').map(Number);
    return (hDesde * 60 + mDesde) < (hHasta * 60 + mHasta);
}, {
    message: "La hora de inicio debe ser menor que la hora de fin",
    path: ["horaHasta"]
})
