// src/controllers/direccion.controller.ts
import { Request, Response } from "express";
import prisma from "../config/prisma";
import { CrearDireccionDTO, ActualizarDireccionDTO } from "../interfaces/direccion.interface";

/* =========================================================
   Crear dirección
========================================================= */
export const crearDireccion = async (req: Request<{}, {}, CrearDireccionDTO>, res: Response) => {
  try {
    const { calle, ciudad, estado, pais, codigo_postal, isDefault, usuario_id } = req.body;

    // Validar usuario existente
    const usuario = await prisma.usuario.findUnique({ where: { id: usuario_id } });
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Si isDefault es true, desactivar otras direcciones por defecto
    if (isDefault) {
      await prisma.direccion.updateMany({
        where: { usuario_id },
        data: { isDefault: false },
      });
    }

    const direccion = await prisma.direccion.create({
      data: {
        calle,
        ciudad,
        pais,
        isDefault: isDefault ?? false,
        usuario_id,
        ...(estado && { estado }),
        ...(codigo_postal && { codigo_postal }),
      },
    });

    res.status(201).json(direccion);
  } catch (error) {
    console.error("❌ Error al crear dirección:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =========================================================
   Listar direcciones de un usuario
========================================================= */
export const listarDireccionesPorUsuario = async (req: Request, res: Response) => {
  try {
    const { usuario_id } = req.params;

    const direcciones = await prisma.direccion.findMany({
      where: { usuario_id: Number(usuario_id) },
      orderBy: { isDefault: "desc" },
    });

    res.status(200).json(direcciones);
  } catch (error) {
    console.error("❌ Error al listar direcciones:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =========================================================
   Actualizar dirección
========================================================= */
export const actualizarDireccion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: ActualizarDireccionDTO = req.body;

    const direccionExistente = await prisma.direccion.findUnique({
      where: { id: Number(id) },
    });
    if (!direccionExistente) {
      return res.status(404).json({ error: "Dirección no encontrada" });
    }

    // Si se va a establecer como predeterminada, actualizar las demás
    if (data.isDefault) {
      await prisma.direccion.updateMany({
        where: { usuario_id: direccionExistente.usuario_id },
        data: { isDefault: false },
      });
    }

    const direccionActualizada = await prisma.direccion.update({
      where: { id: Number(id) },
      data,
    });

    res.status(200).json(direccionActualizada);
  } catch (error) {
    console.error("❌ Error al actualizar dirección:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =========================================================
   Eliminar dirección
========================================================= */
export const eliminarDireccion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.direccion.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "Dirección eliminada correctamente" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Dirección no encontrada" });
    }
    console.error("❌ Error al eliminar dirección:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};