/*
  Warnings:

  - A unique constraint covering the columns `[nombre]` on the table `roles` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");
