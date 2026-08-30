import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { authService } from '../services/auth.service';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.post('/register',
  [body('email').isEmail(), body('password').isLength({ min: 8 }), body('firstName').notEmpty(), body('lastName').notEmpty(), body('organizationName').notEmpty()],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await authService.register(req.body)); } catch (e) { next(e); }
  },
);

router.post('/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await authService.login(req.body)); } catch (e) { next(e); }
  },
);

router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'refreshToken required' });
    res.json(await authService.refreshToken(refreshToken));
  } catch (e) { next(e); }
});

router.post('/logout', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await authService.logout(refreshToken);
    res.json({ message: 'Logged out' });
  } catch (e) { next(e); }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await authService.getProfile(req.user!.id)); } catch (e) { next(e); }
});

export default router;
