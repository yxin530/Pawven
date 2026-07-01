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
    const { title, description, coverPhotoUrl, lat, lng, address, startTime, endTime, category, hostInstagram, hostEmail, requireApproval, visibility } = req.body;

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
        host_instagram: hostInstagram || null,
        host_email: hostEmail || null,
        require_approval: requireApproval || false,
        visibility: visibility || 'Public',
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

    // Determine status based on approval requirement
    const rsvpStatus = event.require_approval ? 'pending' : 'confirmed';

    // Create RSVP
    const { error: rsvpError } = await supabase
      .from('rsvps')
      .insert({
        event_id: eventId,
        user_id: userId,
        status: rsvpStatus,
        user_name: req.body.userName || null,
        user_avatar_url: req.body.userAvatarUrl || null,
      });

    if (rsvpError) throw rsvpError;

    // Only increment rsvp_count if auto-confirmed
    if (rsvpStatus === 'confirmed') {
      const { data: updated, error: updateError } = await supabase
        .from('events')
        .update({ rsvp_count: (event.rsvp_count || 0) + 1 })
        .eq('id', eventId)
        .select('rsvp_count')
        .single();

      if (updateError) throw updateError;
      res.status(201).json({ success: true, status: 'confirmed', rsvpCount: updated.rsvp_count });
    } else {
      res.status(201).json({ success: true, status: 'pending', rsvpCount: event.rsvp_count || 0 });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to RSVP' });
  }
});

// GET /api/events/:id/attendees — Get attendees for an event
router.get('/:id/attendees', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('rsvps')
      .select('*')
      .eq('event_id', req.params.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendees' });
  }
});

// PATCH /api/events/:id/attendees/:rsvpId — Approve or reject an RSVP (host only)
router.patch('/:id/attendees/:rsvpId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { status } = req.body; // 'confirmed' or 'rejected'
    if (!status || !['confirmed', 'rejected'].includes(status)) {
      res.status(400).json({ error: 'status must be "confirmed" or "rejected"' });
      return;
    }

    // Verify caller is the host
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('host_user_id, rsvp_count')
      .eq('id', req.params.id)
      .single();

    if (eventError || !event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (event.host_user_id !== req.userId) {
      res.status(403).json({ error: 'Only the host can manage attendees' });
      return;
    }

    // Get current RSVP status before updating
    const { data: rsvp, error: rsvpFetchError } = await supabase
      .from('rsvps')
      .select('status')
      .eq('id', req.params.rsvpId)
      .single();

    if (rsvpFetchError || !rsvp) {
      res.status(404).json({ error: 'RSVP not found' });
      return;
    }

    // Update RSVP status
    const { error: updateError } = await supabase
      .from('rsvps')
      .update({ status })
      .eq('id', req.params.rsvpId);

    if (updateError) throw updateError;

    // If approving a pending RSVP, increment count
    if (status === 'confirmed' && rsvp.status === 'pending') {
      await supabase
        .from('events')
        .update({ rsvp_count: (event.rsvp_count || 0) + 1 })
        .eq('id', req.params.id);
    }

    // If rejecting a confirmed RSVP, decrement count
    if (status === 'rejected' && rsvp.status === 'confirmed') {
      await supabase
        .from('events')
        .update({ rsvp_count: Math.max(0, (event.rsvp_count || 0) - 1) })
        .eq('id', req.params.id);
    }

    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update attendee status' });
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
