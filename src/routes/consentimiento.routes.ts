import { Router } from "express";
import {
  crearConsentimiento,
  listarConsentimientos,
  obtenerConsentimientoPorId,
  actualizarConsentimiento,
  eliminarConsentimiento,
} from "../controllers/consentimiento.controller";

const router = Router();

router.post("/", crearConsentimiento);
router.get("/", listarConsentimientos);
router.get("/:id", obtenerConsentimientoPorId);
router.put("/:id", actualizarConsentimiento);
router.delete("/:id", eliminarConsentimiento);

export default router;
