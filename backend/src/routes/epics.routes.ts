import { Router } from 'express';
import { query } from '../db/client';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM epics ORDER BY created_at DESC');
    res.json({ success: true, epics: rows });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const epicRes = await query('SELECT * FROM epics WHERE id = $1', [req.params.id]);
    if (epicRes.rows.length === 0) return res.status(404).json({ error: 'Epic not found' });
    
    const storiesRes = await query('SELECT * FROM user_stories WHERE epic_id = $1 ORDER BY created_at ASC', [req.params.id]);
    
    res.json({ success: true, epic: epicRes.rows[0], user_stories: storiesRes.rows });
  } catch (error) { next(error); }
});

export default router;
