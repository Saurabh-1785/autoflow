import { Router } from 'express';
import { query } from '../db/client';
import { triggerN8nWebhook } from '../services/pipeline.service';
import { readLocalFeedbackRows } from '../services/localCsv.service';
import { generateDemoArtifactsFromCsv } from '../services/demoPipeline.service';

const router = Router();

router.get('/status', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM pipeline_status ORDER BY updated_at ASC');
    res.json({ success: true, status: rows });
  } catch (error) { next(error); }
});

router.post('/status/update', async (req, res, next) => {
  try {
    const { stage, itemsProcessed, errorMessage } = req.body;
    await query(
      `INSERT INTO pipeline_status (stage, status, items_processed, error_message, updated_at) VALUES ($1, $2, $3, $4, NOW())`,
      [stage, errorMessage ? 'failed' : 'completed', itemsProcessed || 0, errorMessage || null]
    );
    res.json({ success: true });
  } catch (error) { next(error); }
});

router.get('/summary', async (req, res, next) => {
  try {
    const rawFeedbackCount = await query('SELECT COUNT(*) FROM raw_feedback');
    const clustersCount = await query('SELECT COUNT(*) FROM feedback_clusters');
    const brdsGeneratedCount = await query('SELECT COUNT(*) FROM brds');
    const brdsApprovedCount = await query('SELECT COUNT(*) FROM brds WHERE status = $1', ['approved']);
    const brdsRejectedCount = await query('SELECT COUNT(*) FROM brds WHERE status = $1', ['rejected']);
    const epicsCount = await query('SELECT COUNT(*) FROM epics');
    const userStoriesCount = await query('SELECT COUNT(*) FROM user_stories');
    const { rows: logs } = await query('SELECT * FROM pipeline_status ORDER BY updated_at ASC');

    res.json({
      success: true,
      data: {
        counts: {
          rawFeedback: parseInt(rawFeedbackCount.rows[0].count, 10),
          clusters: parseInt(clustersCount.rows[0].count, 10),
          brdsGenerated: parseInt(brdsGeneratedCount.rows[0].count, 10),
          brdsApproved: parseInt(brdsApprovedCount.rows[0].count, 10),
          brdsRejected: parseInt(brdsRejectedCount.rows[0].count, 10),
          epics: parseInt(epicsCount.rows[0].count, 10),
          userStories: parseInt(userStoriesCount.rows[0].count, 10),
        },
        logs
      }
    });
  } catch (error) { next(error); }
});

router.post('/trigger', async (req, res, next) => {
  try {
    console.log('[Pipeline] Trigger request received, source:', req.body?.source || 'csv');
    const source = (req.body?.source || process.env.PIPELINE_SOURCE || 'csv').toString();
    const allowCsvFallback = process.env.ALLOW_CSV_FALLBACK === 'true';
    const csvRows = source === 'csv' ? readLocalFeedbackRows() : null;

    // Clear old data for a fresh run
    await query('TRUNCATE table pipeline_status RESTART IDENTITY CASCADE');
    await query('TRUNCATE table user_stories CASCADE');
    await query('TRUNCATE table epics CASCADE');
    await query('TRUNCATE table brds CASCADE');
    await query('TRUNCATE table feedback_clusters CASCADE');
    await query('TRUNCATE table raw_feedback CASCADE');

    // Initial log
    await query(
      `INSERT INTO pipeline_status (stage, status, updated_at) VALUES ($1, $2, NOW())`,
      [`Feedback Source Selected: ${source === 'csv' ? 'Demo Data (CSV)' : source}`, 'completed']
    );

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
        // Run pipeline async so frontend can poll for stage progress
        generateDemoArtifactsFromCsv(csvRows).catch(err =>
          console.error('[Pipeline] Demo pipeline error:', err)
        );
        return res.json({
          success: true,
          message: 'Pipeline triggered in demo mode',
        });
      }

      throw error;
    }
  } catch (error) { next(error); }
});

export default router;
