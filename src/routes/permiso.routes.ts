import { Router } from "express";
import {
  listarPermisos,
  obtenerPermisoPorId,
  crearPermiso,
  actualizarPermiso,
  eliminarPermiso,
} from "../controllers/permiso.controller";

const router = Router();

router.get("/", listarPermisos);
router.get("/:id", obtenerPermisoPorId);
router.post("/", crearPermiso);
router.put("/:id", actualizarPermiso);
router.delete("/:id", eliminarPermiso);

export default router;