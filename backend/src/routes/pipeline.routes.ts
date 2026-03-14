import { Router } from 'express';
import { query } from '../db/client';
import { triggerN8nWebhook } from '../services/pipeline.service';
import { readLocalFeedbackRows } from '../services/localCsv.service';
import { generateDemoArtifactsFromCsv } from '../services/demoPipeline.service';

const router = Router();

router.get('/status', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM pipeline_status ORDER BY updated_at DESC LIMIT 10');
    res.json({ success: true, status: rows });
  } catch (error) { next(error); }
});

router.post('/status/update', async (req, res, next) => {
  try {
    const { stage, itemsProcessed } = req.body;
    await query(
      `INSERT INTO pipeline_status (stage, status, items_processed, updated_at) VALUES ($1, 'running', $2, NOW())`,
      [stage, itemsProcessed || 0]
    );
    res.json({ success: true });
  } catch (error) { next(error); }
});

router.post('/trigger', async (req, res, next) => {
  try {
    const source = (req.body?.source || process.env.PIPELINE_SOURCE || 'google_sheets').toString();
    const allowCsvFallback = process.env.ALLOW_CSV_FALLBACK === 'true';
    const csvRows = source === 'csv' ? readLocalFeedbackRows() : null;

    const payload = source === 'csv'
      ? {
          source: 'csv',
          rows: csvRows,
        }
      : req.body;

    try {
      await triggerN8nWebhook('/webhook/start-ingestion', payload);
      res.json({ success: true, message: 'Pipeline triggered' });
    } catch (error) {
      if (allowCsvFallback && source === 'csv' && csvRows) {
        await generateDemoArtifactsFromCsv(csvRows);
        return res.json({
          success: true,
          message: 'Pipeline executed in CSV demo mode (backend fallback).',
        });
      }

      throw error;
    }
  } catch (error) { next(error); }
});

export default router;
