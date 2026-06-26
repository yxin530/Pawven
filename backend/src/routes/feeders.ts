import { Router, Request, Response } from 'express';
import { Feeder } from '../models/Feeder';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/feeders — List all feeders (supports ?status=online filter)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const feeders = await Feeder.find(query);
    res.json(feeders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feeders' });
  }
});

// POST /api/dispense — Trigger feeder dispense (requires auth)
router.post('/dispense', requireAuth, async (req: Request, res: Response) => {
  try {
    const { feederId, grams } = req.body;

    if (!feederId || !grams) {
      res.status(400).json({ error: 'feederId and grams are required' });
      return;
    }

    if (typeof grams !== 'number' || grams <= 0) {
      res.status(400).json({ error: 'grams must be a positive number' });
      return;
    }

    const feeder = await Feeder.findById(feederId);
    if (!feeder) {
      res.status(404).json({ error: 'Feeder not found' });
      return;
    }

    if (feeder.status !== 'online') {
      res.status(400).json({ error: 'Feeder is not online' });
      return;
    }

    // Update feeder state
    feeder.lastDispensed = new Date();
    feeder.kibbleLevel = Math.max(0, feeder.kibbleLevel - grams);
    await feeder.save();

    // In production, this would publish an MQTT message to the feeder topic
    // e.g., mqttClient.publish(feeder.mqttTopic, JSON.stringify({ grams }))

    res.json({
      success: true,
      message: `Dispensed ${grams}g from ${feeder.name}`,
      feeder,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to dispense' });
  }
});

export default router;
