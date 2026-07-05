# 🚀 Guía de Deploy - Sweet Medical

Esta guía explica paso a paso cómo hacer el deploy de la aplicación en la nube. 
Se utiliza **Render** para el Backend y **Netlify** para el Frontend.

---

## 1. Preparación de la Base de Datos (MongoDB Atlas)

Antes de levantar el backend, se necesita tener la base de datos en la nube.

1. Crear una cuenta en [MongoDB Atlas](https://cloud.mongodb.com).
2. Crear un **Cluster**.
3. En la sección **Database Access**, crear un usuario con contraseña (guardar esta información).
4. En la sección **Network Access**, agregar la IP `0.0.0.0/0` (esto permite que Render pueda conectarse desde cualquier IP).
5. En el Cluster, hacer clic en **Connect** > **Drivers** y copiar el "Connection String". Será parecido a este:
   `mongodb+srv://<usuario>:<password>@cluster0.xxxxx.mongodb.net/`

---

## 2. Deploy del Backend (Render)

1. Crear una cuenta gratuita en [Render](https://render.com) usando GitHub.
2. Hacer clic en **New +** y seleccionar **Web Service**.
3. Conectar el repositorio de GitHub y seleccionar la rama principal (`main`).
4. Configurar los detalles del servicio:
   - **Root Directory:** `packages/backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. En la sección **Environment Variables**, cargar todas las variables que se encuentran en el archivo `.env.example` del backend:
   - `MONGODB_URI`: El connection string copiado de Atlas.
   - `MONGODB_NAME`: El nombre de la base de datos.
   - `ALLOWED_ORIGINS`: La URL del front.
   - `SALT_ROUNDS`, `JWT_SECRET_KEY`, `JWT_EXPIRATION`, `TOKEN_HEADER_KEY`.
   
   *Nota: No agregar `SERVER_PORT`. Render maneja automáticamente el puerto con su propia variable `PORT`.*
6. Hacer clic en **Create Web Service**. 
7. Cuando el estado cambie a **Live**, copiar la URL pública (ej: `https://sweet-medical-backend.onrender.com`).

---

## 3. Deploy del Frontend (Netlify)

1. Crear una cuenta gratuita en [Netlify](https://netlify.com) usando GitHub.
2. Hacer clic en **Add new site** > **Import an existing project**.
3. Conectar el repositorio de GitHub.
4. En **Build settings**, configurar exactamente lo siguiente:
   - **Base directory:** `packages/frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `packages/frontend/build`
5. En la sección **Environment variables** (Site settings), agregar:
   - `REACT_APP_API_URL`: La URL pública del backend que te dio Render.
   - `CI`: `false` (para evitar errores).
6. Hacer clic en **Deploy site**.
7. Una vez finalizado, copiar la URL pública del frontend (ej: `https://tu-app.netlify.app`).

---

## 4. Conexión Final (CORS)

Para que el frontend pueda comunicarse correctamente con el backend sin errores de CORS:

1. Volver al Web Service de **Render** (Backend).
2. Ir a la sección **Environment**.
3. Actualizar la variable `ALLOWED_ORIGINS` y ponerle el valor de la URL final de Netlify (ej: `https://tu-app.netlify.app`).
4. Guardar los cambios. Render reiniciará el servicio automáticamente.

---

## 5. Solución de Problemas Comunes

### Error 404 "Page Not Found" en el Frontend (React Router)
Si al navegar o recargar páginas en Netlify aparece un error 404, asegúrate de que exista el archivo `_redirects` en la ruta `packages/frontend/public/_redirects` con este contenido exacto:
```
/*    /index.html   200
```
*Si no existe, crealo.*

### El Backend tira "Connection Refused" o no responde
- Verificar que en MongoDB Atlas la Network Access (whitelist) tenga `0.0.0.0/0`.
- Verificar que el backend en `index.js` esté tomando el puerto de `process.env.PORT`: `const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;`.
