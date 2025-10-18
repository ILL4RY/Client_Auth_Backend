import express from "express";
import cors from "cors";
import morgan from "morgan";

import usuarioRoutes from "./routes/usuario.routes";
import rolRoutes from "./routes/rol.routes";
import permisoRoutes from "./routes/permiso.routes";

const app = express();

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Rutas
app.use("/usuarios", usuarioRoutes);
app.use("/roles", rolRoutes);
app.use("/permisos", permisoRoutes);

// Ruta base
app.get("/", (req, res) => {
  res.send("API del Backend Cliente funcionando ✅");
});

export default app;
