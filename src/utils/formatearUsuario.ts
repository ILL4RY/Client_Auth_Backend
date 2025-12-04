import { Usuario } from "@prisma/client";

export const formatearUsuario = (usuario: any) => {
  if (!usuario) return null;

  const { contraseña, avatar, ...resto } = usuario;

  const tieneAvatar = avatar && avatar.trim() !== "";

  return {
    ...resto,
    avatar: tieneAvatar ? avatar : "",
    avatar_url: tieneAvatar
      ? `${process.env.BASE_URL}/uploads/avatars/${avatar}`
      : "",
  };
};