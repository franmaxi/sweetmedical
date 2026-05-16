import { Types } from "mongoose"
import { z } from "zod"

export const paginacionSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10)
})



export const objectIdSchema = z.string({ required_error: "El ID es requerido." })
    .refine(val => Types.ObjectId.isValid(val), {
        message: "Debe ser un ID válido de Mongoose."
})

export const paramsIdSchema = z.object({
    id: objectIdSchema
})

export const stringNoNuloSchema = z.string({
    required_error: "El texto es requerido.",
    invalid_type_error: "Debe ser un texto válido."
}).trim().min(1, "El texto no puede estar vacío.")

