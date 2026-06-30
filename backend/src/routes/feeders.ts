import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/feeders — List all feeders (supports ?status=online filter)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    let query = supabase.from('feeders').select('*');
    if (status) {
      query = query.eq('status', status as string);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
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

    const { data: feeder, error: fetchError } = await supabase
      .from('feeders')
      .select('*')
      .eq('id', feederId)
      .single();

    if (fetchError || !feeder) {
      res.status(404).json({ error: 'Feeder not found' });
      return;
    }

    if (feeder.status !== 'online') {
      res.status(400).json({ error: 'Feeder is not online' });
      return;
    }

    const newKibbleLevel = Math.max(0, feeder.kibble_level - grams);

    const { data: updated, error: updateError } = await supabase
      .from('feeders')
      .update({
        last_dispensed: new Date().toISOString(),
        kibble_level: newKibbleLevel,
      })
      .eq('id', feederId)
      .select()
      .single();

    if (updateError) throw updateError;

    // In production, this would publish an MQTT message to the feeder topic
    // e.g., mqttClient.publish(feeder.mqtt_topic, JSON.stringify({ grams }))

    res.json({
      success: true,
      message: `Dispensed ${grams}g from ${feeder.name}`,
      feeder: updated,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to dispense' });
  }
});

export default router;
