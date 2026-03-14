"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readLocalFeedbackRows = readLocalFeedbackRows;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sync_1 = require("csv-parse/sync");
function resolveCsvPath() {
    const configuredPath = process.env.LOCAL_CSV_PATH;
    if (configuredPath) {
        return configuredPath;
    }
    return path_1.default.resolve(process.cwd(), '..', 'google_sheets_demo_data.csv');
}
function readLocalFeedbackRows() {
    const csvPath = resolveCsvPath();
    if (!fs_1.default.existsSync(csvPath)) {
        throw new Error(`Local CSV file not found at path: ${csvPath}`);
    }
    const content = fs_1.default.readFileSync(csvPath, 'utf8');
    const rows = (0, sync_1.parse)(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    });
    if (!rows.length) {
        throw new Error(`Local CSV file is empty: ${csvPath}`);
    }
    return rows;
}
