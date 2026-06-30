import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/badges — Get authenticated user's earned badges
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('user_id', req.userId)
      .order('unlocked_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

export default router;
