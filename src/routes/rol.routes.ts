import { Router } from "express";

import {
  crearRol,
  listarRoles,
  obtenerRolPorId,
  actualizarRol,
  desactivarRol,
  asignarRolUsuario
} from "../controllers/rol.controller";

const router = Router();

router.post("/", crearRol);
router.get("/", listarRoles);
router.get("/:id", obtenerRolPorId);
router.put("/:id", actualizarRol);
router.delete("/:id", desactivarRol);

router.post("/asignar", asignarRolUsuario);

export default router;
