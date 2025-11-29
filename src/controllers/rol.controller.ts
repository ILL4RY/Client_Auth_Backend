import { Request, Response } from "express";
import prisma from "../config/prisma";
import { CrearRolDTO } from "../interfaces/rol.interface";

export interface AsignarRolDTO {
  usuario_id: number;
  rol_id: number;
}

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

    // Desactivar el rol (soft delete)
    const rolActualizado = await prisma.rol.update({
      where: { id: Number(id) },
      data: { activo: false },
    });

    res.json(rolActualizado);
  } catch (error) {
    console.error("Error al desactivar rol:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =========================================================
   Asignar Rol a Usuario
   ========================================================= */
export const asignarRolUsuario = async (
  req: Request<{}, {}, { usuario_id: number; rol: 1 | 2 }>,
  res: Response
) => {
  try {
    const { usuario_id, rol = 1 } = req.body; // Default to 1 (user) if not provided

    // Validate that usuario_id is provided
    if (!usuario_id) {
      return res.status(400).json({ error: "Se requiere el ID del usuario" });
    }

    // Validate that rol is either 1 or 2
    if (rol !== 1 && rol !== 2) {
      return res.status(400).json({ 
        error: "Rol no válido. Solo se permiten los roles 1 (user) o 2 (admin)" 
      });
    }

    try {
      // Update the user's role using a raw query to avoid type issues
      const result = await prisma.$executeRaw<number>`
        UPDATE usuarios 
        SET rol_int = ${rol}, updated_at = NOW()
        WHERE id = ${usuario_id}
      `;

      // If no rows were updated
      if (result === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      // Fetch the updated user to return
      const usuarioActualizado = await prisma.$queryRaw<Array<{
        id: number;
        nombres: string;
        apellido_p: string;
        apellido_m: string;
        correo: string;
        rolInt: number;
        updated_at: Date;
      }>>`
        SELECT id, nombres, apellido_p, apellido_m, correo, rol_int as "rolInt", updated_at
        FROM usuarios 
        WHERE id = ${usuario_id}
      `;

      if (!usuarioActualizado || usuarioActualizado.length === 0) {
        return res.status(404).json({ error: "No se pudo recuperar el usuario actualizado" });
      }

      res.status(200).json({
        mensaje: "Rol actualizado correctamente",
        usuario: {
          ...usuarioActualizado[0],
          rol: usuarioActualizado[0]?.rolInt === 1 ? 'user' : 'admin'
        }
      });
    } catch (dbError: any) {
      // Check if the error is because the column doesn't exist
      if (dbError.message?.includes('column "rol_int" does not exist')) {
        return res.status(500).json({ 
          error: "El campo rol_int no existe en la base de datos. Ejecuta la migración primero." 
        });
      }
      console.error("Error en la base de datos:", dbError);
      throw dbError;
    }
  } catch (error) {
    console.error("Error al asignar rol:", error);
    res.status(500).json({ error: "Error interno del servidor al asignar el rol" });
  }
};
