import { z } from "zod"

export const usuarioSchema = z.object({
    nombreUsuario: z.string({
        required_error: "El nombre de usuario es requerido.",
        invalid_type_error: "El nombre de usuario debe ser un texto."
    }).trim().min(1, "El nombre de usuario no puede estar vacío."),
    password: z.string({
        required_error: "La contraseña es requerida.",
        invalid_type_error: "La contraseña debe ser un texto."
    }).min(1, "La contraseña no puede estar vacía.")
}).strict()

export const usuarioDomainSchema = usuarioSchema.extend({
    TipoUsuario: z.string({
        required_error: "El tipo de usuario es requerido.",
        invalid_type_error: "El tipo de usuario debe ser un texto."
    }).trim().min(1, "El tipo de usuario no puede estar vacío.")
}).strict()


export const usuarioUpdateSchema = z.object({
    nombreUsuario: z.string({
        required_error: "El nombre de usuario es requerido.",
        invalid_type_error: "El nombre de usuario debe ser un texto."
    }).trim().min(1, "El nombre de usuario no puede estar vacío.").optional(),
    password: z.string({
        required_error: "La contraseña es requerida.",
        invalid_type_error: "La contraseña debe ser un texto."
    }).min(1, "La contraseña no puede estar vacía.").optional(),
    newPassword: z.string({
        required_error: "La nueva contraseña es requerida.",
        invalid_type_error: "La nueva contraseña debe ser un texto."
    }).min(1, "La nueva contraseña no puede estar vacía.").optional()
}).strict()