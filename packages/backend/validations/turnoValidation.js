import { z } from "zod";
import { EstadoTurno } from "../domain/Enumerados/EstadoTurno.js";
import { objectIdSchema, crearIdSchema, crearFechaSchema } from "./commonValidations.js";
import { medicoDomainSchema, disponibilidadDomainSchema } from "./medicoValidation.js";
import { sedeDomainSchema } from "./sedeValidation.js";
import { practicaDomainSchema } from "./practicaValidation.js";
import { especialidadDomainSchema } from "./especialidadValidation.js";


// ─── Controller-level schemas (input HTTP) ───

// POST /turnos — crear turno
export const turnoBodySchema = z.object({
    medicoId: crearIdSchema("médico"),
    fechaHora: crearFechaSchema(true, "La fecha y hora del turno deben ser válidas."),
    sedeId: crearIdSchema("sede"),
    especialidadId: crearIdSchema("especialidad").optional().nullable(),
    practicaId: crearIdSchema("práctica").optional().nullable(),
    costo: z.number().nonnegative("El costo no puede ser negativo.").optional()
}).strict("No se permiten campos adicionales en la solicitud.");

// PATCH /turnos/:id/ (reservar, cancelar, realizar)
export const estadosBodySchema = z.object({
    estado: z.string().optional(),
    pacienteId: crearIdSchema("paciente").optional().nullable().default(null),
    medicoId: crearIdSchema("médico").optional().nullable().default(null),
    especialidadId: crearIdSchema("especialidad").optional().nullable().default(null),
    practicaId: crearIdSchema("práctica").optional().nullable().default(null),
    usuarioId: crearIdSchema("usuario").optional().nullable().default(null),
    motivo: z.string().trim().nullable().default(null),
}).strict("No se permiten campos adicionales en la solicitud.");

// PATCH /turnos/:id/solicitar-cambio-fecha
export const solicitudFechaCambioBodySchema = z.object({
    fechaPropuesta: crearFechaSchema(true, "La fecha y hora propuestas deben ser válidas."),
    motivo: z
        .string({ required_error: "El motivo es obligatorio." })
        .min(5, "El motivo debe tener al menos 5 caracteres.")
        .trim(),
}).strict("No se permiten campos adicionales en la solicitud.");

//ESTO SIRVE UNICAMENTE PARA LA CLASE SOLICITUDCAMBIO.JS
export const solicitudCambioSchema = z.object({
  usuario: crearIdSchema("usuario"),
  
  turnoNuevo: crearIdSchema("nuevo turno"),
    
  motivo: z
    .string({ required_error: "El motivo es obligatorio." })
    .min(5, "El motivo debe tener al menos 5 caracteres.")
    .trim(),
});

// PATCH /turnos/:id/responder-cambio-fecha
export const responderReserva = z.object({
    motivo: z
        .string()
        .min(5, "El motivo debe tener al menos 5 caracteres.")
        .trim()
        .optional()
        .nullable(),
    reservaAceptada: z.boolean({
        required_error: "La respuesta de la reserva es requerida.",
        invalid_type_error: "La aceptación de la reserva debe ser sí o no."
    })
}).strict("No se permiten campos adicionales en la solicitud.")
  .refine(data => data.reservaAceptada === true || (typeof data.motivo === 'string' && data.motivo.trim().length >= 5), {
      message: "El motivo de rechazo es obligatorio y debe tener al menos 5 caracteres.",
      path: ["motivo"]
  });

// PATCH /turnos/:id/responder-cambio-fecha
export const responderCambioDeFecha = z.object({
    cambioAceptado: z.boolean({
        required_error: "La respuesta del cambio de fecha es requerida.",
        invalid_type_error: "La aceptación del cambio debe ser sí o no."
    })
}).strict("No se permiten campos adicionales en la solicitud.");

// Filtros de query para GET /turnos (sin paginación, se combinan con turnoQuerySchema)
export const turnoFiltrosSchema = z.object({
    medicoId: crearIdSchema("médico").optional(),
    estado: z.preprocess(
        (val) => (typeof val === 'string' && val.includes(',') ? val.split(',') : val),
        z.union([
            z.enum(Object.values(EstadoTurno)),
            z.array(z.enum(Object.values(EstadoTurno)))
        ])
    ).optional(),
    especialidadId: crearIdSchema("especialidad").optional(),
    practicaId: crearIdSchema("práctica").optional(),
    sedeId: crearIdSchema("sede").optional(),
    desde: crearFechaSchema(false, "La fecha de inicio (desde) debe ser una fecha válida.").optional(),
    hasta: crearFechaSchema(false, "La fecha de finalización (hasta) debe ser una fecha válida.").optional(),
    filtrarPaciente: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional() // si esta en true se traen los turnos que tengan al paciente registrado
});

// Query completa: paginación + pacienteId + filtros + ordenamiento
export const turnoQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().positive().default(10),
    pacienteId: crearIdSchema("paciente").optional(),
    ordenarPor: z.string().optional().refine(val => val === undefined || val === 'fechaHora' || val === 'costoFinal', {
        message: "El criterio de ordenamiento debe ser por fecha y hora o costo final."
    }),
    ordenDireccion: z.string().optional().refine(val => val === undefined || val === 'asc' || val === 'desc', {
        message: "La dirección de ordenamiento debe ser ascendente (asc) o descendente (desc)."
    }).default('asc'),
}).merge(turnoFiltrosSchema);


// ─── Domain-level schemas (constructor validation) ───

// Turno domain — valida los parámetros del constructor
const practicaElemento = z.union([objectIdSchema, practicaDomainSchema]);
const especialidadElemento = z.union([objectIdSchema, especialidadDomainSchema]);

export const turnoDomainSchema = z.object({
    medico: z.union([objectIdSchema, medicoDomainSchema]),
    fechaHora: crearFechaSchema(true, "La fecha y hora del turno deben ser válidas (formato ISO o timestamp)."),
    sede: z.union([objectIdSchema, sedeDomainSchema]),
    practica: z.array(practicaElemento).optional().default([]),
    especialidad: z.array(especialidadElemento).optional().default([]),
    disponibilidad: z.union([objectIdSchema, disponibilidadDomainSchema]).nullable().optional().default(null),
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

// generar batch forzado

export const batchForzadoQuerySchema = z.object({
    medicoId: crearIdSchema("médico").optional().nullable().default(null),
    fechaInicio: crearFechaSchema(false, "La fecha de inicio debe ser una fecha válida.").optional(),
    fechaFin: crearFechaSchema(false, "La fecha de finalización debe ser una fecha válida.").optional(),
});
