# Git Flow del Proyecto

## 📌 Descripción general
En este trabajo práctico vamos a utilizar un flujo de trabajo basado en Git que nos permita organizarnos en equipos y trabajar en paralelo sin interferencias.

## 🌱 Rama principal
Partimos de una rama principal llamada `main`, que contiene la base del proyecto.

## 👥 Trabajo por equipos
Cada equipo va a crear su propia rama a partir de `main`, donde desarrollará sus funcionalidades de manera independiente.

Esto permite que todos los equipos trabajen al mismo tiempo sin generar conflictos en el código.

## 🔀 Integración de cambios
Una vez que un equipo finaliza su desarrollo:

1. Sube sus cambios al repositorio.
2. Crea un **Pull Request (PR)** hacia la rama `main`.

Este paso permite que el resto del equipo:

- Revise el código
- Sugiera mejoras o correcciones
- Valide que todo funcione correctamente

## ✅ Merge final
Cuando el Pull Request es aprobado, se realiza el **merge** de la rama del equipo a la rama `main`, integrando los cambios al proyecto general.