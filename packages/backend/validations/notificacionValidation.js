import { Types } from "mongoose"
import { z } from "zod"

export const notificacionQuerySchema = z.object({
    usuarioId: z.string({
        invalid_type_error: "El campo usuarioId debe ser un texto."
    }).refine(val => Types.ObjectId.isValid(val), {
        message: "Debe ser un ID de usuario válido."
    }).optional(),
    usuario: z.string({
        invalid_type_error: "El campo usuario debe ser un texto."
    }).refine(val => Types.ObjectId.isValid(val), {
        message: "Debe ser un ID de usuario válido."
    }).optional(),
    leida: z.enum(["true", "false"], {
        errorMap: (issue, ctx) => {
            return { message: "El filtro 'leida' debe ser 'true' o 'false'." };
        }
    }).optional()
        .transform(val => val === "true" ? true : val === "false" ? false : undefined)
}).refine(data => data.usuarioId || data.usuario, {
    message: "El campo usuarioId (o usuario) es obligatorio.",
    path: ["usuarioId"]
}).transform(data => ({
    usuarioId: data.usuarioId || data.usuario,
    leida: data.leida
}))

export const marcarLeidaQuerySchema = z.object({
    usuarioId: z.string({
        invalid_type_error: "El parámetro usuarioId debe ser un texto."
    }).refine(val => Types.ObjectId.isValid(val), {
        message: "Debe ser un ID de usuario válido."
    }).optional(),
    usuario: z.string({
        invalid_type_error: "El parámetro usuario debe ser un texto."
    }).refine(val => Types.ObjectId.isValid(val), {
        message: "Debe ser un ID de usuario válido."
    }).optional()
}).refine(data => data.usuarioId || data.usuario, {
    message: "El parámetro usuarioId (o usuario) es obligatorio en la query.",
    path: ["usuarioId"]
}).transform(data => ({
    usuarioId: data.usuarioId || data.usuario
}))

export const notificacionDomainSchema = z.object({
    destinatario: z.any({
        required_error: "El destinatario es requerido."
    }),
    remitente: z.any().nullable().optional(),
    mensaje: z.string({
        required_error: "El mensaje es requerido.",
        invalid_type_error: "El mensaje debe ser un texto."
    }).trim().min(1, "El mensaje no puede estar vacío.")
})
