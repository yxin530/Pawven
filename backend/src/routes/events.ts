import { Router, Request, Response } from 'express';
import { Event } from '../models/Event';
import { Rsvp } from '../models/Rsvp';
import { Update } from '../models/Update';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/events — List events (supports ?category and ?status filters)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, status } = req.query;

    const query: any = {};
    if (category) query.category = category;
    if (status) query.status = status;

    const events = await Event.find(query).sort({ startTime: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// POST /api/events — Create event (requires auth)
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, description, coverPhotoUrl, location, startTime, endTime, category } = req.body;

    if (!title || !description || !location || !startTime || !endTime || !category) {
      res.status(400).json({ error: 'Missing required fields: title, description, location, startTime, endTime, category' });
      return;
    }

    const event = await Event.create({
      title,
      description,
      coverPhotoUrl,
      location,
      startTime,
      endTime,
      hostUserId: req.userId,
      category,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// POST /api/events/:id/rsvp — RSVP to event (requires auth)
router.post('/:id/rsvp', requireAuth, async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    const userId = req.userId!;

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    // Check for existing RSVP
    const existing = await Rsvp.findOne({ eventId, userId });
    if (existing) {
      res.status(409).json({ error: 'Already RSVPd to this event' });
      return;
    }

    await Rsvp.create({ eventId, userId });
    event.rsvpCount += 1;
    await event.save();

    res.status(201).json({ success: true, rsvpCount: event.rsvpCount });
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

    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    // Only the host can post event updates
    if (event.hostUserId.toString() !== req.userId) {
      res.status(403).json({ error: 'Only the event host can post updates' });
      return;
    }

    const update = await Update.create({
      threadType: 'event',
      threadId: event._id,
      authorId: req.userId,
      message,
    });

    res.status(201).json(update);
  } catch (error) {
    res.status(500).json({ error: 'Failed to post update' });
  }
});

export default router;
