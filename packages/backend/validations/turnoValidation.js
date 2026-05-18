import { z } from "zod";
import { Types } from "mongoose";
import { objectId } from "./commonValidations.js";
import { EstadoTurno } from "../domain/Enumerados/EstadoTurno.js";

// Helper reutilizable para ObjectId
const objectId = z.string().refine(val => Types.ObjectId.isValid(val), {
    message: "Debe ser un ID válido de Mongoose."
});

// ─── Controller-level schemas (input HTTP) ───

// POST /turnos — crear turno
export const turnoBodySchema = z.object({
    medicoId: objectId,
    fechaHora: z.coerce.date({
        required_error: "La fecha/hora es requerida.",
        invalid_type_error: "La fecha/hora debe ser una fecha válida."
    }),
    sedeId: objectId,
    especialidadId: objectId.optional().nullable(),
    practicaId: objectId.optional().nullable(),
    costo: z.number().nonnegative("El costo no puede ser negativo.").optional()
}).strict("No se permiten campos adicionales en la solicitud.");

// PATCH /turnos/:id/ (reservar, cancelar, realizar)
export const estadosBodySchema = z.object({
    pacienteId: objectId.optional().nullable().default(null),
    medicoId: objectId.optional().nullable().default(null),
    especialidadId: objectId.optional().nullable().default(null),
    practicaId: objectId.optional().nullable().default(null),
    usuario: objectId.optional().nullable().default(null),
    motivo: z.string().nullable().trim().default(null),
}).strict("No se permiten campos adicionales en la solicitud.");

// PATCH /turnos/:id/solicitar-cambio-fecha
export const solicitudFechaCambioBodySchema = z.object({
    usuarioId: objectId({
        required_error: "El campo usuarioId es requerido.",
        invalid_type_error: "El campo usuarioId debe ser un identificador válido."
    }),
    fechaPropuesta: z.coerce.date({
        required_error: "La fecha y hora propuesta son requeridas.",
        invalid_type_error: "Debe ser una fecha y hora válida (formato ISO 8601 o timestamp)."
    }),
    motivo: z
        .string({ required_error: "El motivo es obligatorio." })
        .min(5, "El motivo debe tener al menos 5 caracteres.")
        .trim(),
}).strict("No se permiten campos adicionales en la solicitud.");

//ESTO SIRVE UNICAMENTE PARA LA CLASE SOLICITUDCAMBIO.JS
export const solicitudCambioSchema = z.object({
  usuario: z.instanceof(Usuario, {
    message: "El usuario debe ser una instancia válida de la clase Usuario."
  }),
  
  turnoNuevo: z.instanceof(Turno, {
    message: "El turno nuevo debe ser una instancia válida de la clase Turno."
  }),
    
  motivo: z
    .string({ required_error: "El motivo es obligatorio." })
    .min(5, "El motivo debe tener al menos 5 caracteres.")
    .trim(),
});


// PATCH /turnos/:id/responder-cambio-fecha
export const responderCambioDeFecha = z.object({
    usuarioId: objectId({
        required_error: "El campo usuarioId es requerido.",
        invalid_type_error: "El campo usuarioId debe ser un identificador válido."
    }),
    cambioAceptado: z.boolean({
        required_error: "El campo cambioAceptado es requerido.",
        invalid_type_error: "El campo cambioAceptado debe ser true o false."
    })
}).strict("No se permiten campos adicionales en la solicitud.");



// Filtros de query para GET /turnos (sin paginación, se combinan con turnoQuerySchema)
export const turnoFiltrosSchema = z.object({
    medicoId: objectId.optional(),
    estado: z.enum(Object.values(EstadoTurno), {
        invalid_type_error: "El estado no es válido."
    }).optional(),
    especialidadId: objectId.optional(),
    practicaId: objectId.optional(),
    sedeId: objectId.optional(),
    desde: z.coerce.date().optional(),
    hasta: z.coerce.date().optional(),
});

// Query completa: paginación + pacienteId + filtros
export const turnoQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().positive().default(10),
    pacienteId: objectId.optional(),
}).merge(turnoFiltrosSchema);


// ─── Domain-level schemas (constructor validation) ───

// Turno domain — valida los parámetros del constructor
export const turnoDomainSchema = z.object({
    medico: objectId({
        required_error: "El médico es requerido.",
        invalid_type_error: "El médico debe ser un identificador válido."
    }),
    fechaHora: z.coerce.date({
        required_error: "La fecha/hora es requerida.",
        invalid_type_error: "La fecha/hora debe ser una fecha válida (formato ISO o timestamp)."
    }),

    
    sede: objectId({
        required_error: "La sede es requerida.",
        invalid_type_error: "La sede debe ser un identificador válido."
    }),

    practica: objectId().nullable().optional().default(null),
    especialidad: objectId().nullable().optional().default(null),
    disponibilidad: objectId().nullable().optional().default(null),
}).strict("No se permiten campos adicionales en el turno.");

// CambioEstadoTurno domain — valida parámetros del constructor
export const cambioEstadoDomainSchema = z.object({
    estado: z.enum(Object.values(EstadoTurno), {
        required_error: "El estado es requerido.",
        invalid_type_error: "El estado no es válido."
    }),
    turno: z.any().refine(val => val != null, { message: "El turno es requerido." }),
    usuario: z.any().refine(val => val != null, { message: "El usuario es requerido." }),
    motivo: z.string().trim().optional().default("Sin motivo"),
});
