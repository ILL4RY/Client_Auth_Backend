import { Request, Response } from "express";
import { CrearPreferenciaDTO } from "../interfaces/preferencia.interface";
export declare const crearPreferencia: (req: Request<{}, {}, CrearPreferenciaDTO>, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const listarPreferencias: (_req: Request, res: Response) => Promise<void>;
export declare const obtenerPreferenciaPorId: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const actualizarPreferencia: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const eliminarPreferencia: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=preferencia.controller.d.ts.map