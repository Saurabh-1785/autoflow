import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';

import pipelineRoutes from './routes/pipeline.routes';
import brdsRoutes from './routes/brds.routes';
import priorityRoutes from './routes/priority.routes';
import epicsRoutes from './routes/epics.routes';
import auditRoutes from './routes/audit.routes';
import notificationsRoutes from './routes/notifications.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/pipeline', pipelineRoutes);
app.use('/api/brds', brdsRoutes);
app.use('/api/priority', priorityRoutes);
app.use('/api/epics', epicsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/notifications', notificationsRoutes);

import { logToBlockchain } from './services/blockchain.service';
app.post('/api/blockchain/log', async (req, res, next) => {
  try {
    const { recordId, data, eventType } = req.body;
    logToBlockchain(recordId, data, eventType).catch(console.error);
    res.json({ success: true, message: 'Blockchain logging initiated' });
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

export default app;
