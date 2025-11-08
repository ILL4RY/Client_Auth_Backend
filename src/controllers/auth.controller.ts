import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Interfaz para el usuario en la sesión
declare module 'express-session' {
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
      nro_documento 
    } = req.body;

    // Validar campos requeridos
    if (!nombres || !apellido_p || !correo || !contraseña || !tipo_documento || !nro_documento) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos los campos son obligatorios' 
      });
    }

    // Verificar si el correo ya existe
    const existingUser = await prisma.usuario.findUnique({
      where: { correo }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El correo ya está registrado'
      });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contraseña, salt);

    // Usar una transacción para asegurar la integridad de los datos
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear el usuario
      const user = await tx.usuario.create({
        data: {
          nombres,
          apellido_p,
          apellido_m: apellido_m || '',
          correo,
          contraseña: hashedPassword,
          tipo_documento,
          nro_documento,
          activo: true
        }
      });

      // 2. Verificar que el rol exista
      const roleExists = await tx.rol.findUnique({
        where: { id: 2 }
      });

      if (!roleExists) {
        throw new Error('El rol de usuario no está configurado correctamente');
      }

      // 3. Asignar rol de usuario
      await tx.usuarioRol.create({
        data: {
          usuario_id: user.id,
          rol_id: 2 // Rol de cliente
        }
      });

      return user;
    });

    // Iniciar sesión solo si todo salió bien
    req.session.userId = result.id;
    req.session.isAuth = true;

    // No devolver la contraseña en la respuesta
    const { contraseña: _, ...userWithoutPassword } = result;

    return res.status(201).json({
      success: true,
      user: userWithoutPassword,
      message: 'Usuario registrado exitosamente'
    });
  } catch (error: unknown) {
    console.error('Error en registro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const statusCode = errorMessage.includes('rol de usuario no está configurado') ? 500 : 400;
    
    return res.status(statusCode).json({
      success: false,
      message: 'Error al registrar el usuario',
      error: errorMessage
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { correo, contraseña } = req.body;

    // Validar campos requeridos
    if (!correo || !contraseña) {
      return res.status(400).json({
        success: false,
        message: 'Correo y contraseña son requeridos'
      });
    }

    // Buscar usuario
    const user = await prisma.usuario.findUnique({
      where: { correo }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(contraseña, user.contraseña);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si el usuario está activo
    if (!user.activo) {
      return res.status(403).json({
        success: false,
        message: 'Cuenta desactivada. Por favor, contacte al administrador.'
      });
    }

    // Iniciar sesión
    req.session.userId = user.id;
    req.session.isAuth = true;

    // Registrar dispositivo
    const dispositivoData: any = {
      usuario_id: user.id,
      tipo: req.useragent?.isMobile ? 'móvil' : 'desktop',
      sistema: req.useragent?.platform || 'desconocido',
      navegador: req.useragent?.browser || 'desconocido',
      direccion_ip: req.ip || null,
      estado: 'activo'
    };

    // Asegurarse de que los campos opcionales sean null en lugar de undefined
    if (!dispositivoData.sistema) dispositivoData.sistema = null;
    if (!dispositivoData.navegador) dispositivoData.navegador = null;
    if (!dispositivoData.direccion_ip) dispositivoData.direccion_ip = null;

    await prisma.dispositivo.create({
      data: dispositivoData
    });

    // No devolver la contraseña en la respuesta
    const { contraseña: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      user: userWithoutPassword,
      message: 'Inicio de sesión exitoso'
    });
  } catch (error) {
    console.error('Error en inicio de sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const logout = (req: Request, res: Response) => {
  try {
    // Destruir la sesión
    req.session.destroy((err) => {
      if (err) {
        console.error('Error al cerrar sesión:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al cerrar sesión'
        });
      }
      
      // Limpiar la cookie de sesión
      res.clearCookie('connect.sid');
      
      res.status(200).json({
        success: true,
        message: 'Sesión cerrada correctamente'
      });
    });
  } catch (error) {
    console.error('Error en cierre de sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cerrar sesión',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const checkAuth = (req: Request, res: Response) => {
  try {
    if (req.session.isAuth && req.session.userId) {
      return res.status(200).json({
        success: true,
        isAuthenticated: true,
        userId: req.session.userId
      });
    }
    
    res.status(200).json({
      success: true,
      isAuthenticated: false
    });
  } catch (error) {
    console.error('Error al verificar autenticación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar autenticación',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.session.isAuth || !req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
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
        activo: true,
        created_at: true,
        updated_at: true,
        roles: {
          include: {
            rol: {
              include: {
                permisos: {
                  include: {
                    permiso: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información del usuario',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};