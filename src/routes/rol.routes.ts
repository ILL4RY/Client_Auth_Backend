import { Router } from "express";

import {
  crearRol,
  listarRoles,
  obtenerRolPorId,
  actualizarRol,
  eliminarRol,
} from "../controllers/rol.controller";

const router = Router();

router.post("/", crearRol);
router.get("/", listarRoles);
router.get("/:id", obtenerRolPorId);
router.put("/:id", actualizarRol);
router.delete("/:id", eliminarRol);

export default router;
