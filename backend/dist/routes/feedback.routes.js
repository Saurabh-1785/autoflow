"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../db/client");
const router = (0, express_1.Router)();
router.get('/', async (req, res, next) => {
    try {
        const source = req.query.source || 'sheet';
        const sentiment = req.query.sentiment;
        const conditions = [];
        const params = [];
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
        const { rows } = await (0, client_1.query)(sql, params);
        res.json({ success: true, feedback: rows });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
