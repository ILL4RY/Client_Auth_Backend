import { Request, Response } from "express";
import prisma from "../config/prisma";
import { CrearRolDTO } from "../interfaces/rol.interface";

/* =========================================================
   Crear Rol
   ========================================================= */
export const crearRol = async (
  req: Request<{}, {}, CrearRolDTO>,
  res: Response
) => {
  try {
    const { 
        nombre, 
        descripcion, 
        activo 
    } = req.body;

    // Validación
    if (!nombre || !descripcion) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Verificar si el nombre ya existe
    const rolExistente = await prisma.rol.findUnique({
      where: { nombre },
    });
    if (rolExistente) {
      return res.status(409).json({ error: "El rol ya existe" });
    }

    const nuevoRol = await prisma.rol.create({
      data: {
        nombre,
        descripcion,
        activo: activo ?? true, // si no se envía, queda activo
      },
    });

    res.status(201).json(nuevoRol);
  } catch (error) {
    console.error("Error al crear rol:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =========================================================
   Listar Roles
   ========================================================= */
export const listarRoles = async (_req: Request, res: Response) => {
  try {
    const roles = await prisma.rol.findMany({
      include: {
        usuarios: true, // incluir relaciones
        permisos: true,
      },
      orderBy: { id: "asc" },
    });
    res.status(200).json(roles);
  } catch (error) {
    console.error("Error al listar roles:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =========================================================
   Obtener Rol por ID
   ========================================================= */
export const obtenerRolPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const rol = await prisma.rol.findUnique({
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
  } catch (error) {
    console.error("Error al obtener rol:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =========================================================
   Actualizar Rol
   ========================================================= */
export const actualizarRol = async (
  req: Request<{ id: string }, {}, Partial<CrearRolDTO>>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    // Validar existencia
    const rolExistente = await prisma.rol.findUnique({
      where: { id: Number(id) },
    });
    if (!rolExistente) {
      return res.status(404).json({ error: "Rol no encontrado" });
    }

    // Evitar duplicidad de nombre (si lo cambia)
    if (datos.nombre && datos.nombre !== rolExistente.nombre) {
      const duplicado = await prisma.rol.findUnique({
        where: { nombre: datos.nombre },
      });
      if (duplicado) {
        return res.status(409).json({ error: "Ya existe un rol con ese nombre" });
      }
    }

    const rolActualizado = await prisma.rol.update({
      where: { id: Number(id) },
      data: {
        nombre: datos.nombre ?? rolExistente.nombre,
        descripcion: datos.descripcion ?? rolExistente.descripcion,
        activo: datos.activo ?? rolExistente.activo,
      },
    });

    res.status(200).json(rolActualizado);
  } catch (error) {
    console.error("Error al actualizar rol:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =========================================================
   Eliminar (Desactivar) Rol
   ========================================================= */
export const desactivarRol = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const rol = await prisma.rol.findUnique({
      where: { id: Number(id) },
    });

    if (!rol) {
      return res.status(404).json({ error: "Rol no encontrado" });
    }

    await prisma.rol.update({
      where: { id: Number(id) },
      data: { activo: false },
    });

    res.status(200).json({ mensaje: "Rol desactivado correctamente" });
  } catch (error) {
    console.error("Error al eliminar rol:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
