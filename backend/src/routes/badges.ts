import { Router, Request, Response } from 'express';
import { Badge } from '../models/Badge';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/badges — Get authenticated user's earned badges
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const badges = await Badge.find({ userId: req.userId }).sort({ unlockedAt: -1 });
    res.json(badges);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

export default router;
