import { Router, Request, Response, NextFunction } from 'express';
import { runAnalystAgent } from '../services/agents/analyst.agent';
import { runCriticAgent } from '../services/agents/critic.agent';
import { runStoryWriterAgent } from '../services/agents/storyWriter.agent';
import { runClusterAgent } from '../services/agents/cluster.agent';
import { query } from '../db/client';

const router = Router();

router.post('/analyst', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { feedback } = req.body;
    if (!feedback) {
      return res.status(400).json({ success: false, error: 'Feedback data is required.' });
    }
    
    const result = await runAnalystAgent(feedback);
    
    await query(
      `INSERT INTO pipeline_status (stage, status, updated_at) VALUES ($1, $2, NOW())`,
      [`Analyst Agent generated BRD for topic: ${result.title || 'Unknown'}`, 'completed']
    );

    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.post('/critic', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { brd } = req.body;
    if (!brd) {
      return res.status(400).json({ success: false, error: 'BRD data is required.' });
    }

    const result = await runCriticAgent(brd);

    await query(
      `INSERT INTO pipeline_status (stage, status, updated_at) VALUES ($1, $2, NOW())`,
      [`Critic Agent ${result.status === 'approved' ? 'approved' : 'rejected'} BRD: ${brd.title || 'Unknown'}`, 'completed']
    );

    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.post('/story-writer', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { brd } = req.body;
    if (!brd) {
      return res.status(400).json({ success: false, error: 'BRD data is required.' });
    }

    const result = await runStoryWriterAgent(brd);

    const epicsCount = result.epics?.length || 0;
    const storiesCount = result.epics?.reduce((sum: number, e: any) => sum + (e.user_stories?.length || 0), 0) || 0;

    await query(
      `INSERT INTO pipeline_status (stage, status, updated_at) VALUES ($1, $2, NOW())`,
      [`Story Writer Agent generated ${epicsCount} epics and ${storiesCount} user stories for BRD: ${brd.title || 'Unknown'}`, 'completed']
    );

    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.post('/cluster', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, error: 'Feedback items array is required.' });
    }

    const result = await runClusterAgent(items);

    await query(
      `INSERT INTO pipeline_status (stage, status, updated_at) VALUES ($1, $2, NOW())`,
      [`Cluster Agent generated ${result.clusters?.length || 0} topic clusters`, 'completed']
    );

    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

export default router;
