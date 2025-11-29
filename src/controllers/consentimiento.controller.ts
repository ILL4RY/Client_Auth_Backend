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

/* =========================================================
   Guardar consentimientos de un usuario (upsert por consentimiento_id)
   ========================================================= */
export const guardarConsentimientosUsuario = async (req: Request, res: Response) => {
  try {
    const { usuarioId } = req.params;
    const { consentimientos } = req.body as { consentimientos?: { consentimiento_id: number; aceptado: boolean }[] };

    if (!consentimientos || !Array.isArray(consentimientos)) {
      return res.status(400).json({ error: "Se requiere un arreglo de consentimientos" });
    }

    const usuario_id = Number(usuarioId);

    const usuarioExiste = await prisma.usuario.findUnique({
      where: { id: usuario_id },
    });

    if (!usuarioExiste) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Procesar secuencialmente para atrapar errores de FK y evitar conflictos
    await prisma.$transaction(async (tx) => {
      for (const item of consentimientos) {
        // Verificar que el consentimiento exista
        const cons = await tx.consentimiento.findUnique({
          where: { id: item.consentimiento_id },
        });
        if (!cons) {
          throw new Error(`Consentimiento ${item.consentimiento_id} no existe`);
        }

        // Buscar si ya existe el registro
        const existente = await tx.usuarioConsentimiento.findUnique({
          where: {
            usuario_id_consentimiento_id: {
              usuario_id,
              consentimiento_id: item.consentimiento_id,
            },
          },
        });

        if (existente) {
          await tx.usuarioConsentimiento.update({
            where: { id: existente.id },
            data: { aceptado: item.aceptado },
          });
        } else {
          await tx.usuarioConsentimiento.create({
            data: {
              usuario_id,
              consentimiento_id: item.consentimiento_id,
              aceptado: item.aceptado,
            },
          });
        }
      }
    });

    const actuales = await prisma.usuarioConsentimiento.findMany({
      where: { usuario_id },
      include: { consentimiento: true },
    });

    res.status(200).json({ mensaje: "Consentimientos actualizados", consentimientos: actuales });
  } catch (error) {
    console.error("Error al guardar consentimientos de usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =========================================================
   Listar consentimientos de un usuario
   ========================================================= */
export const listarConsentimientosUsuario = async (req: Request, res: Response) => {
  try {
    const { usuarioId } = req.params;
    const usuario_id = Number(usuarioId);

    const usuarioExiste = await prisma.usuario.findUnique({
      where: { id: usuario_id },
    });

    if (!usuarioExiste) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const consentimientos = await prisma.usuarioConsentimiento.findMany({
      where: { usuario_id },
      include: { consentimiento: true },
    });

    res.status(200).json(consentimientos);
  } catch (error) {
    console.error("Error al listar consentimientos de usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
