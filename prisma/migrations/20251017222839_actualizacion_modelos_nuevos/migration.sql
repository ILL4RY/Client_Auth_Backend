/*
  Warnings:

  - You are about to drop the column `base_legal` on the `consentimientos` table. All the data in the column will be lost.
  - You are about to drop the column `proposito` on the `consentimientos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "consentimientos" DROP COLUMN "base_legal",
DROP COLUMN "proposito",
ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "obligatorio" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vigente_desde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "vigente_hasta" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "permisos" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "nro_documento" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "preferencias" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "tema" TEXT,
    "idioma" TEXT,
    "notificaciones_on" BOOLEAN NOT NULL DEFAULT true,
    "marketing_emails" BOOLEAN NOT NULL DEFAULT false,
    "privacidad_nivel" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preferencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "tipo" TEXT,
    "fecha_envio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispositivos" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "tipo" TEXT,
    "sistema" TEXT,
    "navegador" TEXT,
    "direccion_ip" TEXT,
    "ultimo_acceso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT,

    CONSTRAINT "dispositivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listas_deseos" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL DEFAULT 'Lista principal',
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listas_deseos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items_lista_deseos" (
    "id" SERIAL NOT NULL,
    "lista_id" INTEGER NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "items_lista_deseos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_consentimientos" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "consentimiento_id" INTEGER NOT NULL,
    "aceptado" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_consentimientos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "preferencias_usuario_id_key" ON "preferencias"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "listas_deseos_usuario_id_key" ON "listas_deseos"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_consentimientos_usuario_id_consentimiento_id_key" ON "usuarios_consentimientos"("usuario_id", "consentimiento_id");

-- AddForeignKey
ALTER TABLE "preferencias" ADD CONSTRAINT "preferencias_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispositivos" ADD CONSTRAINT "dispositivos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listas_deseos" ADD CONSTRAINT "listas_deseos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_lista_deseos" ADD CONSTRAINT "items_lista_deseos_lista_id_fkey" FOREIGN KEY ("lista_id") REFERENCES "listas_deseos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_consentimientos" ADD CONSTRAINT "usuarios_consentimientos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_consentimientos" ADD CONSTRAINT "usuarios_consentimientos_consentimiento_id_fkey" FOREIGN KEY ("consentimiento_id") REFERENCES "consentimientos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
