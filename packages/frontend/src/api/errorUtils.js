import React from "react";

/**
 * Extrae el mensaje de error más descriptivo posible de un error de Axios
 * y lo devuelve como JSX listo para pasarle a `message.error(...)` de Ant Design.
 *
 * @param {unknown} err      - El error capturado en un catch.
 * @param {string}  fallback - Texto de fallback si no se puede extraer nada.
 * @returns {React.ReactNode} Nodo listo para mostrar.
 */
export function extraerMensajeError(err, fallback = "Ocurrió un error inesperado") {
  if (!err) return fallback;

  // Respuesta HTTP del servidor (Axios guarda la respuesta en err.response)
  const data = err?.response?.data;
  if (data) {
    let raw = "";
    if (typeof data === "string" && data.length > 0)                      raw = data;
    else if (typeof data.message === "string" && data.message.length > 0) raw = data.message;
    else if (typeof data.error   === "string" && data.error.length   > 0) raw = data.error;
    else if (typeof data.mensaje === "string" && data.mensaje.length > 0) raw = data.mensaje;

    if (raw) return formatearMensaje(raw);
  }

  // Error de red (sin respuesta del servidor)
  if (err?.message) return formatearMensaje(err.message);

  return fallback;
}

/**
 * Si el mensaje del backend contiene múltiples errores separados por "; "
 * (formato del errorHandler de Zod), los devuelve como una lista con bullets en JSX.
 * De lo contrario devuelve el mensaje como string simple.
 *
 * Entrada:  "Error de validación: medicoId: Debe ser un ID válido.; sedeId: ..."
 * Salida:   <div>Errores de validación:<br/>· medicoId: ...<br/>· sedeId: ...</div>
 *
 * @param {string} msg
 * @returns {React.ReactNode | string}
 */
function formatearMensaje(msg) {
  const PREFIJO = "Error de validación: ";
  if (!msg.startsWith(PREFIJO)) return msg;

  const cuerpo = msg.slice(PREFIJO.length);
  const partes = cuerpo.split("; ").map((p) => p.trim()).filter(Boolean);

  if (partes.length <= 1) return msg;

  return (
    <div style={{ textAlign: "left" }}>
      <strong>Errores de validación:</strong>
      <ul style={{ margin: "4px 0 0 0", paddingLeft: 18 }}>
        {partes.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </div>
  );
}
