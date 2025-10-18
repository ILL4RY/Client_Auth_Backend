export interface CrearRolDTO {
  nombre: string;
  descripcion: string;
  activo?: boolean; // opcional, por defecto será true
}