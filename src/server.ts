import app from "./app";
import dotenv from "dotenv";

// Cargar variables de entorno desde .env
dotenv.config();

const PORT = process.env.PORT || 3000;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});