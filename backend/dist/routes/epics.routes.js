"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../db/client");
const router = (0, express_1.Router)();
router.get('/', async (req, res, next) => {
    try {
        const { rows } = await (0, client_1.query)('SELECT * FROM epics ORDER BY created_at DESC');
        res.json({ success: true, epics: rows });
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const epicRes = await (0, client_1.query)('SELECT * FROM epics WHERE id = $1', [req.params.id]);
        if (epicRes.rows.length === 0)
            return res.status(404).json({ error: 'Epic not found' });
        const storiesRes = await (0, client_1.query)('SELECT * FROM user_stories WHERE epic_id = $1 ORDER BY created_at ASC', [req.params.id]);
        res.json({ success: true, epic: epicRes.rows[0], user_stories: storiesRes.rows });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
