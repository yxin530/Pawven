import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

// POST /api/pay/kibble — Create Stripe PaymentIntent for kibble (requires auth)
router.post('/kibble', requireAuth, async (req: Request, res: Response) => {
  try {
    const { feederId, grams, amount } = req.body;

    if (!feederId || !grams || !amount) {
      res.status(400).json({ error: 'feederId, grams, and amount are required' });
      return;
    }

    if (typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ error: 'amount must be a positive number (in cents)' });
      return;
    }

    // Stub: In production, create a real Stripe PaymentIntent
    // const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    // const paymentIntent = await stripe.paymentIntents.create({ amount, currency: 'usd', metadata: { feederId, grams, userId: req.userId } });

    const paymentIntentId = `pi_mock_${Date.now()}`;

    res.json({
      clientSecret: `${paymentIntentId}_secret_mock`,
      paymentIntentId,
      amount,
      currency: 'usd',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create kibble payment intent' });
  }
});

// POST /api/pay/donate — Create donation PaymentIntent (requires auth)
router.post('/donate', requireAuth, async (req: Request, res: Response) => {
  try {
    const { orgId, amount } = req.body;

    if (!orgId || !amount) {
      res.status(400).json({ error: 'orgId and amount are required' });
      return;
    }

    if (typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ error: 'amount must be a positive number (in cents)' });
      return;
    }

    // Stub: In production, create a real Stripe PaymentIntent
    const paymentIntentId = `pi_mock_${Date.now()}`;

    res.json({
      clientSecret: `${paymentIntentId}_secret_mock`,
      paymentIntentId,
      amount,
      currency: 'usd',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create donation payment intent' });
  }
});

// POST /api/pay/rental — Create feeder rental subscription (requires auth)
router.post('/rental', requireAuth, async (req: Request, res: Response) => {
  try {
    const { feederId } = req.body;

    if (!feederId) {
      res.status(400).json({ error: 'feederId is required' });
      return;
    }

    // Stub: In production, create a Stripe subscription
    const subscriptionId = `sub_mock_${Date.now()}`;

    res.json({
      subscriptionId,
      feederId,
      status: 'active',
      message: 'Subscription created (mock)',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create rental subscription' });
  }
});

export default router;
