"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarRol = exports.actualizarRol = exports.obtenerRolPorId = exports.listarRoles = exports.crearRol = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
/* =========================================================
   Crear Rol
   ========================================================= */
const crearRol = async (req, res) => {
    try {
        const { nombre, descripcion, activo } = req.body;
        // Validación
        if (!nombre || !descripcion) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }
        // Verificar si el nombre ya existe
        const rolExistente = await prisma_1.default.rol.findUnique({
            where: { nombre },
        });
        if (rolExistente) {
            return res.status(409).json({ error: "El rol ya existe" });
        }
        const nuevoRol = await prisma_1.default.rol.create({
            data: {
                nombre,
                descripcion,
                activo: activo ?? true, // si no se envía, queda activo
            },
        });
        res.status(201).json(nuevoRol);
    }
    catch (error) {
        console.error("Error al crear rol:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
exports.crearRol = crearRol;
/* =========================================================
   Listar Roles
   ========================================================= */
const listarRoles = async (_req, res) => {
    try {
        const roles = await prisma_1.default.rol.findMany({
            include: {
                usuarios: true, // incluir relaciones
                permisos: true,
            },
            orderBy: { id: "asc" },
        });
        res.status(200).json(roles);
    }
    catch (error) {
        console.error("Error al listar roles:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
exports.listarRoles = listarRoles;
/* =========================================================
   Obtener Rol por ID
   ========================================================= */
const obtenerRolPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const rol = await prisma_1.default.rol.findUnique({
            where: { id: Number(id) },
            include: {
                usuarios: true,
                permisos: true,
            },
        });
        if (!rol) {
            return res.status(404).json({ error: "Rol no encontrado" });
        }
        res.status(200).json(rol);
    }
    catch (error) {
        console.error("Error al obtener rol:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
exports.obtenerRolPorId = obtenerRolPorId;
/* =========================================================
   Actualizar Rol
   ========================================================= */
const actualizarRol = async (req, res) => {
    try {
        const { id } = req.params;
        const datos = req.body;
        // Validar existencia
        const rolExistente = await prisma_1.default.rol.findUnique({
            where: { id: Number(id) },
        });
        if (!rolExistente) {
            return res.status(404).json({ error: "Rol no encontrado" });
        }
        // Evitar duplicidad de nombre (si lo cambia)
        if (datos.nombre && datos.nombre !== rolExistente.nombre) {
            const duplicado = await prisma_1.default.rol.findUnique({
                where: { nombre: datos.nombre },
            });
            if (duplicado) {
                return res.status(409).json({ error: "Ya existe un rol con ese nombre" });
            }
        }
        const rolActualizado = await prisma_1.default.rol.update({
            where: { id: Number(id) },
            data: {
                nombre: datos.nombre ?? rolExistente.nombre,
                descripcion: datos.descripcion ?? rolExistente.descripcion,
                activo: datos.activo ?? rolExistente.activo,
            },
        });
        res.status(200).json(rolActualizado);
    }
    catch (error) {
        console.error("Error al actualizar rol:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
exports.actualizarRol = actualizarRol;
/* =========================================================
   Eliminar (Desactivar) Rol
   ========================================================= */
const eliminarRol = async (req, res) => {
    try {
        const { id } = req.params;
        const rol = await prisma_1.default.rol.findUnique({
            where: { id: Number(id) },
        });
        if (!rol) {
            return res.status(404).json({ error: "Rol no encontrado" });
        }
        await prisma_1.default.rol.update({
            where: { id: Number(id) },
            data: { activo: false },
        });
        res.status(200).json({ mensaje: "Rol desactivado correctamente" });
    }
    catch (error) {
        console.error("Error al eliminar rol:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
exports.eliminarRol = eliminarRol;
//# sourceMappingURL=rol.controller.js.map