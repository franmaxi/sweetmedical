import express from "express";
import cors from "cors";
import router from "./routes/router.js";
import { NotFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorLogger } from "./middlewares/errorLogger.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
      : true,
  })
);


app.get("/health", (_, res) => {
  res.status(200).json({ message: "Servidor en funcionamiento" });
});


app.use(router);


app.use(NotFoundHandler);
app.use(errorLogger);
app.use(errorHandler);

export default app;