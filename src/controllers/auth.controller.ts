import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { sendPasswordResetEmail } from "../utils/email";
import { generateResetToken, getResetExpiration } from "../utils/resetToken";
import { formatearUsuario } from "../utils/formatearUsuario";

const prisma = new PrismaClient();

// Interfaz para el usuario en la sesión
declare module "express-session" {
  interface SessionData {
    userId?: number;
    isAuth?: boolean;
  }
}

export const register = async (req: Request, res: Response) => {
  try {
    const {
      nombres,
      apellido_p,
      apellido_m,
      correo,
      contraseña,
      tipo_documento,
      nro_documento,
    } = req.body as any;

    if (!nombres || !apellido_p || !correo || !contraseña || !tipo_documento || !nro_documento) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son obligatorios",
      });
    }

    const existingUser = await prisma.usuario.findUnique({
      where: { correo },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "El correo ya está registrado",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contraseña, salt);

    const newUser = await prisma.usuario.create({
      data: {
        nombres,
        apellido_p,
        apellido_m,
        correo,
        contraseña: hashedPassword,
        tipo_documento,
        nro_documento,
        activo: true,
      },
    });

    // Asignar rol por defecto (cliente id 2) si existe
    try {
      await prisma.usuarioRol.create({
        data: {
          usuario_id: newUser.id,
          rol_id: 2,
        },
      });
    } catch (e) {
      console.warn("No se pudo asignar rol por defecto al usuario", e);
    }

    req.session.userId = newUser.id;
    req.session.isAuth = true;

    const { contraseña: _omit, ...userWithoutPassword } = newUser as any;

    return res.status(201).json({
      success: true,
      user: userWithoutPassword,
      message: "Usuario registrado exitosamente",
    });
  } catch (error: unknown) {
    console.error("Error en registro:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    const statusCode = errorMessage.includes("rol de usuario no está configurado") ? 500 : 400;

    return res.status(statusCode).json({
      success: false,
      message: "Error al registrar el usuario",
      error: errorMessage,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { correo, contraseña } = req.body as any;

    if (!correo || !contraseña) {
      return res.status(400).json({
        success: false,
        message: "Correo y contraseña son requeridos",
      });
    }

    const user = await prisma.usuario.findUnique({ where: { correo } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    const isMatch = await bcrypt.compare(contraseña, user.contraseña);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    if (!user.activo) {
      return res.status(403).json({
        success: false,
        message: "Cuenta desactivada. Por favor, contacte al administrador.",
      });
    }

    req.session.userId = user.id;
    req.session.isAuth = true;

    req.session.save(async (err) => {
      if (err) {
        console.error("Error guardando sesión:", err);
        return res.status(500).json({
          success: false,
          message: "No se pudo guardar la sesión",
        });
      }

      // Obtener la URL del avatar
      const avatar_url = user.avatar
        ? `${process.env.BASE_URL}/uploads/avatars/${user.avatar}`
        : "";

      const dispositivoData: any = {
        usuario_id: user.id,
        tipo: (req as any).useragent?.isMobile ? "móvil" : "desktop",
        sistema: (req as any).useragent?.platform || null,
        navegador: (req as any).useragent?.browser || null,
        direccion_ip: req.ip || null,
        estado: "activo",
      };

      await prisma.dispositivo.create({ data: dispositivoData });

      const { contraseña: _omitPass, ...userWithoutPassword } = user as any;

      return res.status(200).json({
        success: true,
        user: {
          ...userWithoutPassword,
          avatar_url: avatar_url, // Incluir el avatar_url en la respuesta
        },
        message: "Inicio de sesión exitoso",
      });
    });
  } catch (error) {
    console.error("Error en inicio de sesión:", error);
    res.status(500).json({
      success: false,
      message: "Error al iniciar sesión",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

export const logout = (req: Request, res: Response) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error al cerrar sesión:", err);
        return res.status(500).json({
          success: false,
          message: "Error al cerrar sesión",
        });
      }

      res.clearCookie("connect.sid");

      res.status(200).json({
        success: true,
        message: "Sesión cerrada correctamente",
      });
    });
  } catch (error) {
    console.error("Error en cierre de sesión:", error);
    res.status(500).json({
      success: false,
      message: "Error al cerrar sesión",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

export const checkAuth = (req: Request, res: Response) => {
  try {
    if (req.session.isAuth && req.session.userId) {
      return res.status(200).json({
        success: true,
        isAuthenticated: true,
        userId: req.session.userId,
      });
    }

    res.status(200).json({
      success: true,
      isAuthenticated: false,
    });
  } catch (error) {
    console.error("Error al verificar autenticación:", error);
    res.status(500).json({
      success: false,
      message: "Error al verificar autenticación",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.session.isAuth || !req.session.userId) {
      return res.status(401).json({
        success: false,
        message: "No autenticado",
      });
    }

    const user = await prisma.usuario.findUnique({
      where: { id: req.session.userId },
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
        updated_at: true,
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

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Construir la URL completa del avatar
    const avatar_url = user.avatar
      ? `${process.env.BASE_URL}/uploads/avatars/${user.avatar}`
      : "";

    res.status(200).json({
      success: true,
      user: {
        ...user,
        avatar_url: avatar_url, // Añadir la URL del avatar a la respuesta
      },
    });

  } catch (error) {
    console.error("Error al obtener usuario actual:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener información del usuario",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

// Flujo de recuperación de contraseña
export const forgotPassword = async (req: Request, res: Response) => {
  const { correo } = req.body;

  if (!correo) {
    return res.status(400).json({
      success: false,
      message: "El correo es obligatorio",
    });
  }

  const genericMessage = "Si el correo es válido, enviaremos un enlace de recuperación.";

  try {
    const user = await prisma.usuario.findUnique({
      where: { correo },
    });

    if (!user || !user.activo) {
      return res.status(200).json({
        success: true,
        message: genericMessage,
      });
    }

    const token = generateResetToken();
    const expires_at = getResetExpiration();

    await prisma.$transaction(async (tx) => {
      await tx.passwordReset.updateMany({
        where: {
          usuario_id: user.id,
          used_at: null,
          expires_at: { gt: new Date() },
        },
        data: {
          used_at: new Date(),
        },
      });

      await tx.passwordReset.create({
        data: {
          usuario_id: user.id,
          token,
          expires_at,
          ip_origen: req.ip || null,
          user_agent: (req.headers["user-agent"] as string) || null,
        },
      });
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    await sendPasswordResetEmail({
      to: user.correo,
      resetUrl,
    });

    return res.status(200).json({
      success: true,
      message: genericMessage,
    });
  } catch (error) {
    console.error("Error al generar recuperación:", error);
    return res.status(500).json({
      success: false,
      message: "No se pudo procesar la solicitud",
    });
  }
};

export const validateResetToken = async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res.status(400).json({
      success: false,
      message: "Token requerido",
    });
  }

  try {
    const resetRow = await prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!resetRow || resetRow.used_at) {
      return res.status(400).json({
        success: false,
        message: "Enlace inválido",
      });
    }

    if (resetRow.expires_at < new Date()) {
      return res.status(410).json({
        success: false,
        message: "Enlace expirado",
      });
    }

    return res.status(200).json({
      success: true,
      valid: true,
    });
  } catch (error) {
    console.error("Error al validar token:", error);
    return res.status(500).json({
      success: false,
      message: "No se pudo validar el enlace",
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, nuevaContrasena } = req.body as any;

  if (!token || !nuevaContrasena) {
    return res.status(400).json({
      success: false,
      message: "Token y nueva contraseña son obligatorios",
    });
  }

  try {
    const resetRow = await prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!resetRow || resetRow.used_at) {
      return res.status(400).json({
        success: false,
        message: "Enlace inválido",
      });
    }

    if (resetRow.expires_at < new Date()) {
      return res.status(410).json({
        success: false,
        message: "Enlace expirado",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nuevaContrasena, salt);

    await prisma.$transaction(async (tx) => {
      await tx.usuario.update({
        where: { id: resetRow.usuario_id },
        data: { contraseña: hashedPassword },
      });

      await tx.passwordReset.update({
        where: { id: resetRow.id },
        data: { used_at: new Date() },
      });

      await tx.passwordReset.updateMany({
        where: {
          usuario_id: resetRow.usuario_id,
          used_at: null,
          expires_at: { gt: new Date() },
        },
        data: { used_at: new Date() },
      });
    });

    return res.status(200).json({
      success: true,
      message: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    console.error("Error al reestablecer contraseña:", error);
    return res.status(500).json({
      success: false,
      message: "No se pudo reestablecer la contraseña",
    });
  }
};
