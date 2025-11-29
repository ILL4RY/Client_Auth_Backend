import { Router } from 'express';
import { 
  register, 
  login, 
  logout, 
  checkAuth, 
  getCurrentUser,
  forgotPassword,
  validateResetToken,
  resetPassword
} from '../controllers/auth.controller';
import rolRouter from './rol.routes';
import { authMiddleware } from '../middlewares/auth.middleware';

export const authRouter = Router();

// Rutas públicas
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/forgot', forgotPassword);
authRouter.get('/reset/validate', validateResetToken);
authRouter.post('/reset', resetPassword);

// Ruta para verificar autenticación (pública)
authRouter.get('/check', checkAuth);

// Rutas protegidas (requieren autenticación)
authRouter.use(authMiddleware);
authRouter.post('/logout', logout);
authRouter.get('/me', getCurrentUser);

authRouter.use('/roles', rolRouter);

export default authRouter;