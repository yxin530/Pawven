import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { requireAuth } from '../middleware/auth';

const router = Router();

// POST /api/report — Submit TNR report
router.post('/report', async (req: Request, res: Response) => {
  try {
    const { strayPhotoUrl, lat, lng, address, notes, activityType, reporterName } = req.body;

    if (!activityType) {
      res.status(400).json({ error: 'activityType is required' });
      return;
    }

    if (notes && notes.length > 500) {
      res.status(400).json({ error: 'notes must be 500 characters or fewer' });
      return;
    }

    const { data, error } = await supabase
      .from('tnr_reports')
      .insert({
        stray_photo_url: strayPhotoUrl || null,
        lat,
        lng,
        address,
        notes: notes || '',
        activity_type: activityType,
        reported_by: req.userId || null,
        status: 'open',
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// GET /api/reports — List all reports (supports ?status filter)
router.get('/reports', async (req: Request, res: Response) => {
  try {
    const { status, assignedTo } = req.query;

    let query = supabase.from('tnr_reports').select('*').order('created_at', { ascending: false });

    if (status) query = query.eq('status', status as string);
    if (assignedTo) query = query.eq('assigned_to', assignedTo as string);

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// GET /api/reports/pending — Get all open reports (for NGOs/Vets to see)
router.get('/reports/pending', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('tnr_reports')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending reports' });
  }
});

// PATCH /api/reports/:id/accept — NGO/Vet accepts a case
router.patch('/reports/:id/accept', async (req: Request, res: Response) => {
  try {
    const { assignedToName } = req.body;

    const { data, error } = await supabase
      .from('tnr_reports')
      .update({
        status: 'in_progress',
        assigned_to: req.userId || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .eq('status', 'open')
      .select()
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Report not found or already assigned' });
      return;
    }

    // Post an update message
    await supabase.from('updates').insert({
      thread_type: 'report',
      thread_id: data.id,
      author_id: req.userId || null,
      message: `Case accepted by ${assignedToName || 'NGO/Vet'}. Now in progress.`,
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to accept report' });
  }
});

// PATCH /api/reports/:id/decline — NGO/Vet declines a case
router.patch('/reports/:id/decline', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('tnr_reports')
      .update({
        status: 'declined',
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .eq('status', 'open')
      .select()
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Report not found or already processed' });
      return;
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to decline report' });
  }
});

// PATCH /api/reports/:id/complete — Mark case as completed
router.patch('/reports/:id/complete', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('tnr_reports')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .eq('status', 'in_progress')
      .select()
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Report not found or not in progress' });
      return;
    }

    // Post completion update
    await supabase.from('updates').insert({
      thread_type: 'report',
      thread_id: data.id,
      author_id: req.userId || null,
      message: 'Case completed! Cat has been trapped, neutered, and returned.',
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete report' });
  }
});

// GET /api/reports/:id/updates — Get case update thread
router.get('/reports/:id/updates', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('updates')
      .select('*')
      .eq('thread_type', 'report')
      .eq('thread_id', req.params.id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
});

// POST /api/reports/:id/updates — Post case update
router.post('/reports/:id/updates', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const { data: report } = await supabase
      .from('tnr_reports')
      .select('id')
      .eq('id', req.params.id)
      .single();

    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    const { data: update, error } = await supabase
      .from('updates')
      .insert({
        thread_type: 'report',
        thread_id: report.id,
        author_id: req.userId || null,
        message,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(update);
  } catch (error) {
    res.status(500).json({ error: 'Failed to post update' });
  }
});

export default router;
