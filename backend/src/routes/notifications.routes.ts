import { Router } from 'express';
import { sendSlackMessage } from '../services/notification.service';

const router = Router();

router.post('/new-brd', async (req, res, next) => {
  try {
    const { title, clusterId } = req.body;
    await sendSlackMessage(`📝 New BRD Generated: *${title}* (Cluster: ${clusterId}). Waiting for review.`);
    res.json({ success: true });
  } catch (error) { next(error); }
});

router.post('/low-confidence-brd', async (req, res, next) => {
  try {
    const { title, issues } = req.body;
    await sendSlackMessage(`⚠️ Low Confidence BRD generated for *${title}*. Requires Human-in-the-loop review. Issues: ${JSON.stringify(issues)}`);
    res.json({ success: true });
  } catch (error) { next(error); }
});

export default router;
