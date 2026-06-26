import { Router, Request, Response } from 'express';
import { Org } from '../models/Organization';

const router = Router();

// GET /api/orgs — List all organizations (supports ?type=ngo|vet filter)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type } = req.query;

    const query: any = {};
    if (type) query.type = type;

    const orgs = await Org.find(query);
    res.json(orgs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

// GET /api/orgs/:id — Get single org detail
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const org = await Org.findById(req.params.id);
    if (!org) {
      res.status(404).json({ error: 'Organization not found' });
      return;
    }
    res.json(org);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

export default router;
