import { Types } from "mongoose"
import { z } from "zod"
import { NivelCobertura } from "../domain/Enumerados/NivelCobertura.js"

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
    obraSocialId: z.string({
        required_error: "La obra social es requerida.",
        invalid_type_error: "La obra social debe ser un texto."
    }).refine(val => Types.ObjectId.isValid(val), {
        message: "Debe ser un ID de obra social válido de Mongoose."
    }),
    planId: z.string({
        required_error: "El plan es requerido.",
        invalid_type_error: "El plan debe ser un texto."
    }).refine(val => Types.ObjectId.isValid(val), {
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
    obraSocial: z.any({
        required_error: "La obra social es requerida."
    }),
    plan: z.any({
        required_error: "El plan es requerido."
    })
})

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

// ---- DOMINIO: Schema para CoberturaEspecialidad ----
export const coberturaEspecialidadDomainSchema = z.object({
    especialidadGenerica: z.any({
        required_error: "La especialidad genérica es requerida."
    }),
    nivel: z.enum(Object.values(NivelCobertura), {
        required_error: "El nivel de cobertura es requerido.",
        message: `El nivel de cobertura debe ser uno de: ${Object.values(NivelCobertura).join(", ")}`
    })
})

// ---- DOMINIO: Schema para CoberturaPractica ----
export const coberturaPracticaDomainSchema = z.object({
    practicaGenerica: z.any({
        required_error: "La práctica genérica es requerida."
    }),
    nivel: z.enum(Object.values(NivelCobertura), {
        required_error: "El nivel de cobertura es requerido.",
        message: `El nivel de cobertura debe ser uno de: ${Object.values(NivelCobertura).join(", ")}`
    })
})

