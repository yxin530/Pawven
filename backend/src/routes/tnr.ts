import { Router, Request, Response } from 'express';
import { TNRReport } from '../models/TNRReport';
import { Update } from '../models/Update';
import { User } from '../models/User';
import { requireAuth } from '../middleware/auth';

const router = Router();

// POST /api/report — Submit TNR report (requires auth)
router.post('/report', requireAuth, async (req: Request, res: Response) => {
  try {
    const { strayPhotoUrl, location, notes, activityType } = req.body;

    if (!location || !activityType) {
      res.status(400).json({ error: 'location and activityType are required' });
      return;
    }

    if (notes && notes.length > 500) {
      res.status(400).json({ error: 'notes must be 500 characters or fewer' });
      return;
    }

    const report = await TNRReport.create({
      strayPhotoUrl,
      location,
      notes: notes || '',
      activityType,
      reportedBy: req.userId,
      status: 'open',
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// PATCH /api/reports/:id — Update report status (requires auth, NGO/vet role)
router.patch('/reports/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    // Verify user has NGO or vet role
    const user = await User.findOne({ uid: req.userId });
    if (!user || (user.role !== 'ngo' && user.role !== 'vet')) {
      res.status(403).json({ error: 'Only NGO or vet users can update report status' });
      return;
    }

    const { status, assignedTo } = req.body;

    const updateFields: any = {};
    if (status) updateFields.status = status;
    if (assignedTo) updateFields.assignedTo = assignedTo;

    const report = await TNRReport.findByIdAndUpdate(req.params.id, updateFields, { new: true });

    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// GET /api/reports — List user's reports (requires auth)
router.get('/reports', requireAuth, async (req: Request, res: Response) => {
  try {
    const reports = await TNRReport.find({ reportedBy: req.userId }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// GET /api/reports/:id/updates — Get case update thread
router.get('/reports/:id/updates', async (req: Request, res: Response) => {
  try {
    const updates = await Update.find({
      threadType: 'report',
      threadId: req.params.id,
    }).sort({ createdAt: 1 });

    res.json(updates);
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

    const report = await TNRReport.findById(req.params.id);
    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    const update = await Update.create({
      threadType: 'report',
      threadId: report._id,
      authorId: req.userId,
      message,
    });

    res.status(201).json(update);
  } catch (error) {
    res.status(500).json({ error: 'Failed to post update' });
  }
});

export default router;
