import { Request, Response } from "express";
import prisma from "../config/prisma";
import { CrearUsuarioDTO } from "../interfaces/usuario.interface";
import { hashPassword } from "../utils/hash";
import { formatearUsuario } from "../utils/formatearUsuario";

import fs from "fs";
import path from "path";

/* =========================================================
   Crear usuario
   ========================================================= */
export const crearUsuario = async (
  req: Request<{}, {}, CrearUsuarioDTO & { origen?: string }>,
  res: Response
) => {
  try {
    const {
      nombres,
      apellido_p,
      apellido_m,
      correo,
      pais_celular,
      celular,
      contraseña,
      f_nacimiento,
      tipo_documento,
      nro_documento,
      avatar,
      genero,
      origen, // agregado: "cliente" o "admin"
    } = req.body;

    // Validar campos obligatorios
    if (
      !nombres ||
      !apellido_p ||
      !apellido_m ||
      !correo ||
      !contraseña ||
      !tipo_documento ||
      !nro_documento
    ) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Verificar correo existente
    const existente = await prisma.usuario.findUnique({ where: { correo } });
    if (existente) {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }

    // Determinar el rol según el origen
    const rolAsignado = origen === "Admin" ? "Administrador" : "Cliente";
    const rol = await prisma.rol.findFirst({ where: { nombre: rolAsignado } });

    if (!rol) {
      return res.status(400).json({ error: `No se encontró el rol ${rolAsignado}` });
    }

    if (!rolAsignado) {
      return res.status(500).json({
        error: `No se encontró el rol "${rolAsignado}" en la base de datos.`,
      });
    }

    // Hashear contraseña
    const contraseñaHasheada = await hashPassword(contraseña);

    // Ejecutar todo en una transacción
    const nuevoUsuario = await prisma.$transaction(async (tx: any) => {
      // Crear usuario
      const usuario = await tx.usuario.create({
        data: {
          nombres,
          apellido_p,
          apellido_m,
          correo,
          pais_celular: pais_celular ?? null,
          celular: celular ?? null,
          contraseña: contraseñaHasheada,
          f_nacimiento: f_nacimiento ? new Date(f_nacimiento) : null,
          tipo_documento,
          nro_documento,
          avatar: avatar ?? null,
          genero: genero ?? null,
        },
      });

      // Crear preferencia
      await tx.preferencia.create({
        data: {
          usuario_id: usuario.id,
          tema: "claro",
          idioma: "es",
          notificaciones_on: true,
          marketing_emails: false,
          privacidad_nivel: "básico",
        },
      });

      // Asignar rol
      await tx.usuarioRol.create({
        data: {
          usuario_id: usuario.id,
          rol_id: rol.id,
        },
      });

      // Retornar usuario con sus relaciones
      return tx.usuario.findUnique({
        where: { id: usuario.id },
        include: {
          preferencias: true,
          roles: {
            include: {
              rol: true,
            },
          },
        },
      });
    });

    // 🧹 Remover contraseña antes de responder
    if (!nuevoUsuario) {
      return res.status(500).json({ error: "Error al crear el usuario" });
    }

    const { contraseña: _, ...usuarioSinContraseña } = nuevoUsuario;

    res.status(201).json(formatearUsuario(usuarioSinContraseña));

  } catch (error) {
    console.error("❌ Error al crear usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =========================================================
   Listar todos los usuarios
   ========================================================= */
export const listarUsuarios = async (_req: Request, res: Response) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombres: true,
        apellido_p: true,
        apellido_m: true,
        correo: true,
        pais_celular: true,
        celular: true,
        f_nacimiento: true,
        tipo_documento: true,
        nro_documento: true,
        avatar: true,
        genero: true,
        created_at: true,
        updated_at:true,

        // 🔽 Incluimos los roles del usuario
        roles: {
          select: {
            rol: {
              select: {
                id: true,
                nombre: true,
                descripcion: true,
                activo: true,
              },
            },
          },
        },
      },
    });

    // 🔄 Mapeamos el resultado para simplificar la respuesta (roles como array de objetos)
    const usuariosConRoles = usuarios.map((usuario: any) => ({
      ...usuario,
      roles: usuario.roles.map((ur: any) => ur.rol),
    }));

    res.status(200).json(
      usuariosConRoles.map((usuario: any) => formatearUsuario(usuario))
    );

  } catch (error) {
    console.error("Error al listar usuarios:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =========================================================
   Obtener usuario por ID
   ========================================================= */
export const obtenerUsuarioPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        nombres: true,
        apellido_p: true,
        apellido_m: true,
        correo: true,
        pais_celular: true,
        celular: true,
        f_nacimiento: true,
        tipo_documento: true,
        nro_documento: true,
        avatar: true,
        genero: true,
        created_at: true,
        updated_at:true,
        preferencias: {
          select: {
            tema: true,
            idioma: true,
            notificaciones_on: true,
            marketing_emails: true,
            privacidad_nivel: true,
          },
        },
        roles: {
          select: {
            rol: {
              select: {
                id: true,
                nombre: true,
                descripcion: true,
              },
            },
          },
        },
        // 🔹 Incluir las direcciones
        direcciones: {
          select: {
            id: true,
            calle: true,
            ciudad: true,
            estado: true,
            pais: true,
            codigo_postal: true,
            isDefault: true,
          },
        },
      },
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    /*return */res.json(formatearUsuario(usuario));
  } catch (error) {
    console.error("❌ Error al obtener usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =========================================================
   Actualizar usuario
   ========================================================= */
export const actualizarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      nombres,
      apellido_p,
      apellido_m,
      correo,
      pais_celular,
      celular,
      contraseña,
      f_nacimiento,
      tipo_documento,
      nro_documento,
      genero,
    } = req.body;

    // Verificar si existe usuario
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: Number(id) },
    });

    if (!usuarioExistente) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // ===============================
    // Manejo de avatar (nuevo + borrar anterior)
    // ===============================
    let nuevoAvatar = usuarioExistente.avatar;

    if (req.file) {
      // Guardamos nuevo nombre de archivo
      nuevoAvatar = req.file.filename;

      // Si el usuario tenía un avatar anterior → eliminarlo
      if (usuarioExistente.avatar) {
        const rutaAnterior = path.join(
          __dirname,
          "../../uploads/avatars/",
          usuarioExistente.avatar
        );

        if (fs.existsSync(rutaAnterior)) {
          fs.unlinkSync(rutaAnterior);
        }
      }
    }

    // ===============================
    // Manejo contraseña
    // ===============================
    const contraseñaHasheada = contraseña
      ? await hashPassword(contraseña)
      : undefined;

    // ===============================
    // Actualizar usuario
    // ===============================
    const usuarioActualizado = await prisma.usuario.update({
      where: { id: Number(id) },
      data: {
        nombres: nombres ?? usuarioExistente.nombres,
        apellido_p: apellido_p ?? usuarioExistente.apellido_p,
        apellido_m: apellido_m ?? usuarioExistente.apellido_m,
        correo: correo ?? usuarioExistente.correo,
        pais_celular: pais_celular ?? usuarioExistente.pais_celular,
        celular: celular ?? usuarioExistente.celular,
        contraseña: contraseñaHasheada ?? usuarioExistente.contraseña,
        f_nacimiento: f_nacimiento
          ? new Date(f_nacimiento)
          : usuarioExistente.f_nacimiento,
        tipo_documento: tipo_documento ?? usuarioExistente.tipo_documento,
        nro_documento: nro_documento ?? usuarioExistente.nro_documento,
        avatar: nuevoAvatar,
        genero: genero ?? usuarioExistente.genero,
      },
    });

    res.status(200).json(formatearUsuario(usuarioActualizado));

  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }

    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


/* =========================================================
   Eliminar usuario
   ========================================================= */
export const eliminarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.usuario.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =========================================================
   Exportar datos del usuario (perfil + preferencias + consentimientos)
   ========================================================= */
export const exportarDatosUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuarioId = Number(id);

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        preferencias: true,
        consentimientos: {
          include: { consentimiento: true },
        },
        direcciones: true,
        roles: {
          include: { rol: true },
        },
      },
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Excluir contraseña
    const { ["contrase\u00f1a"]: _omit, ...usuarioSinPassword } = usuario as any;

    res.status(200).json({
      exportado_en: new Date().toISOString(),
      usuario: formatearUsuario(usuarioSinPassword),
    });
  } catch (error) {
    console.error("Error al exportar datos de usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


