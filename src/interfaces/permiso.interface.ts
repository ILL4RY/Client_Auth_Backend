export interface CrearPermisoDTO {
  nombre: string;
  descripcion: string;
  activo?: boolean; // opcional, por defecto true
}