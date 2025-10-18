import express from 'express';
import prisma from './config/prisma'; // usa .js si estás en módulo ESM

import usuarioRoutes from "./routes/usuario.routes";
import rolRoutes from "./routes/rol.routes";
import permisoRoutes from "./routes/permiso.routes";

const app = express();
app.use(express.json());

app.use("/usuarios", usuarioRoutes);
app.use("/roles", rolRoutes);
app.use("/permisos", permisoRoutes);

app.listen(3000, () => {
  console.log('🚀 Servidor corriendo en http://localhost:3000');
});
