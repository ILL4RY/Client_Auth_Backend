import { Request, Response, NextFunction } from 'express';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    isAuth?: boolean;
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.isAuth || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado. Por favor, inicia sesión.'
    });
  }
  next();
};

// Extender el tipo de Request para incluir useragent
declare global {
  namespace Express {
    interface Request {
      useragent?: {
        isMobile: boolean;
        platform: string;
        browser: string;
      };
    }
  }
}
