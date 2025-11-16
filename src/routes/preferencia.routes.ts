import { Router } from "express";
import {
  crearPreferencia,
  listarPreferencias,
  obtenerPreferenciaPorId,
  actualizarPreferencia,
  eliminarPreferencia,
} from "../controllers/preferencia.controller";

const router = Router();

router.get("/", listarPreferencias);
router.get("/:id", obtenerPreferenciaPorId);
router.post("/", crearPreferencia);
router.put("/:id", actualizarPreferencia);
router.delete("/:id", eliminarPreferencia);

export default router;