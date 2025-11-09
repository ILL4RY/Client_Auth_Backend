import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import session from 'express-session';
import connectPgSimple from "connect-pg-simple";
import { express as useragent } from 'express-useragent';
import { pool } from "./config/database";

import usuarioRoutes from "./routes/usuario.routes";
import rolRoutes from "./routes/rol.routes";
import permisoRoutes from "./routes/permiso.routes";
import authRouter from "./routes/auth.routes";
import direccionRoutes from "./routes/direccion.routes";

const app = express();
const PgSession = connectPgSimple(session);

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(useragent());
app.use(
  session({
    store: new PgSession({
      pool: pool,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: process.env.SECRET_KEY!,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 año
      secure: false, // cámbiar a true si se usa HTTPS
      sameSite: "lax",
    },
  })
);

// Rutas
// Rutas de autenticación
app.use("/api/auth", authRouter);

// Rutas protegidas (requieren autenticación)
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/roles", rolRoutes);
app.use("/api/permisos", permisoRoutes);
app.use("/api/direcciones", direccionRoutes);

// Ruta base
app.get("/", (req, res) => {
  res.send("API del Backend Cliente funcionando ✅");
});

export default app;
