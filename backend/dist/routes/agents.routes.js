"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyst_agent_1 = require("../services/agents/analyst.agent");
const critic_agent_1 = require("../services/agents/critic.agent");
const storyWriter_agent_1 = require("../services/agents/storyWriter.agent");
const router = (0, express_1.Router)();
router.post('/analyst', async (req, res, next) => {
    try {
        const { feedback } = req.body;
        if (!feedback) {
            return res.status(400).json({ success: false, error: 'Feedback data is required.' });
        }
        const result = await (0, analyst_agent_1.runAnalystAgent)(feedback);
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
});
router.post('/critic', async (req, res, next) => {
    try {
        const { brd } = req.body;
        if (!brd) {
            return res.status(400).json({ success: false, error: 'BRD data is required.' });
        }
        const result = await (0, critic_agent_1.runCriticAgent)(brd);
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
});
router.post('/story-writer', async (req, res, next) => {
    try {
        const { brd } = req.body;
        if (!brd) {
            return res.status(400).json({ success: false, error: 'BRD data is required.' });
        }
        const result = await (0, storyWriter_agent_1.runStoryWriterAgent)(brd);
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
