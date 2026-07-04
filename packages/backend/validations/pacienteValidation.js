import { Types } from "mongoose"
import { z } from "zod"

//PACIENTE 
export const pacienteBodySchema = z.object({
    dni: z.coerce.number({
        required_error: "El DNI es requerido.",
        invalid_type_error: "El DNI debe ser un número válido."
    }).int("El DNI debe ser un número entero.").positive("El DNI debe ser un número mayor a 0."),
    nombre: z.string({
        required_error: "El nombre es requerido.",
        invalid_type_error: "El nombre debe ser un texto."
    }).trim().min(1, "El nombre no puede estar vacío."),
    obraSocialId: z.string().optional().nullable().refine(val => {
        if (!val) return true;
        return Types.ObjectId.isValid(val);
    }, {
        message: "Debe ser un ID de obra social válido de Mongoose."
    }),
    planId: z.string().optional().nullable().refine(val => {
        if (!val) return true;
        return Types.ObjectId.isValid(val);
    }, {
        message: "Debe ser un ID de plan válido de Mongoose."
    }),
    nombreUsuario: z.string({
        required_error: "El nombre de usuario es requerido.",
        invalid_type_error: "El nombre de usuario debe ser un texto."
    }).trim().min(1, "El nombre de usuario no puede estar vacío."),
    password: z.string({
        required_error: "La contraseña es requerida.",
        invalid_type_error: "La contraseña debe ser un texto."
    }).min(6, "La contraseña debe tener al menos 6 caracteres.")
}).strict("No se permiten campos adicionales en la solicitud.")

// Igual que pacienteBodySchema pero con todos los campos opcionales,
// para permitir actualizar solo los campos que el usuario efectivamente completó.
export const pacienteBodyUpdateSchema = z.object({
    dni: z.coerce.number({
        invalid_type_error: "El DNI debe ser un número válido."
    }).int("El DNI debe ser un número entero.").positive("El DNI debe ser un número mayor a 0.").optional(),
    nombre: z.string({
        invalid_type_error: "El nombre debe ser un texto."
    }).trim().min(1, "El nombre no puede estar vacío.").optional(),
    obraSocialId: z.string().optional().nullable().refine(val => {
        if (!val) return true;
        return Types.ObjectId.isValid(val);
    }, {
        message: "Debe ser un ID de obra social válido de Mongoose."
    }),
    planId: z.string().optional().nullable().refine(val => {
        if (!val) return true;
        return Types.ObjectId.isValid(val);
    }, {
        message: "Debe ser un ID de plan válido de Mongoose."
    }),
    nombreUsuario: z.string({
        invalid_type_error: "El nombre de usuario debe ser un texto."
    }).trim().min(1, "El nombre de usuario no puede estar vacío.").optional(),
    // Contraseña actual: se exige y se verifica antes de permitir el cambio.
    passwordActual: z.string({
        invalid_type_error: "La contraseña actual debe ser un texto."
    }).min(1, "La contraseña actual no puede estar vacía.").optional(),
    passwordNueva: z.string({
        invalid_type_error: "La nueva contraseña debe ser un texto."
    }).min(6, "La nueva contraseña debe tener al menos 6 caracteres.").optional()
}).strict("No se permiten campos adicionales en la solicitud.")

export const pacienteDomainSchema = z.object({
    usuario: z.any({
        required_error: "El usuario es requerido."
    }),
    dni: z.coerce.number({
        required_error: "El DNI es requerido.",
        invalid_type_error: "El DNI debe ser un número válido."
    }).int().positive("El DNI debe ser un número mayor a 0."),
    nombre: z.string({
        required_error: "El nombre es requerido.",
        invalid_type_error: "El nombre debe ser un texto."
    }).trim().min(1, "El nombre no puede estar vacío."),
    obraSocial: z.any().optional().nullable(),
    plan: z.any().optional().nullable()
})


