export interface CrearConsentimientoDTO {
  nombre: string;
  descripcion?: string;
  obligatorio?: boolean;
  vigente_desde?: Date;
  vigente_hasta?: Date | null;
  activo?: boolean;
}