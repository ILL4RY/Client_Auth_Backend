/*
  Warnings:

  - You are about to drop the column `apellidos` on the `usuarios` table. All the data in the column will be lost.
  - Added the required column `apellido_m` to the `usuarios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `apellido_p` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "apellidos",
ADD COLUMN     "apellido_m" TEXT NOT NULL,
ADD COLUMN     "apellido_p" TEXT NOT NULL;
