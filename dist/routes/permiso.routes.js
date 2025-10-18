"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const permiso_controller_1 = require("../controllers/permiso.controller");
const router = (0, express_1.Router)();
router.get("/", permiso_controller_1.listarPermisos);
router.get("/:id", permiso_controller_1.obtenerPermisoPorId);
router.post("/", permiso_controller_1.crearPermiso);
router.put("/:id", permiso_controller_1.actualizarPermiso);
router.delete("/:id", permiso_controller_1.eliminarPermiso);
exports.default = router;
//# sourceMappingURL=permiso.routes.js.map