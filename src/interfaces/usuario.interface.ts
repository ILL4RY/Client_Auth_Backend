export interface CrearUsuarioDTO {
  nombres: string;
  apellido_p: string;
  apellido_m: string;
  correo: string;
  pais_celular?:string;
  celular?:string;
  contraseña: string;
  f_nacimiento?:string;
  tipo_documento: string;
  nro_documento: string;
  avatar?:string;
  genero?:string
}