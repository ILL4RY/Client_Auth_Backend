"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarPreferencia = exports.actualizarPreferencia = exports.obtenerPreferenciaPorId = exports.listarPreferencias = exports.crearPreferencia = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
/* =========================================================
   Crear preferencia
   ========================================================= */
const crearPreferencia = async (req, res) => {
    try {
        const { usuario_id, tema, idioma, notificaciones_on = true, marketing_emails = false, privacidad_nivel, } = req.body;
        if (!usuario_id) {
            return res.status(400).json({ error: "El campo 'usuario_id' es obligatorio" });
        }
        // Verificar si el usuario existe
        const usuarioExiste = await prisma_1.default.usuario.findUnique({
            where: { id: usuario_id },
        });
        if (!usuarioExiste) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        // Verificar si ya tiene una preferencia creada
        const preferenciaExistente = await prisma_1.default.preferencia.findUnique({
            where: { usuario_id },
        });
        if (preferenciaExistente) {
            return res.status(409).json({ error: "El usuario ya tiene una preferencia configurada" });
        }
        const nueva = await prisma_1.default.preferencia.create({
            data: {
                usuario_id,
                tema: tema ?? null,
                idioma: idioma ?? null,
                notificaciones_on,
                marketing_emails,
                privacidad_nivel: privacidad_nivel ?? null,
            },
        });
        res.status(201).json(nueva);
    }
    catch (error) {
        console.error("Error al crear preferencia:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
exports.crearPreferencia = crearPreferencia;
/* =========================================================
   Listar todas las preferencias
   ========================================================= */
const listarPreferencias = async (_req, res) => {
    try {
        const preferencias = await prisma_1.default.preferencia.findMany({
            include: {
                usuario: {
                    select: { id: true, nombres: true, correo: true },
                },
            },
            orderBy: { id: "asc" },
        });
        res.status(200).json(preferencias);
    }
    catch (error) {
        console.error("Error al listar preferencias:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
exports.listarPreferencias = listarPreferencias;
/* =========================================================
   Obtener preferencia por ID
   ========================================================= */
const obtenerPreferenciaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const preferencia = await prisma_1.default.preferencia.findUnique({
            where: { id: Number(id) },
            include: {
                usuario: {
                    select: { id: true, nombres: true, correo: true },
                },
            },
        });
        if (!preferencia) {
            return res.status(404).json({ error: "Preferencia no encontrada" });
        }
        res.status(200).json(preferencia);
    }
    catch (error) {
        console.error("Error al obtener preferencia:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
exports.obtenerPreferenciaPorId = obtenerPreferenciaPorId;
/* =========================================================
   Actualizar preferencia
   ========================================================= */
const actualizarPreferencia = async (req, res) => {
    try {
        const { id } = req.params;
        const datos = req.body;
        const preferenciaActualizada = await prisma_1.default.preferencia.update({
            where: { id: Number(id) },
            data: {
                tema: datos.tema ?? undefined,
                idioma: datos.idioma ?? undefined,
                notificaciones_on: datos.notificaciones_on !== undefined ? datos.notificaciones_on : undefined,
                marketing_emails: datos.marketing_emails !== undefined ? datos.marketing_emails : undefined,
                privacidad_nivel: datos.privacidad_nivel ?? undefined,
            },
        });
        res.status(200).json(preferenciaActualizada);
    }
    catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ error: "Preferencia no encontrada" });
        }
        console.error("Error al actualizar preferencia:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
exports.actualizarPreferencia = actualizarPreferencia;
/* =========================================================
   Eliminar preferencia
   ========================================================= */
const eliminarPreferencia = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.preferencia.delete({
            where: { id: Number(id) },
        });
        res.status(200).json({ mensaje: "Preferencia eliminada correctamente" });
    }
    catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ error: "Preferencia no encontrada" });
        }
        console.error("Error al eliminar preferencia:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
exports.eliminarPreferencia = eliminarPreferencia;
//# sourceMappingURL=preferencia.controller.js.map