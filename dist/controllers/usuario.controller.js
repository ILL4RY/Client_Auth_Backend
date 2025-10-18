"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarUsuario = exports.actualizarUsuario = exports.obtenerUsuarioPorId = exports.listarUsuarios = exports.crearUsuario = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const hash_1 = require("../utils/hash");
/* =========================================================
   Crear usuario
   ========================================================= */
const crearUsuario = async (req, res) => {
    try {
        const { nombres, apellido_p, apellido_m, correo, pais_celular, celular, contraseña, f_nacimiento, tipo_documento, nro_documento, avatar, genero, origen, // agregado: "cliente" o "admin"
         } = req.body;
        // Validar campos obligatorios
        if (!nombres ||
            !apellido_p ||
            !apellido_m ||
            !correo ||
            !contraseña ||
            !tipo_documento ||
            !nro_documento) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }
        // Verificar correo existente
        const existente = await prisma_1.default.usuario.findUnique({ where: { correo } });
        if (existente) {
            return res.status(409).json({ error: "El correo ya está registrado" });
        }
        // Determinar el rol según el origen
        const rolAsignado = origen === "admin" ? "Administrador" : "Cliente";
        const rol = await prisma_1.default.rol.findFirst({ where: { nombre: rolAsignado } });
        if (!rol) {
            return res.status(400).json({ error: `No se encontró el rol ${rolAsignado}` });
        }
        if (!rolAsignado) {
            return res.status(500).json({
                error: `No se encontró el rol "${rolAsignado}" en la base de datos.`,
            });
        }
        // Hashear contraseña
        const contraseñaHasheada = await (0, hash_1.hashPassword)(contraseña);
        // Ejecutar todo en una transacción
        const nuevoUsuario = await prisma_1.default.$transaction(async (tx) => {
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
        res.status(201).json(usuarioSinContraseña);
    }
    catch (error) {
        console.error("❌ Error al crear usuario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
exports.crearUsuario = crearUsuario;
/* =========================================================
   Listar todos los usuarios
   ========================================================= */
const listarUsuarios = async (_req, res) => {
    try {
        const usuarios = await prisma_1.default.usuario.findMany({
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
            },
        });
        res.status(200).json(usuarios);
    }
    catch (error) {
        console.error("Error al listar usuarios:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
exports.listarUsuarios = listarUsuarios;
/* =========================================================
   Obtener usuario por ID
   ========================================================= */
const obtenerUsuarioPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await prisma_1.default.usuario.findUnique({
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
                // 🔹 Incluir relaciones
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
            },
        });
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        // Transformar roles para que se vean más limpios en la respuesta
        const roles_usuario = usuario.roles.map((ur) => ur.rol);
        const { roles, ...resto } = usuario;
        res.status(200).json({
            ...resto,
            roles_usuario,
        });
    }
    catch (error) {
        console.error("❌ Error al obtener usuario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
exports.obtenerUsuarioPorId = obtenerUsuarioPorId;
/* =========================================================
   Actualizar usuario
   ========================================================= */
const actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombres, apellido_p, apellido_m, correo, pais_celular, celular, contraseña, f_nacimiento, tipo_documento, nro_documento, avatar, genero, } = req.body;
        // Validar si el usuario existe antes de actualizar
        const usuarioExistente = await prisma_1.default.usuario.findUnique({
            where: { id: Number(id) },
        });
        if (!usuarioExistente) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        // Si se incluye una nueva contraseña, se hashea
        const contraseñaHasheada = contraseña
            ? await (0, hash_1.hashPassword)(contraseña)
            : undefined;
        // Actualizar solo campos válidos
        const usuarioActualizado = await prisma_1.default.usuario.update({
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
                avatar: avatar ?? usuarioExistente.avatar,
                genero: genero ?? usuarioExistente.genero,
            },
        });
        const { contraseña: _, ...sinContraseña } = usuarioActualizado;
        res.status(200).json(sinContraseña);
    }
    catch (error) {
        if (error.code === "P2002") {
            // Prisma: campo único duplicado
            return res.status(409).json({ error: "El correo ya está registrado" });
        }
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
exports.actualizarUsuario = actualizarUsuario;
/* =========================================================
   Eliminar usuario
   ========================================================= */
const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.usuario.delete({
            where: { id: Number(id) },
        });
        res.status(200).json({ message: "Usuario eliminado correctamente" });
    }
    catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
exports.eliminarUsuario = eliminarUsuario;
//# sourceMappingURL=usuario.controller.js.map