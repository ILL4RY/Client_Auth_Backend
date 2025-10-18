import { Request, Response } from "express";
import { CrearPermisoDTO } from "../interfaces/permiso.interface";
export declare const listarPermisos: (req: Request, res: Response) => Promise<void>;
export declare const obtenerPermisoPorId: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const crearPermiso: (req: Request<{}, {}, CrearPermisoDTO>, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const actualizarPermiso: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const eliminarPermiso: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=permiso.controller.d.ts.map