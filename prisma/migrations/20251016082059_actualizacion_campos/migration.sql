/*
  Warnings:

  - Made the column `tipo_documento` on table `usuarios` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nro_documento` on table `usuarios` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "usuarios" ALTER COLUMN "tipo_documento" SET NOT NULL,
ALTER COLUMN "nro_documento" SET NOT NULL;
