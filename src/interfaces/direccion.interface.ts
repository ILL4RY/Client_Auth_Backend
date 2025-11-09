// src/interfaces/direccion.interface.ts
export interface CrearDireccionDTO {
  calle: string;
  ciudad: string;
  estado?: string;
  pais: string;
  codigo_postal?: string;
  isDefault?: boolean;
  usuario_id: number;
}

export interface ActualizarDireccionDTO {
  calle?: string;
  ciudad?: string;
  estado?: string;
  pais?: string;
  codigo_postal?: string;
  isDefault?: boolean;
}
