import { Router, Request, Response, NextFunction } from 'express';
import { runAnalystAgent } from '../services/agents/analyst.agent';
import { runCriticAgent } from '../services/agents/critic.agent';
import { runStoryWriterAgent } from '../services/agents/storyWriter.agent';
import { runClusterAgent } from '../services/agents/cluster.agent';

const router = Router();

router.post('/analyst', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { feedback } = req.body;
    if (!feedback) {
      return res.status(400).json({ success: false, error: 'Feedback data is required.' });
    }
    
    const result = await runAnalystAgent(feedback);
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
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

export default router;
