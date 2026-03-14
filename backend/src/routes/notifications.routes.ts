import { Router } from 'express';
import { sendSlackMessage as sendNotification } from '../services/notification.service';

const router = Router();

router.post('/new-brd', async (req, res, next) => {
  try {
    const { title, clusterId } = req.body;
    await sendNotification(`📝 New BRD Generated: *${title}* (Cluster: ${clusterId}). Waiting for review.`);
    res.json({ success: true });
  } catch (error) { next(error); }
});

router.post('/low-confidence-brd', async (req, res, next) => {
  try {
    const { title, issues } = req.body;
    await sendNotification(`⚠️ Low Confidence BRD generated for *${title}*. Requires Human-in-the-loop review. Issues: ${JSON.stringify(issues)}`);
    res.json({ success: true });
  } catch (error) { next(error); }  
});

export default router;
