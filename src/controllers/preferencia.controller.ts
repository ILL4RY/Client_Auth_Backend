import { Request, Response } from "express";
import  prisma  from "../config/prisma";
import { CrearPreferenciaDTO } from "../interfaces/preferencia.interface";

/* =========================================================
   🧩 Crear preferencia
   ========================================================= */
export const crearPreferencia = async (
  req: Request<{}, {}, CrearPreferenciaDTO>,
  res: Response
) => {
  try {
    const {
      usuario_id,
      tema,
      idioma,
      notificaciones_on = true,
      marketing_emails = false,
      privacidad_nivel,
    } = req.body;

    if (!usuario_id) {
      return res.status(400).json({ error: "El campo 'usuario_id' es obligatorio" });
    }

    // Verificar si el usuario existe
    const usuarioExiste = await prisma.usuario.findUnique({
      where: { id: usuario_id },
    });

    if (!usuarioExiste) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Verificar si ya tiene una preferencia creada
    const preferenciaExistente = await prisma.preferencia.findUnique({
      where: { usuario_id },
    });

    if (preferenciaExistente) {
      return res.status(409).json({ error: "El usuario ya tiene una preferencia configurada" });
    }

    const nueva = await prisma.preferencia.create({
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
  } catch (error) {
    console.error("Error al crear preferencia:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =========================================================
   📋 Listar todas las preferencias
   ========================================================= */
export const listarPreferencias = async (_req: Request, res: Response) => {
  try {
    const preferencias = await prisma.preferencia.findMany({
      include: {
        usuario: {
          select: { id: true, nombres: true, correo: true },
        },
      },
      orderBy: { id: "asc" },
    });

    res.status(200).json(preferencias);
  } catch (error) {
    console.error("Error al listar preferencias:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =========================================================
   🔍 Obtener preferencia por ID
   ========================================================= */
export const obtenerPreferenciaPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const preferencia = await prisma.preferencia.findUnique({
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
  } catch (error) {
    console.error("Error al obtener preferencia:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =========================================================
   ✏️ Actualizar preferencia
   ========================================================= */
export const actualizarPreferencia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    const preferenciaActualizada = await prisma.preferencia.update({
      where: { id: Number(id) },
      data: {
        tema: datos.tema ?? undefined,
        idioma: datos.idioma ?? undefined,
        notificaciones_on:
          datos.notificaciones_on !== undefined ? datos.notificaciones_on : undefined,
        marketing_emails:
          datos.marketing_emails !== undefined ? datos.marketing_emails : undefined,
        privacidad_nivel: datos.privacidad_nivel ?? undefined,
      },
    });

    res.status(200).json(preferenciaActualizada);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Preferencia no encontrada" });
    }

    console.error("Error al actualizar preferencia:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =========================================================
   🗑️ Eliminar preferencia
   ========================================================= */
export const eliminarPreferencia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.preferencia.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ mensaje: "Preferencia eliminada correctamente" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Preferencia no encontrada" });
    }

    console.error("Error al eliminar preferencia:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
