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
import preferenciaRoutes from "./routes/preferencia.routes";
import consentimientoRoutes from "./routes/consentimiento.routes";

import swaggerSpecs from "./config/swagger";
import swaggerUi from "swagger-ui-express";

import path from "path";

const app = express();
const PgSession = connectPgSimple(session);

// Middlewares
/*
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
*/

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));


const IN_PROD = process.env.NODE_ENV === "production";

app.use(morgan("dev"));
app.use(express.json());
app.use(useragent());
app.use(
  session({
    store: new PgSession({
      pool: pool,
      tableName: "session",
    }),
    secret: process.env.SECRET_KEY!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 año
      httpOnly: true,
      secure: IN_PROD,                     // true solo en producción HTTPS
      sameSite: IN_PROD ? "none" : "lax", // cross-site en prod, lax en local
    },
  })
);


// Servir carpeta uploads como pública
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

// Rutas
// Rutas de autenticación
app.use("/api/auth", authRouter);

// Rutas protegidas (requieren autenticación)
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/roles", rolRoutes);
app.use("/api/permisos", permisoRoutes);
app.use("/api/direcciones", direccionRoutes);
app.use("/api/preferencias", preferenciaRoutes);
app.use("/api/consentimientos", consentimientoRoutes);

// Ruta de documentación
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Ruta base
app.get("/", (req, res) => {
  res.send("API del Backend Cliente funcionando ✅");
});

export default app;
