"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_service_1 = require("../services/notification.service");
const router = (0, express_1.Router)();
router.post('/new-brd', async (req, res, next) => {
    try {
        const { title, clusterId } = req.body;
        await (0, notification_service_1.sendSlackMessage)(`📝 New BRD Generated: *${title}* (Cluster: ${clusterId}). Waiting for review.`);
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
router.post('/low-confidence-brd', async (req, res, next) => {
    try {
        const { title, issues } = req.body;
        await (0, notification_service_1.sendSlackMessage)(`⚠️ Low Confidence BRD generated for *${title}*. Requires Human-in-the-loop review. Issues: ${JSON.stringify(issues)}`);
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
