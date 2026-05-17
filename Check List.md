# ✅ Checklist - Entrega 2: Exposición de APIs + Persistencia

# 🩺 Gestión de Turnos

## Disponibilidad de Médicos
- [x] Endpoint para **crear** disponibilidad médica ✅ 2026-05-16
- [x] Endpoint para **modificar** disponibilidad médica ✅ 2026-05-16
- [x] Endpoint para **consultar** disponibilidad médica ✅ 2026-05-16
- [x] Generación automática de turnos DISPONIBLES ✅ 2026-05-15

## Pacientes
- [x] **Reservar** turno validando disponibilidad ✅ 2026-05-15 
- [ ] **Refrescar** turnos luego de reservar // Gonza 
- [x] **Cancelar** turno con mínimo 1 hora de anticipación
- [x] **Registrar motivo** de cancelación
- [x] **Consultar historial** personal de turnos
- [ ] **Solicitar cambio** de fecha de turno // nico y mate <3 retrasados
- [ ] **Flujo de confirmación** para cambio de turno

## Médicos
- [x] **Cancelar** turnos con mínimo 1 hora de anticipación
- [x] **Registrar motivo** de cancelación
- [x] Consultar historial de turnos de un paciente
- [ ] Proponer modificación de fecha de turno // nico y mate <3
- [ ] Confirmación de modificación requerida
- [x] Marcar turno como REALIZADO
- [x] Consultar disponibilidad por especialidad/práctica

---

# 🧾 Gestión de Servicios

## CRUD de Servicios Médicos
- [x] Alta de servicios         
- [x] Modificación de servicios
- [x] Baja de servicios
- [x] Gestión de especialidades
- [x] Gestión de prácticas

---

# 🔎 Búsqueda de Turnos

## Filtros de búsqueda
- [x] Filtrar por profesional ✅ 2026-05-15
- [x] Filtrar por especialidad ✅ 2026-05-15
- [x] Filtrar por práctica ✅ 2026-05-15
- [x] Filtrar por sede ✅ 2026-05-15
- [x] Filtrar por rango de fechas ✅ 2026-05-15

## Cobertura y costos
- [x] Validar plan del paciente ✅ 2026-05-15
- [x] Calcular cobertura: ✅ 2026-05-15
  - [x] Cubierto ✅ 2026-05-15
  - [x] Parcialmente cubierto ✅ 2026-05-15
  - [x] No cubierto ✅ 2026-05-15
- [x] Calcular monto a pagar ✅ 2026-05-15

## Respuesta de búsqueda
- [x] Mostrar profesional ✅ 2026-05-15
- [x] Mostrar especialidad/práctica ✅ 2026-05-15
- [x] Mostrar fecha y hora ✅ 2026-05-15
- [x] Mostrar sede ✅ 2026-05-15
- [x] Mostrar estado DISPONIBLE ✅ 2026-05-15
- [x] Mostrar costo estimado ✅ 2026-05-15

## Performance
- [x] Implementar paginación ✅ 2026-05-15
- [ ] Ordenar por costo ASC/DESC
- [x] Ordenar por fecha ASC/DESC ✅ 2026-05-15

---
# 🔔 Notificaciones

- [x] Endpoint para obtener notificaciones NO leídas ✅ 2026-05-16
- [x] Endpoint para obtener notificaciones leídas ✅ 2026-05-16
- [x] Endpoint para marcar notificación como leída ✅ 2026-05-16
- [x] Persistencia de notificaciones ✅ 2026-05-16

---

# 🧪 Testing

## Tests Unitarios
- [ ] Tests unitarios de capa Service
- [ ] Tests unitarios de capa Domain
- [ ] Configuración Jest
- [ ] Cobertura mínima definida
- [ ] Mocking de repositorios/base de datos

---

# 📚 Documentación

- [x] Documentación Swagger configurada
- [x] Endpoints documentados
- [ ] Schemas/modelos documentados
- [x] Ejemplos de requests/responses
- [x] Códigos de error documentados

---

# 📌 Entregables Finales

- [ ] API REST completa
- [ ] Persistencia NoSQL funcionando
- [ ] Tests unitarios implementados
- [ ] Swagger disponible
- [ ] Proyecto ejecutable
- [ ] README actualizado