-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "pais_celular" TEXT,
    "celular" TEXT,
    "contraseña" TEXT NOT NULL,
    "f_nacimiento" TIMESTAMP(3),
    "tipo_documento" TEXT,
    "nro_documento" TEXT,
    "avatar" TEXT,
    "genero" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");
