import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// GET /api/orgs — List all organizations (supports ?type=ngo|vet filter)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type } = req.query;

    let query = supabase.from('organizations').select('*');
    if (type) {
      query = query.eq('type', type as string);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

// GET /api/orgs/:id — Get single org detail
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Organization not found' });
      return;
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

export default router;
