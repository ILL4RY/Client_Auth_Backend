/*
  Warnings:

  - Changed the type of `nro_documento` on the `usuarios` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "nro_documento",
ADD COLUMN     "nro_documento" INTEGER NOT NULL;
