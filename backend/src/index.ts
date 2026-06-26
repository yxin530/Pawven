import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import feedersRouter from './routes/feeders';
import eventsRouter from './routes/events';
import orgsRouter from './routes/orgs';
import tnrRouter from './routes/tnr';
import paymentsRouter from './routes/payments';
import badgesRouter from './routes/badges';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes — all mounted under /api
app.use('/api/feeders', feedersRouter);
app.use('/api', tnrRouter); // handles /api/report, /api/reports, /api/reports/:id, /api/reports/:id/updates
app.use('/api/events', eventsRouter);
app.use('/api/orgs', orgsRouter);
app.use('/api/pay', paymentsRouter);
app.use('/api/badges', badgesRouter);

// Also mount dispense at /api/dispense (alias for POST /api/feeders/dispense)
app.post('/api/dispense', (req, res, next) => {
  // Forward to feeders router's /dispense handler
  req.url = '/dispense';
  feedersRouter(req, res, next);
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
async function start() {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`🚀 Pawven API server running on port ${env.PORT}`);
  });
}

start();
