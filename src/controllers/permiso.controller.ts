import { Request, Response } from "express";
import prisma from "../config/prisma";
import { CrearPermisoDTO } from "../interfaces/permiso.interface";

/* =========================================================
   📋 Listar todos los permisos
   ========================================================= */
export const listarPermisos = async (req: Request, res: Response) => {
  try {
    const permisos = await prisma.permiso.findMany({
      orderBy: { id: "asc" },
    });
    res.status(200).json(permisos);
  } catch (error) {
    console.error("Error al listar permisos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =========================================================
   🔍 Obtener un permiso por ID
   ========================================================= */
export const obtenerPermisoPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const permiso = await prisma.permiso.findUnique({
      where: { id: Number(id) },
    });

    if (!permiso) {
      return res.status(404).json({ error: "Permiso no encontrado" });
    }

    res.status(200).json(permiso);
  } catch (error) {
    console.error("Error al obtener permiso:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =========================================================
   🆕 Crear nuevo permiso
   ========================================================= */
export const crearPermiso = async (
  req: Request<{}, {}, CrearPermisoDTO>,
  res: Response
) => {
  try {
    const { 
        nombre, 
        descripcion, 
        activo = true 
    } = req.body;

    // Validar campos requeridos
    if (!nombre || !descripcion) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Verificar si ya existe un permiso con ese nombre
    const permisoExistente = await prisma.permiso.findFirst({
      where: { nombre },
    });

    if (permisoExistente) {
      return res.status(409).json({ error: "El permiso ya existe" });
    }

    const nuevoPermiso = await prisma.permiso.create({
      data: { nombre, descripcion, activo },
    });

    res.status(201).json(nuevoPermiso);
  } catch (error) {
    console.error("Error al crear permiso:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =========================================================
   ✏️ Actualizar permiso
   ========================================================= */
export const actualizarPermiso = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    const permisoActualizado = await prisma.permiso.update({
      where: { id: Number(id) },
      data: { ...datos },
    });

    res.status(200).json(permisoActualizado);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Permiso no encontrado" });
    }
    console.error("Error al actualizar permiso:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =========================================================
   🗑️ Eliminar permiso
   ========================================================= */
export const eliminarPermiso = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.permiso.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ mensaje: "Permiso eliminado correctamente" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Permiso no encontrado" });
    }
    console.error("Error al eliminar permiso:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
