import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { requireAuth } from '../middleware/auth';

const router = Router();

// POST /api/report — Submit TNR report (requires auth)
router.post('/report', requireAuth, async (req: Request, res: Response) => {
  try {
    const { strayPhotoUrl, lat, lng, address, notes, activityType } = req.body;

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
        stray_photo_url: strayPhotoUrl,
        lat,
        lng,
        address,
        notes: notes || '',
        activity_type: activityType,
        reported_by: req.userId,
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

// PATCH /api/reports/:id — Update report status (requires auth, NGO/vet role)
router.patch('/reports/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    // Verify user has NGO or vet role
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('clerk_id', req.userId)
      .single();

    if (userError || !user || (user.role !== 'ngo' && user.role !== 'vet')) {
      res.status(403).json({ error: 'Only NGO or vet users can update report status' });
      return;
    }

    const { status, assignedTo } = req.body;

    const updateFields: Record<string, any> = { updated_at: new Date().toISOString() };
    if (status) updateFields.status = status;
    if (assignedTo) updateFields.assigned_to = assignedTo;

    const { data, error } = await supabase
      .from('tnr_reports')
      .update(updateFields)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// GET /api/reports — List user's reports (requires auth)
router.get('/reports', requireAuth, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('tnr_reports')
      .select('*')
      .eq('reported_by', req.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
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

// POST /api/reports/:id/updates — Post case update (requires auth)
router.post('/reports/:id/updates', requireAuth, async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Verify report exists
    const { data: report, error: reportError } = await supabase
      .from('tnr_reports')
      .select('id')
      .eq('id', req.params.id)
      .single();

    if (reportError || !report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    const { data: update, error: insertError } = await supabase
      .from('updates')
      .insert({
        thread_type: 'report',
        thread_id: report.id,
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
