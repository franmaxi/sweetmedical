import z from "zod";
import { objectIdSchema } from "./commonValidations.js";
import { NivelCobertura } from "../domain/Enumerados/NivelCobertura.js"

export const coberturaEspecialidadSchema = z.object({
    especialidadGenerica: objectIdSchema, // ID de la especialidad genérica
    nivel: z.string({ required_error: "El nivel de cobertura es requerido." }) // Ajusta a z.number() si tus niveles son numéricos
});

export const coberturaPracticaSchema = z.object({
    practicaGenerica: objectIdSchema, // ID de la práctica genérica
    nivel: z.string({ required_error: "El nivel de cobertura es requerido." }) // Ajusta a z.number() si tus niveles son numéricos
});

export const obraSocialDomainSchema = z.object({
    nombre: z.string({
        required_error: "El nombre es requerido.",
        invalid_type_error: "El nombre debe ser un texto."
    }).trim().min(1, "El nombre no puede estar vacío.")
})

export const planDomainSchema = z.object({
    nombre: z.string({
        required_error: "El nombre del plan es requerido.",
        invalid_type_error: "El nombre del plan debe ser un texto."
    }).trim().min(1, "El nombre del plan no puede estar vacío.")
})

export const planBodySchema = z.object({
    idObraSocial: objectIdSchema,
    nombre: z.string({ required_error: "El nombre de la obra social es requerido." })
        .min(2, "El nombre debe tener al menos 2 caracteres.")
        .trim(),
    coberturasEspecialidades: z.array(coberturaEspecialidadSchema)
        .nullable()
        .default([]),
    coberturasPracticas: z.array(coberturaPracticaSchema)
        .nullable()
        .default([])
})


// ---- DOMINIO: Schema para CoberturaEspecialidad ----
export const coberturaEspecialidadDomainSchema = z.object({
    especialidadGenerica: z.any({
        required_error: "La especialidad genérica es requerida."
    }),
    nivel: z.enum(Object.values(NivelCobertura), {
        required_error: "El nivel de cobertura es requerido.",
        message: `El nivel de cobertura debe ser uno de: ${Object.values(NivelCobertura).join(", ")}`
    }),
    pocentajeDescuento: z.coerce.number({
        required_error: "El porcentaje de descuento es requerido",
        invalid_type_error: "El porcentaje de descuento debe ser un número comprendido entre 0 y 1."
    }).gte(0).lte(1)
})

// ---- DOMINIO: Schema para CoberturaPractica ----
export const coberturaPracticaDomainSchema = z.object({
    practicaGenerica: z.any({
        required_error: "La práctica genérica es requerida."
    }),
    nivel: z.enum(Object.values(NivelCobertura), {
        required_error: "El nivel de cobertura es requerido.",
        message: `El nivel de cobertura debe ser uno de: ${Object.values(NivelCobertura).join(", ")}`
    }),
    pocentajeDescuento: z.coerce.number({
        required_error: "El porcentaje de descuento es requerido",
        invalid_type_error: "El porcentaje de descuento debe ser un número comprendido entre 0 y 1."
    }).gte(0).lte(1)
})
