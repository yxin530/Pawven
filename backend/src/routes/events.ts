import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/events — List events (supports ?category and ?status filters)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, status } = req.query;

    let query = supabase.from('events').select('*').order('start_time', { ascending: true });
    if (category) query = query.eq('category', category as string);
    if (status) query = query.eq('status', status as string);

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// POST /api/events — Create event (requires auth)
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, description, coverPhotoUrl, lat, lng, address, startTime, endTime, category } = req.body;

    if (!title || !description || !startTime || !endTime || !category) {
      res.status(400).json({ error: 'Missing required fields: title, description, startTime, endTime, category' });
      return;
    }

    const { data, error } = await supabase
      .from('events')
      .insert({
        title,
        description,
        cover_photo_url: coverPhotoUrl,
        lat,
        lng,
        address,
        start_time: startTime,
        end_time: endTime,
        host_user_id: req.userId,
        category,
        status: 'upcoming',
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// POST /api/events/:id/rsvp — RSVP to event (requires auth)
router.post('/:id/rsvp', requireAuth, async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    const userId = req.userId!;

    // Check event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    // Check for existing RSVP
    const { data: existing } = await supabase
      .from('rsvps')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      res.status(409).json({ error: 'Already RSVPd to this event' });
      return;
    }

    // Create RSVP
    const { error: rsvpError } = await supabase
      .from('rsvps')
      .insert({ event_id: eventId, user_id: userId });

    if (rsvpError) throw rsvpError;

    // Increment rsvp_count
    const { data: updated, error: updateError } = await supabase
      .from('events')
      .update({ rsvp_count: (event.rsvp_count || 0) + 1 })
      .eq('id', eventId)
      .select('rsvp_count')
      .single();

    if (updateError) throw updateError;

    res.status(201).json({ success: true, rsvpCount: updated.rsvp_count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to RSVP' });
  }
});

// POST /api/events/:id/updates — Post event update (requires auth, host only)
router.post('/:id/updates', requireAuth, async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (eventError || !event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    // Only the host can post event updates
    if (event.host_user_id !== req.userId) {
      res.status(403).json({ error: 'Only the event host can post updates' });
      return;
    }

    const { data: update, error: insertError } = await supabase
      .from('updates')
      .insert({
        thread_type: 'event',
        thread_id: event.id,
        author_id: req.userId,
        message,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json(update);
  } catch (error) {
    res.status(500).json({ error: 'Failed to post update' });
  }
});

export default router;
