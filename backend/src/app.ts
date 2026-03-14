import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';

import pipelineRoutes from './routes/pipeline.routes';
import feedbackRoutes from './routes/feedback.routes';
import brdsRoutes from './routes/brds.routes';
import priorityRoutes from './routes/priority.routes';
import epicsRoutes from './routes/epics.routes';
import notificationsRoutes from './routes/notifications.routes';
import agentsRoutes from './routes/agents.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/pipeline', pipelineRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/brds', brdsRoutes);
app.use('/api/priority', priorityRoutes);
app.use('/api/epics', epicsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/agents', agentsRoutes);

app.use(errorHandler);

export default app;
