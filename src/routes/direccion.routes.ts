// src/routes/direccion.routes.ts
import { Router } from "express";
import {
  crearDireccion,
  listarDireccionesPorUsuario,
  actualizarDireccion,
  eliminarDireccion,
} from "../controllers/direccion.controller";

const router = Router();

// Direcciones
router.get("/usuario/:usuario_id", listarDireccionesPorUsuario);
router.post("/", crearDireccion);
router.put("/:id", actualizarDireccion);
router.delete("/:id", eliminarDireccion);

export default router;
