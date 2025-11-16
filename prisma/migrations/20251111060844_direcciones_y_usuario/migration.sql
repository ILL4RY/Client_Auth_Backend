-- CreateTable
CREATE TABLE "direcciones" (
    "id" SERIAL NOT NULL,
    "calle" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "estado" TEXT,
    "pais" TEXT NOT NULL,
    "codigo_postal" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "usuario_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "direcciones_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "direcciones" ADD CONSTRAINT "direcciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
