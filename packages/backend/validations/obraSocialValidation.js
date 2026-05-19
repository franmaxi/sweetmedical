import z from "zod";
import { objectIdSchema } from "./commonValidations.js";

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