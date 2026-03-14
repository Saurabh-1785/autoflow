"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../db/client");
const pipeline_service_1 = require("../services/pipeline.service");
const localCsv_service_1 = require("../services/localCsv.service");
const demoPipeline_service_1 = require("../services/demoPipeline.service");
const router = (0, express_1.Router)();
router.get('/status', async (req, res, next) => {
    try {
        const { rows } = await (0, client_1.query)('SELECT * FROM pipeline_status ORDER BY updated_at DESC LIMIT 10');
        res.json({ success: true, status: rows });
    }
    catch (error) {
        next(error);
    }
});
router.post('/status/update', async (req, res, next) => {
    try {
        const { stage, itemsProcessed } = req.body;
        await (0, client_1.query)(`INSERT INTO pipeline_status (stage, status, items_processed, updated_at) VALUES ($1, 'running', $2, NOW())`, [stage, itemsProcessed || 0]);
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
router.post('/trigger', async (req, res, next) => {
    try {
        const source = (req.body?.source || process.env.PIPELINE_SOURCE || 'google_sheets').toString();
        const allowCsvFallback = process.env.ALLOW_CSV_FALLBACK === 'true';
        const csvRows = source === 'csv' ? (0, localCsv_service_1.readLocalFeedbackRows)() : null;
        const payload = source === 'csv'
            ? {
                source: 'csv',
                rows: csvRows,
            }
            : req.body;
        try {
            await (0, pipeline_service_1.triggerN8nWebhook)('/webhook/start-ingestion', payload);
            res.json({ success: true, message: 'Pipeline triggered' });
        }
        catch (error) {
            if (allowCsvFallback && source === 'csv' && csvRows) {
                await (0, demoPipeline_service_1.generateDemoArtifactsFromCsv)(csvRows);
                return res.json({
                    success: true,
                    message: 'Pipeline executed in CSV demo mode (backend fallback).',
                });
            }
            throw error;
        }
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
