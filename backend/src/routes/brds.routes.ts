import { Router } from 'express';
import { query } from '../db/client';
import { triggerN8nWebhook } from '../services/pipeline.service';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const status = req.query.status as string;
    let sql = 'SELECT * FROM brds';
    let params: any[] = [];
    if (status) {
      sql += ' WHERE status = $1';
      params.push(status);
    }
    sql += ' ORDER BY wsjf_final_score DESC NULLS LAST';
    const { rows } = await query(sql, params);
    res.json({ success: true, brds: rows });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM brds WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'BRD not found' });
    res.json({ success: true, brd: rows[0] });
  } catch (error) { next(error); }
});

router.patch('/:id/approve', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { edits } = req.body;
    const actor = req.body.actor || 'API_USER';
    
    const response = await triggerN8nWebhook('/webhook/brd-decision', {
      brdId: id,
      decision: 'approve',
      edits,
      actor
    });
    
    res.json({ success: true, message: 'Approval sent to n8n pipeline', n8nResponse: response });
  } catch (error) { next(error); }
});

router.patch('/:id/reject', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const actor = req.body.actor || 'API_USER';

    const response = await triggerN8nWebhook('/webhook/brd-decision', {
      brdId: id,
      decision: 'reject',
      reason,
      actor
    });
    
    res.json({ success: true, message: 'Rejection sent to n8n pipeline', n8nResponse: response });
  } catch (error) { next(error); }
});

export default router;
