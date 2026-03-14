"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../db/client");
const pipeline_service_1 = require("../services/pipeline.service");
const router = (0, express_1.Router)();
router.get('/', async (req, res, next) => {
    try {
        const { rows } = await (0, client_1.query)('SELECT * FROM brds WHERE status = $1 ORDER BY wsjf_final_score DESC NULLS LAST', ['approved']);
        res.json({ success: true, priorities: rows });
    }
    catch (error) {
        next(error);
    }
});
router.patch('/', async (req, res, next) => {
    try {
        res.json({ success: true, message: 'Manual reordering saved (mocked)' });
    }
    catch (error) {
        next(error);
    }
});
router.post('/finalize', async (req, res, next) => {
    try {
        const { selectedIds } = req.body;
        await (0, pipeline_service_1.triggerN8nWebhook)('/webhook/generate-epics', { brdIds: selectedIds });
        res.json({ success: true, message: 'Epic Generation started' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
