import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export type CsvFeedbackRow = {
  ID?: string;
  Feedback?: string;
  User?: string;
  Tier?: string;
  [key: string]: string | undefined;
};

function resolveCsvPath(): string {
  const configuredPath = process.env.LOCAL_CSV_PATH;
  if (configuredPath) {
    return configuredPath;
  }

  return path.resolve(process.cwd(), '..', 'google_sheets_demo_data.csv');
}

export function readLocalFeedbackRows(): CsvFeedbackRow[] {
  const csvPath = resolveCsvPath();

  if (!fs.existsSync(csvPath)) {
    throw new Error(`Local CSV file not found at path: ${csvPath}`);
  }

  const content = fs.readFileSync(csvPath, 'utf8');
  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CsvFeedbackRow[];

  if (!rows.length) {
    throw new Error(`Local CSV file is empty: ${csvPath}`);
  }

  return rows;
}
