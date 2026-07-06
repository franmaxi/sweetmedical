import { Types } from "mongoose"
import { z } from "zod"

export const paginacionSchema = z.object({
    page: z.coerce.number().int().min(1, "La página debe ser mayor o igual a 1").default(1),
    limit: z.coerce.number().int().positive().default(10)
})

export const crearIdSchema = (recurso) => z.union([
    z.string(),
    z.instanceof(Types.ObjectId)
], { 
    required_error: `El campo es requerido.`,
    invalid_type_error: `El valor proporcionado no es válido.` 
})
.refine(val => Types.ObjectId.isValid(val), {
    message: `Debe seleccionar un/a ${recurso} válido/a.`
})
.transform(val => String(val));

export const objectIdSchema = crearIdSchema("identificador");

export const paramsIdSchema = z.object({
    id: objectIdSchema
});

export const crearFechaSchema = (requerido = false, mensajeError = "Debe ser una fecha válida.") => {
    return z.any().transform((val, ctx) => {
        if (val === undefined || val === null || val === '') {
            if (requerido) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "La fecha y hora son requeridas."
                });
                return z.NEVER;
            }
            return undefined;
        }
        const d = new Date(val);
        if (isNaN(d.getTime())) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: mensajeError
            });
            return z.NEVER;
        }
        return d;
    });
};

export const stringNoNuloSchema = z.string({
    required_error: "El texto es requerido.",
    invalid_type_error: "Debe ser un texto válido."
}).trim().min(1, "El texto no puede estar vacío.")

export const tokenSchema = z.object({
    userId: objectIdSchema,
    userRol: stringNoNuloSchema,
    userName: stringNoNuloSchema
})
// Si no es un string, o objectid debe fallar la validacion de ids