import { query } from '../db/client';
import type { CsvFeedbackRow } from './localCsv.service';

type DemoTheme = {
  key: string;
  title: string;
  targetAudience: string;
  businessValue: string;
  proposedSolution: string;
  wsjf: { bv: number; tc: number; rr: number; effort: number };
  matches: CsvFeedbackRow[];
};

const DEMO_REVIEWER = 'demo@autoflow.local';

function scoreWsjf(value: { bv: number; tc: number; rr: number; effort: number }) {
  return (value.bv + value.tc + value.rr) / value.effort;
}

function findMatches(rows: CsvFeedbackRow[], regex: RegExp) {
  return rows.filter((row) => regex.test((row.Feedback || '').toLowerCase()));
}

function buildThemes(rows: CsvFeedbackRow[]): DemoTheme[] {
  return [
    {
      key: 'performance',
      title: 'Improve Dashboard and Search Performance',
      targetAudience: 'Enterprise and Pro users handling large project lists',
      businessValue: 'Improves retention by reducing daily workflow friction and load-time complaints.',
      proposedSolution: 'Optimize query paths, pagination, and cached search indexes for dashboard and search endpoints.',
      wsjf: { bv: 10, tc: 9, rr: 7, effort: 5 },
      matches: findMatches(rows, /(slow|lag|load|performance|dashboard|search|15 seconds|10 seconds)/i),
    },
    {
      key: 'dark-mode',
      title: 'Launch Dark Mode Across Core Product Views',
      targetAudience: 'Night-time users across Free, Pro, and Enterprise tiers',
      businessValue: 'Addresses repeated high-frequency UX demand and reduces visual fatigue complaints.',
      proposedSolution: 'Implement theme tokens with persisted user preference and full coverage for dashboard, details, and forms.',
      wsjf: { bv: 8, tc: 7, rr: 5, effort: 4 },
      matches: findMatches(rows, /(dark mode|dark theme|too bright|retina|eyes)/i),
    },
    {
      key: 'exports',
      title: 'Stabilize CSV/Excel Export Reliability and Completeness',
      targetAudience: 'Reporting-heavy teams and enterprise operations users',
      businessValue: 'Unblocks weekly/quarterly reporting workflows and reduces support escalations.',
      proposedSolution: 'Fix export pipeline edge cases (timeouts, encoding, row limits, missing columns, emoji handling).',
      wsjf: { bv: 9, tc: 8, rr: 6, effort: 5 },
      matches: findMatches(rows, /(csv|export|excel|encoding|rows|column|report)/i),
    },
    {
      key: 'mobile',
      title: 'Upgrade Mobile Experience and Native App Capability',
      targetAudience: 'Pro users relying on mobile status checks and updates',
      businessValue: 'Increases mobile adoption and reduces churn linked to poor mobile usability.',
      proposedSolution: 'Prioritize responsive fixes, touch interactions, and native roadmap planning with offline/read-only support.',
      wsjf: { bv: 8, tc: 7, rr: 5, effort: 6 },
      matches: findMatches(rows, /(mobile|ios|android|native app|ipad|touch|offline)/i),
    },
    {
      key: 'integrations',
      title: 'Expand Integrations: Slack and Calendar Ecosystem',
      targetAudience: 'Pro and enterprise collaboration teams',
      businessValue: 'Improves stickiness by embedding AutoFlow into existing communication and planning workflows.',
      proposedSolution: 'Ship robust Slack integration and add Google Calendar connector with clear retry/error observability.',
      wsjf: { bv: 7, tc: 6, rr: 5, effort: 5 },
      matches: findMatches(rows, /(slack|discord|calendar|integration|webhook|notifications)/i),
    },
  ];
}

export async function generateDemoArtifactsFromCsv(rows: CsvFeedbackRow[]) {
  await query(`DELETE FROM user_stories WHERE epic_id IN (SELECT id FROM epics WHERE status = 'demo_generated')`);
  await query(`DELETE FROM epics WHERE status = 'demo_generated'`);
  await query(`DELETE FROM brds WHERE reviewer_email = $1`, [DEMO_REVIEWER]);
  await query(`DELETE FROM raw_feedback WHERE source = 'sheet'`);

  for (const row of rows) {
    await query(
      `INSERT INTO raw_feedback (source, external_id, text, author_id, author_tier, sentiment, sentiment_score, is_duplicate, collected_at)
       VALUES ('sheet', $1, $2, $3, $4, 'neutral', 0.5, false, NOW())`,
      [row.ID || null, row.Feedback || '', row.User || 'anonymous', row.Tier || 'free']
    );
  }

  const themes = buildThemes(rows).filter((theme) => theme.matches.length > 0);
  const chosenThemes = themes.length > 0 ? themes : buildThemes(rows).slice(0, 3);

  for (let i = 0; i < chosenThemes.length; i++) {
    const theme = chosenThemes[i];
    const wsjfFinal = scoreWsjf(theme.wsjf);
    const status = i < 3 ? 'approved' : 'pending_review';
    const sourceEvidence = theme.matches.slice(0, 4).map((item) => item.Feedback || '').filter(Boolean);

    await query(
      `INSERT INTO brds (
        cluster_id, title, problem_statement, target_audience, business_value, proposed_solution,
        success_metrics, out_of_scope, source_evidence,
        wsjf_bv, wsjf_tc, wsjf_rr, wsjf_effort, wsjf_final_score,
        confidence_score, confidence_reason, critic_score, critic_issues,
        status, reviewer_email, reviewed_at, original_ai_json
      ) VALUES (
        NULL, $1, $2, $3, $4, $5,
        $6, $7, $8,
        $9, $10, $11, $12, $13,
        $14, $15, $16, $17,
        $18, $19, $20, $21
      )`,
      [
        `Demo: ${theme.title}`,
        `Clustered feedback from demo CSV indicates recurring demand around ${theme.key}.`,
        theme.targetAudience,
        theme.businessValue,
        theme.proposedSolution,
        ['Reduce related complaint volume by 40%', 'Improve feature satisfaction score by 20%'],
        ['Non-critical cosmetic enhancements', 'Long-term platform migration work'],
        sourceEvidence,
        theme.wsjf.bv,
        theme.wsjf.tc,
        theme.wsjf.rr,
        theme.wsjf.effort,
        wsjfFinal,
        0.84,
        `Generated from ${theme.matches.length} matching feedback records in demo CSV.`,
        0.88,
        JSON.stringify([]),
        status,
        DEMO_REVIEWER,
        status === 'approved' ? new Date().toISOString() : null,
        JSON.stringify({ source: 'demo_csv', theme: theme.key, matched_rows: theme.matches.length }),
      ]
    );
  }
}
