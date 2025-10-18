"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarConsentimiento = exports.actualizarConsentimiento = exports.obtenerConsentimientoPorId = exports.listarConsentimientos = exports.crearConsentimiento = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
/* =========================================================
   Crear consentimiento
   ========================================================= */
const crearConsentimiento = async (req, res) => {
    try {
        const { nombre, descripcion, obligatorio = false, vigente_desde, vigente_hasta, activo = true, } = req.body;
        if (!nombre) {
            return res.status(400).json({ error: "El campo 'nombre' es obligatorio" });
        }
        // Validar duplicados
        const existente = await prisma_1.default.consentimiento.findFirst({
            where: { nombre },
        });
        if (existente) {
            return res.status(409).json({ error: "Ya existe un consentimiento con ese nombre" });
        }
        const nuevo = await prisma_1.default.consentimiento.create({
            data: {
                nombre,
                descripcion: descripcion ?? null,
                obligatorio,
                vigente_desde: vigente_desde ? new Date(vigente_desde) : new Date(),
                vigente_hasta: vigente_hasta ? new Date(vigente_hasta) : null,
                activo,
            },
        });
        res.status(201).json(nuevo);
    }
    catch (error) {
        console.error("Error al crear consentimiento:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
exports.crearConsentimiento = crearConsentimiento;
/* =========================================================
   Listar todos los consentimientos
   ========================================================= */
const listarConsentimientos = async (_req, res) => {
    try {
        const consentimientos = await prisma_1.default.consentimiento.findMany({
            orderBy: { id: "asc" },
        });
        res.status(200).json(consentimientos);
    }
    catch (error) {
        console.error("Error al listar consentimientos:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
exports.listarConsentimientos = listarConsentimientos;
/* =========================================================
   Obtener consentimiento por ID
   ========================================================= */
const obtenerConsentimientoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const consentimiento = await prisma_1.default.consentimiento.findUnique({
            where: { id: Number(id) },
        });
        if (!consentimiento) {
            return res.status(404).json({ error: "Consentimiento no encontrado" });
        }
        res.status(200).json(consentimiento);
    }
    catch (error) {
        console.error("Error al obtener consentimiento:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
exports.obtenerConsentimientoPorId = obtenerConsentimientoPorId;
/* =========================================================
   Actualizar consentimiento
   ========================================================= */
const actualizarConsentimiento = async (req, res) => {
    try {
        const { id } = req.params;
        const datos = req.body;
        const consentimientoActualizado = await prisma_1.default.consentimiento.update({
            where: { id: Number(id) },
            data: {
                ...datos,
                vigente_desde: datos.vigente_desde
                    ? new Date(datos.vigente_desde)
                    : undefined,
                vigente_hasta: datos.vigente_hasta
                    ? new Date(datos.vigente_hasta)
                    : undefined,
            },
        });
        res.status(200).json(consentimientoActualizado);
    }
    catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ error: "Consentimiento no encontrado" });
        }
        console.error("Error al actualizar consentimiento:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
exports.actualizarConsentimiento = actualizarConsentimiento;
/* =========================================================
   Eliminar consentimiento
   ========================================================= */
const eliminarConsentimiento = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.consentimiento.delete({
            where: { id: Number(id) },
        });
        res.status(200).json({ mensaje: "Consentimiento eliminado correctamente" });
    }
    catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ error: "Consentimiento no encontrado" });
        }
        console.error("Error al eliminar consentimiento:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
exports.eliminarConsentimiento = eliminarConsentimiento;
//# sourceMappingURL=consentimiento.controller.js.map