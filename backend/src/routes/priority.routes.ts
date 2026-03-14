import { Router } from 'express';
import { query } from '../db/client';
import { triggerN8nWebhook } from '../services/pipeline.service';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM brds WHERE status = $1 ORDER BY wsjf_final_score DESC NULLS LAST', ['approved']);
    res.json({ success: true, priorities: rows });
  } catch (error) { next(error); }
});

router.patch('/', async (req, res, next) => {
  try {
    res.json({ success: true, message: 'Manual reordering saved (mocked)' });
  } catch (error) { next(error); }
});

router.post('/finalize', async (req, res, next) => {
  try {
    const { selectedIds } = req.body;
    await triggerN8nWebhook('/webhook/generate-epics', { brdIds: selectedIds });
    res.json({ success: true, message: 'Epic Generation started' });
  } catch (error) { next(error); }
});

export default router;
