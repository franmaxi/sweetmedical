import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import router from "./routes/router.js";
import swaggerSpec from "./swagger.js";
import { NotFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorLogger } from "./middlewares/errorLogger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import iniciarTurnosCron from "./crons/cronTurnos.js";

const app = express();

app.use(express.json());
// Normaliza los orígenes permitidos quitando espacios y barras finales,
// así el navegador (que envía el Origin sin barra final) matchea aunque
// en la config figure "http://localhost:3000/".
const sinBarraFinal = (o) => o.trim().replace(/\/+$/, "");
const origenesPermitidos = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(sinBarraFinal).filter(Boolean)
  : null;

app.use(
  cors({
    origin: origenesPermitidos
      ? (origin, callback) => {
          // Permite requests sin Origin (curl, Postman, health checks)
          if (!origin || origenesPermitidos.includes(sinBarraFinal(origin))) {
            return callback(null, true);
          }
          return callback(new Error(`Origen no permitido por CORS: ${origin}`));
        }
      : true,
    exposedHeaders: ["X-Renewed-Token"],
  })
);

app.get("/health", (_, res) => {
  res.status(200).json({ message: "Servidor en funcionamiento" });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(router);


iniciarTurnosCron();

app.use(NotFoundHandler);
app.use(errorLogger);
app.use(errorHandler);

export default app;