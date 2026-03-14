import { Router } from 'express';
import { query } from '../db/client';
import { verifyOnChain } from '../services/blockchain.service';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const { rows } = await query('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ success: true, auditLog: rows });
  } catch (error) { next(error); }
});

router.get('/:recordId/verify', async (req, res, next) => {
  try {
    const { recordId } = req.params;
    const isVerified = await verifyOnChain(recordId, { mock: 'data' });
    
    res.json({ success: true, verified: isVerified });
  } catch (error) { next(error); }
});

export default router;
