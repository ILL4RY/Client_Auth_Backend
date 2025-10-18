"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const consentimiento_controller_1 = require("../controllers/consentimiento.controller");
const router = (0, express_1.Router)();
router.post("/", consentimiento_controller_1.crearConsentimiento);
router.get("/", consentimiento_controller_1.listarConsentimientos);
router.get("/:id", consentimiento_controller_1.obtenerConsentimientoPorId);
router.put("/:id", consentimiento_controller_1.actualizarConsentimiento);
router.delete("/:id", consentimiento_controller_1.eliminarConsentimiento);
exports.default = router;
//# sourceMappingURL=consentimiento.routes.js.map