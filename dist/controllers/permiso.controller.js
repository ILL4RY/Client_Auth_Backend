"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarPermiso = exports.actualizarPermiso = exports.crearPermiso = exports.obtenerPermisoPorId = exports.listarPermisos = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
/* =========================================================
   Listar todos los permisos
   ========================================================= */
const listarPermisos = async (req, res) => {
    try {
        const permisos = await prisma_1.default.permiso.findMany({
            orderBy: { id: "asc" },
        });
        res.status(200).json(permisos);
    }
    catch (error) {
        console.error("Error al listar permisos:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
exports.listarPermisos = listarPermisos;
/* =========================================================
   Obtener un permiso por ID
   ========================================================= */
const obtenerPermisoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const permiso = await prisma_1.default.permiso.findUnique({
            where: { id: Number(id) },
        });
        if (!permiso) {
            return res.status(404).json({ error: "Permiso no encontrado" });
        }
        res.status(200).json(permiso);
    }
    catch (error) {
        console.error("Error al obtener permiso:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
exports.obtenerPermisoPorId = obtenerPermisoPorId;
/* =========================================================
   Crear nuevo permiso
   ========================================================= */
const crearPermiso = async (req, res) => {
    try {
        const { nombre, descripcion, activo = true } = req.body;
        // Validar campos requeridos
        if (!nombre || !descripcion) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }
        // Verificar si ya existe un permiso con ese nombre
        const permisoExistente = await prisma_1.default.permiso.findFirst({
            where: { nombre },
        });
        if (permisoExistente) {
            return res.status(409).json({ error: "El permiso ya existe" });
        }
        const nuevoPermiso = await prisma_1.default.permiso.create({
            data: { nombre, descripcion, activo },
        });
        res.status(201).json(nuevoPermiso);
    }
    catch (error) {
        console.error("Error al crear permiso:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
exports.crearPermiso = crearPermiso;
/* =========================================================
   Actualizar permiso
   ========================================================= */
const actualizarPermiso = async (req, res) => {
    try {
        const { id } = req.params;
        const datos = req.body;
        const permisoActualizado = await prisma_1.default.permiso.update({
            where: { id: Number(id) },
            data: { ...datos },
        });
        res.status(200).json(permisoActualizado);
    }
    catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ error: "Permiso no encontrado" });
        }
        console.error("Error al actualizar permiso:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
exports.actualizarPermiso = actualizarPermiso;
/* =========================================================
   Eliminar permiso
   ========================================================= */
const eliminarPermiso = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.permiso.delete({
            where: { id: Number(id) },
        });
        res.status(200).json({ mensaje: "Permiso eliminado correctamente" });
    }
    catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ error: "Permiso no encontrado" });
        }
        console.error("Error al eliminar permiso:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
exports.eliminarPermiso = eliminarPermiso;
//# sourceMappingURL=permiso.controller.js.map