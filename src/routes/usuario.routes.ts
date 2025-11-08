import { Router } from "express";

import {
  crearUsuario,
  listarUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
} from "../controllers/usuario.controller";

const router = Router();

//Usuario
router.get("/", listarUsuarios);
router.get("/:id", obtenerUsuarioPorId);
router.post("/", crearUsuario);
router.put("/:id", actualizarUsuario);
router.delete("/:id", eliminarUsuario);

export default router;