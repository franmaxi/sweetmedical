import "dotenv/config"; // Importante que esté arriba de todo
import app from "./app.js";
import { MongoDBClient } from "./config/database.js";

const PORT = process.env.SERVER_PORT || 3000;

const start = async () => {
  try {
    console.log("Conectando a MongoDB...");
    await MongoDBClient.connect();
    
    app.listen(PORT, () => {
      console.log(`🚀 Backend escuchando en puerto ${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar la aplicación:", error);
    process.exit(1);
  }
};

start();