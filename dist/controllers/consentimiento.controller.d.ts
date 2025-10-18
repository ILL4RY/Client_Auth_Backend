import { Request, Response } from "express";
import { CrearConsentimientoDTO } from "../interfaces/consentimiento.interface";
export declare const crearConsentimiento: (req: Request<{}, {}, CrearConsentimientoDTO>, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const listarConsentimientos: (_req: Request, res: Response) => Promise<void>;
export declare const obtenerConsentimientoPorId: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const actualizarConsentimiento: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const eliminarConsentimiento: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=consentimiento.controller.d.ts.map