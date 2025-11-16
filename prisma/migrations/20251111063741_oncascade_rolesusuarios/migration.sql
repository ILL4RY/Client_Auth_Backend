-- DropForeignKey
ALTER TABLE "public"."usuario_rol" DROP CONSTRAINT "usuario_rol_usuario_id_fkey";

-- AddForeignKey
ALTER TABLE "usuario_rol" ADD CONSTRAINT "usuario_rol_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
