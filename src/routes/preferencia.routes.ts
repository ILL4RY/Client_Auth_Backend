import { Router } from "express";
import {
  crearPreferencia,
  listarPreferencias,
  obtenerPreferenciaPorId,
  actualizarPreferencia,
  eliminarPreferencia,
  obtenerPreferenciaPorUsuario,
  upsertPreferenciaPorUsuario,
} from "../controllers/preferencia.controller";

const router = Router();

router.get("/", listarPreferencias);
router.get("/usuario/:usuarioId", obtenerPreferenciaPorUsuario);
router.put("/usuario/:usuarioId", upsertPreferenciaPorUsuario);
router.get("/:id", obtenerPreferenciaPorId);
router.post("/", crearPreferencia);
router.put("/:id", actualizarPreferencia);
router.delete("/:id", eliminarPreferencia);

export default router;
