import { Request, Response } from "express";
import prisma from "../config/prisma";
import { CrearConsentimientoDTO } from "../interfaces/consentimiento.interface";

/* =========================================================
   Crear consentimiento
   ========================================================= */
export const crearConsentimiento = async (
  req: Request<{}, {}, CrearConsentimientoDTO>,
  res: Response
) => {
  try {
    const {
      nombre,
      descripcion,
      obligatorio = false,
      vigente_desde,
      vigente_hasta,
      activo = true,
    } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: "El campo 'nombre' es obligatorio" });
    }

    // Validar duplicados
    const existente = await prisma.consentimiento.findFirst({
      where: { nombre },
    });

    if (existente) {
      return res.status(409).json({ error: "Ya existe un consentimiento con ese nombre" });
    }

    const nuevo = await prisma.consentimiento.create({
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
  } catch (error) {
    console.error("Error al crear consentimiento:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =========================================================
   Listar todos los consentimientos
   ========================================================= */
export const listarConsentimientos = async (_req: Request, res: Response) => {
  try {
    const consentimientos = await prisma.consentimiento.findMany({
      orderBy: { id: "asc" },
    });

    res.status(200).json(consentimientos);
  } catch (error) {
    console.error("Error al listar consentimientos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =========================================================
   Obtener consentimiento por ID
   ========================================================= */
export const obtenerConsentimientoPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const consentimiento = await prisma.consentimiento.findUnique({
      where: { id: Number(id) },
    });

    if (!consentimiento) {
      return res.status(404).json({ error: "Consentimiento no encontrado" });
    }

    res.status(200).json(consentimiento);
  } catch (error) {
    console.error("Error al obtener consentimiento:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =========================================================
   Actualizar consentimiento
   ========================================================= */
export const actualizarConsentimiento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    const consentimientoActualizado = await prisma.consentimiento.update({
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
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Consentimiento no encontrado" });
    }

    console.error("Error al actualizar consentimiento:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =========================================================
   Eliminar consentimiento
   ========================================================= */
export const eliminarConsentimiento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.consentimiento.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ mensaje: "Consentimiento eliminado correctamente" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Consentimiento no encontrado" });
    }

    console.error("Error al eliminar consentimiento:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
