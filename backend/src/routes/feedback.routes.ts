import { Router } from 'express';
import { query } from '../db/client';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const source = (req.query.source as string | undefined) || 'sheet';
    const sentiment = req.query.sentiment as string | undefined;

    const conditions: string[] = [];
    const params: any[] = [];

    if (source) {
      params.push(source);
      conditions.push(`source = $${params.length}`);
    }

    if (sentiment) {
      params.push(sentiment);
      conditions.push(`sentiment = $${params.length}`);
    }

    let sql = 'SELECT * FROM raw_feedback';
    if (conditions.length) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ' ORDER BY collected_at DESC, created_at DESC';

    const { rows } = await query(sql, params);
    res.json({ success: true, feedback: rows });
  } catch (error) {
    next(error);
  }
});

export default router;
