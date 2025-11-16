// src/controllers/direccion.controller.ts
import { Request, Response } from "express";
import prisma from "../config/prisma";
import {
  CrearDireccionDTO,
  ActualizarDireccionDTO,
} from "../interfaces/direccion.interface";

/* =========================================================
   Crear dirección
========================================================= */
export const crearDireccion = async (
  req: Request<{}, {}, CrearDireccionDTO>,
  res: Response
) => {
  try {
    const {
      calle,
      ciudad,
      estado,
      pais,
      codigo_postal,
      isDefault,
      usuario_id,
    } = req.body;

    // Validación de campos obligatorios
    if (!usuario_id)
      return res
        .status(400)
        .json({ error: "El campo 'usuario_id' es obligatorio." });

    if (!calle || !ciudad || !pais) {
      return res.status(400).json({
        error: "Los campos 'calle', 'ciudad' y 'pais' son obligatorios.",
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(usuario_id) },
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Transacción para garantizar consistencia de direcciones default
    const nuevaDireccion = await prisma.$transaction(async (tx) => {
      // Si será default → desactivar las demás
      if (isDefault) {
        await tx.direccion.updateMany({
          where: { usuario_id: Number(usuario_id) },
          data: { isDefault: false },
        });
      }

      // Crear dirección
      const direccion = await tx.direccion.create({
        data: {
          calle,
          ciudad,
          pais,
          isDefault: isDefault ?? false,
          usuario_id: Number(usuario_id),
          ...(estado && { estado }),
          ...(codigo_postal && { codigo_postal }),
        },
        include: { usuario: true },
      });

      return direccion;
    });

    res.status(201).json({
      message: `Dirección creada correctamente para el usuario ${nuevaDireccion.usuario.nombres}.`,
      direccion: nuevaDireccion,
    });
  } catch (error) {
    console.error("❌ Error al crear dirección:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =========================================================
   Listar direcciones de un usuario
========================================================= */
export const listarDireccionesPorUsuario = async (
  req: Request,
  res: Response
) => {
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
      include: { usuario: true },
    });

    if (!direccionExistente) {
      return res.status(404).json({ error: "Dirección no encontrada" });
    }

    const usuario_id = direccionExistente.usuario_id;

    const direccionActualizada = await prisma.$transaction(async (tx) => {
      // Si se marcará como default → limpiar las demás
      if (data.isDefault) {
        await tx.direccion.updateMany({
          where: { usuario_id },
          data: { isDefault: false },
        });
      }

      // Evitamos permitir isDefault: false desde cliente
      // Solo se puede "quitar default" si se asigna otra como default.
      if (data.isDefault === false) {
        delete (data as any).isDefault;
      }

      return tx.direccion.update({
        where: { id: Number(id) },
        data,
        include: { usuario: true },
      });
    });

    res.status(200).json({
      message: `Dirección actualizada correctamente para el usuario ${direccionActualizada.usuario.nombres}.`,
      direccion: direccionActualizada,
    });
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

    const direccion = await prisma.direccion.findUnique({
      where: { id: Number(id) },
      include: { usuario: true },
    });

    if (!direccion) {
      return res.status(404).json({ error: "Dirección no encontrada" });
    }

    const usuario_id = direccion.usuario_id;

    await prisma.$transaction(async (tx) => {
      // Eliminar la dirección
      await tx.direccion.delete({
        where: { id: Number(id) },
      });

      // Si era default → asignar otra automáticamente
      if (direccion.isDefault) {
        const otraDireccion = await tx.direccion.findFirst({
          where: { usuario_id },
        });

        if (otraDireccion) {
          await tx.direccion.update({
            where: { id: otraDireccion.id },
            data: { isDefault: true },
          });
        }
      }
    });

    res.status(200).json({
      message: `Dirección eliminada correctamente. Pertenecía al usuario ${direccion.usuario.nombres}.`,
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Dirección no encontrada" });
    }

    console.error("❌ Error al eliminar dirección:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =========================================================
   Establecer dirección como predeterminada
========================================================= */
export const establecerDireccionPredeterminada = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const direccion = await prisma.direccion.findUnique({
      where: { id: Number(id) },
    });

    if (!direccion) {
      return res.status(404).json({ error: "Dirección no encontrada" });
    }

    const usuario_id = direccion.usuario_id;

    // Transacción: desactivar todas y activar esta
    const direccionActualizada = await prisma.$transaction(async (tx) => {
      // 1. Desactivar todas las direcciones del usuario
      await tx.direccion.updateMany({
        where: { usuario_id },
        data: { isDefault: false },
      });

      // 2. Activar esta como default
      return tx.direccion.update({
        where: { id: Number(id) },
        data: { isDefault: true },
      });
    });

    res.status(200).json({
      message: "Dirección establecida como predeterminada correctamente.",
      direccion: direccionActualizada,
    });
  } catch (error) {
    console.error("❌ Error al establecer dirección predeterminada:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
