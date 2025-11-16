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
  origin: [
    'http://localhost:5173',   // Vite
    "http://localhost:57224",  // npx serve para login-test
  ],
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
    saveUninitialized: false, //CAMBIOOOOO
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 año
      secure: false, // cámbiar a true si se usa HTTPS
      //sameSite: "lax",
      sameSite: "none"      // obligatorio para cross-site
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
app.use("/api/preferencias", preferenciaRoutes);


// Ruta base
app.get("/", (req, res) => {
  res.send("API del Backend Cliente funcionando ✅");
});

export default app;
