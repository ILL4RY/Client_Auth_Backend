import { Request, Response } from "express";
import { CrearRolDTO } from "../interfaces/rol.interface";
export declare const crearRol: (req: Request<{}, {}, CrearRolDTO>, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const listarRoles: (_req: Request, res: Response) => Promise<void>;
export declare const obtenerRolPorId: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const actualizarRol: (req: Request<{
    id: string;
}, {}, Partial<CrearRolDTO>>, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const eliminarRol: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=rol.controller.d.ts.map