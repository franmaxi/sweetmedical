# Seguimiento Evaluación Final

## Flujos Principales

- [/] **Flujo 1: Búsqueda de Turnos y Visualización de Resultados**
  - [x] Autenticación como PACIENTE y acceso a la sección.
  - [x] Filtros funcionales (Especialidad, Sede, Rango de fechas, Ordenar por).
  - [x] Backend: Consulta, paginación, ordenamiento.
  - [x] Backend: Cálculo de cobertura y costo según plan/obra social del paciente.
  - [x] Frontend: Mostrar nombre, especialidad, fecha, hora, sede, nivel de cobertura y costo estimado.
  - [ ] Funcionalidad de preselección de múltiples turnos (módulo tipo carrito).
  - [ ] Eliminación de turnos preseleccionados.

- [ ] **Flujo 2: Reserva de Turno y Notificaciones**
  - [x] Botón "Reservar" en un turno.
  - [x] Validar que el turno siga DISPONIBLE y pasar a RESERVADO.
  - [x] Calcular costo final y actualizar turno.
  - [ ] Generar notificación al médico (`FactoryNotificacion`).
  - [x] Feedback de éxito en frontend al paciente.
  - [ ] Panel del MÉDICO: visualización de nueva notificación.
  - [ ] Acción del MÉDICO: aceptar turno, cambiar a CONFIRMADO y notificar al paciente.
  - [x] Visualización del turno en historial del paciente.

- [ ] **Flujo 3: Cancelación de Turno y Generación de Notificación**
  - [x] Sección "Mis turnos" para el paciente.
  - [x] Opción de "Cancelar turno".
  - [ ] Backend: Validar que falte al menos 1 hora para el turno.
  - [x] Frontend: Solicitar motivo de cancelación.
  - [x] Backend: Cambiar estado a CANCELADO, registrar historial (motivo y usuario).
  - [ ] Backend: Generar notificación al médico (`FactoryNotificacion`).
  - [x] Frontend: Mensaje de éxito de cancelación.
  - [ ] Panel del MÉDICO: ver notificación de cancelación.
  - [ ] Marcar notificación como leída.

---

## Casos Borde

- [x] **Caso 1: Reserva concurrente del mismo turno**
  - [x] El sistema debe rechazar la segunda reserva si dos pacientes intentan reservar el mismo turno al mismo tiempo.

- [x] **Caso 2: Paciente sin obra social ni plan definido**
  - [x] Si el paciente no tiene plan (o el plan no cubre la práctica), el sistema lo muestra como "No cubierto" con costo completo.
  - [x] La reserva debe poder completarse sin error, asumiendo la falta de cobertura como válida.

- [x] **Caso 3: Cancelación fuera del plazo permitido**
  - [x] Si falta menos de 1 hora, el sistema rechaza la cancelación con un mensaje descriptivo y no envía notificaciones.

- [ ] **Caso 4: Modificación de disponibilidad con turnos ya reservados**
  - [ ] Al modificar disponibilidad horaria, los turnos RESERVADOS futuros se mantienen.
  - [ ] Los turnos DISPONIBLES se ajustan o eliminan.
  - [ ] Los turnos pasados no se alteran.

- [ ] **Caso 5: Marcar como realizado un turno en estado incorrecto**
  - [ ] El backend debe rechazar si un médico intenta marcar como REALIZADO un turno que está en estado CANCELADO o DISPONIBLE.

- [x] **Caso 6: Búsqueda sin resultados por combinación de filtros muy restrictiva**
  - [x] El sistema maneja búsquedas vacías devolviendo un componente "Empty" amigable, sin crashear.
