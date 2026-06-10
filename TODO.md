# 📋 Entrega 3

## BACKEND

## 🗓️ Agenda
- [x] Decidir el problema de las disponibilidades -> Establecida en 15 minutos falta testear
- [ ] Testear el funcionamiento de la generacion de turnos

## 📄 Plan
- [x] Validar que no se repita el nombre del plan
- [ ] embeber los planes en obra social

## 🔧 Schemas
- [x] Si no es `string` u `ObjectId`, debe fallar la validación de IDs

## 🩺 Médico
- [x] No devolver error interno cuando se detecta una matrícula o nombre de usuario ya existente
- [x] Validar el eliminado:false en findAll al momento de generar turnos con el batch

## 📅 Disponibilidad
- [ ] Las prácticas o especialidades pueden venir como `string` y no solamente como `array`
  

## FRONTEND
- [ ] Verificar que nos traemos cuando tengamos que popular

# 📋 Correciones Entrega 3 
- [ ] Turno pasa a confirmar en vez de directamente a reservado
- [ ] Turno puede ser aceptado o rechazado por un medico
- [ ] Testear el funcionamiento de todos los flujos de turno
- [ ] Que las modificaciones en medico afecten todos sus datos (principalmente dispnibilidades)
- [ ] Que las modificaciones en medico afecten a sus turnos segun lo establecido en la consigna
 
