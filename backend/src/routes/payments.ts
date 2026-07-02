import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth';
import { env } from '../config/env';
import { supabase } from '../config/supabase';

const router = Router();

// Initialize Stripe with test mode secret key
const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' as any })
  : null;

// POST /api/pay/kibble — Create Stripe PaymentIntent for kibble dispense
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

    if (typeof grams !== 'number' || ![20, 50, 100].includes(grams)) {
      res.status(400).json({ error: 'grams must be 20, 50, or 100' });
      return;
    }

    // If Stripe is configured, create a real test-mode PaymentIntent
    if (stripe) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount, // in cents
        currency: 'usd',
        metadata: {
          feederId,
          grams: String(grams),
          userId: req.userId || 'unknown',
        },
      });

      // Record transaction in database
      await supabase.from('transactions').insert({
        user_id: req.userId,
        type: 'kibble',
        amount,
        currency: 'usd',
        stripe_payment_intent_id: paymentIntent.id,
        feeder_id: feederId,
        status: 'pending',
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount,
        currency: 'usd',
      });
    } else {
      // Fallback: mock response when Stripe key not configured
      const mockId = `pi_test_${Date.now()}`;
      res.json({
        clientSecret: `${mockId}_secret_mock`,
        paymentIntentId: mockId,
        amount,
        currency: 'usd',
        _mock: true,
      });
    }
  } catch (error: any) {
    console.error('Payment error:', error.message);
    res.status(500).json({ error: 'Failed to create payment intent', details: error.message });
  }
});

// POST /api/pay/donate — Create donation PaymentIntent
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

    if (stripe) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        metadata: { orgId, userId: req.userId || 'unknown', type: 'donation' },
      });

      await supabase.from('transactions').insert({
        user_id: req.userId,
        type: 'donation',
        amount,
        currency: 'usd',
        stripe_payment_intent_id: paymentIntent.id,
        status: 'pending',
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount,
        currency: 'usd',
      });
    } else {
      res.json({
        clientSecret: `pi_test_${Date.now()}_secret_mock`,
        paymentIntentId: `pi_test_${Date.now()}`,
        amount,
        currency: 'usd',
        _mock: true,
      });
    }
  } catch (error: any) {
    console.error('Donation payment error:', error.message);
    res.status(500).json({ error: 'Failed to create donation payment intent' });
  }
});

// POST /api/pay/rental — Create feeder rental subscription
router.post('/rental', requireAuth, async (req: Request, res: Response) => {
  try {
    const { feederId } = req.body;

    if (!feederId) {
      res.status(400).json({ error: 'feederId is required' });
      return;
    }

    // For now, rental is mock — Stripe subscriptions require a Customer object
    const subscriptionId = `sub_test_${Date.now()}`;

    await supabase.from('feeder_rentals').insert({
      user_id: req.userId,
      feeder_id: feederId,
      stripe_subscription_id: subscriptionId,
      status: 'active',
      start_date: new Date().toISOString(),
    });

    res.json({
      subscriptionId,
      feederId,
      status: 'active',
      message: 'Rental subscription created (test mode)',
    });
  } catch (error: any) {
    console.error('Rental error:', error.message);
    res.status(500).json({ error: 'Failed to create rental subscription' });
  }
});

// POST /api/pay/confirm — Webhook-style confirmation (called after client confirms)
router.post('/confirm', async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      res.status(400).json({ error: 'paymentIntentId is required' });
      return;
    }

    // Update transaction status
    const { error } = await supabase
      .from('transactions')
      .update({ status: 'completed' })
      .eq('stripe_payment_intent_id', paymentIntentId);

    if (error) throw error;

    res.json({ success: true, status: 'completed' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

export default router;
