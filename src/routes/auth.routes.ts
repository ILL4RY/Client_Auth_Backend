import { Router } from 'express';
import { 
    register, 
    login, 
    logout, 
    checkAuth, 
    getCurrentUser 
} from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

export const authRouter = Router();

// Rutas públicas
authRouter.post('/register', register);
authRouter.post('/login', login);

// Ruta para verificar autenticación (pública)
authRouter.get('/check', checkAuth);

// Rutas protegidas (requieren autenticación)
authRouter.use(authMiddleware);
authRouter.post('/logout', authMiddleware, logout);
authRouter.get('/me', getCurrentUser);

export default authRouter;