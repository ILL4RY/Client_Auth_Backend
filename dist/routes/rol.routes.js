"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rol_controller_1 = require("../controllers/rol.controller");
const router = (0, express_1.Router)();
router.post("/", rol_controller_1.crearRol);
router.get("/", rol_controller_1.listarRoles);
router.get("/:id", rol_controller_1.obtenerRolPorId);
router.put("/:id", rol_controller_1.actualizarRol);
router.delete("/:id", rol_controller_1.eliminarRol);
exports.default = router;
//# sourceMappingURL=rol.routes.js.map