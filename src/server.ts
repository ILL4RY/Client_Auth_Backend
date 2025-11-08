import dotenv from "dotenv";
dotenv.config();

import app from "./app";
//import { pool } from "./config/database";
import prisma from './config/prisma'; // usa .js si estás en módulo ESM

const PORT = process.env.PORT || 3000;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});