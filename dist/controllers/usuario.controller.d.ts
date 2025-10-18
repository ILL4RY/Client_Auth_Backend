import { Request, Response } from "express";
import { CrearUsuarioDTO } from "../interfaces/usuario.interface";
export declare const crearUsuario: (req: Request<{}, {}, CrearUsuarioDTO & {
    origen?: string;
}>, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const listarUsuarios: (_req: Request, res: Response) => Promise<void>;
export declare const obtenerUsuarioPorId: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const actualizarUsuario: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const eliminarUsuario: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=usuario.controller.d.ts.map