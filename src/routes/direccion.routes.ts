// src/routes/direccion.routes.ts
import { Router } from "express";
import {
  crearDireccion,
  listarDireccionesPorUsuario,
  actualizarDireccion,
  eliminarDireccion,
  establecerDireccionPredeterminada,
} from "../controllers/direccion.controller";
//import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
// Todas las rutas requieren autenticación
//router.use(authMiddleware);

// Direcciones
router.get("/usuario/:usuario_id", listarDireccionesPorUsuario);
router.post("/", crearDireccion);
router.put("/:id", actualizarDireccion);
router.delete("/:id", eliminarDireccion);
router.patch("/:id/set-default", establecerDireccionPredeterminada);

export default router;
