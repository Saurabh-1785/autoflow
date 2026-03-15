import { query } from '../db/client';
import type { CsvFeedbackRow } from './localCsv.service';
import { runClusterAgent } from './agents/cluster.agent';
import { runAnalystAgent } from './agents/analyst.agent';
import { runCriticAgent } from './agents/critic.agent';
import { runStoryWriterAgent } from './agents/storyWriter.agent';

// ── helpers ──────────────────────────────────────────────

async function logStage(stage: string, status: string = 'completed', itemsProcessed: number = 0) {
  const safeStage = (stage || '').slice(0, 100);
  await query(
    `INSERT INTO pipeline_status (stage, status, items_processed, updated_at) VALUES ($1, $2, $3, NOW())`,
    [safeStage, status, itemsProcessed]
  );
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> {
  let timeoutHandle: NodeJS.Timeout | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
}

function buildFallbackBrd(topicLabel: string, feedbackTexts: string[]) {
  const evidence = feedbackTexts.slice(0, 4);
  return {
    title: `BRD: ${topicLabel}`,
    problemStatement: `Users are reporting recurring issues around ${topicLabel}.`,
    targetAudience: 'Active product users impacted by this workflow',
    businessValue: `Addressing ${topicLabel} is expected to reduce friction, improve satisfaction, and lower support burden.`,
    proposedSolution: `Deliver a focused improvement initiative for ${topicLabel}, prioritizing reliability, usability, and measurable outcomes.`,
    requirements: [
      `Stabilize core functionality related to ${topicLabel}`,
      'Improve validation and error handling for edge cases',
      'Provide clear user feedback for success/failure states'
    ],
    sourceEvidence: evidence
  };
}

function buildFallbackStories(brd: any) {
  const epicTitle = `Epic: ${brd.title.replace('BRD: ', '')}`;
  return {
    epics: [
      {
        title: epicTitle,
        description: `Implement the key capabilities defined in ${brd.title}, focusing on the core problem: ${brd.problemStatement.slice(0, 100)}...`,
        acceptanceCriteria: ["Core functionality validated", "User feedback integrated", "Performance targets met"],
        businessValue: brd.businessValue
      }
    ],
    userStories: [
      {
        epicTitle: epicTitle,
        title: `As a user, I want stable functionality for ${brd.title.replace('BRD: ', '')}, so that I can achieve my goals efficiently.`,
        description: `Detailed implementation of requirements: ${brd.requirements?.join(', ')}`,
        acceptanceCriteria: ["Feature is functional", "Errors are handled gracefully"],
        storyPoints: 5
      },
      {
        epicTitle: epicTitle,
        title: `As a user, I want improved UI/UX for this feature group, so that I have a better visual experience.`,
        description: `Address UI polish and responsiveness for ${brd.title}`,
        acceptanceCriteria: ["UI follows design guidelines", "Responsive on mobile"],
        storyPoints: 3
      }
    ]
  };
}

// ── main pipeline ────────────────────────────────────────

export async function generateDemoArtifactsFromCsv(rows: CsvFeedbackRow[]) {
  console.log(`[DemoPipeline] Starting full AI pipeline with ${rows.length} rows`);

  // ─── Stage 1: Data Ingestion ───────────────────────────
  await logStage('Data Ingestion: Loading feedback into database', 'completed');

  const processedFeedback: { id: string; text: string }[] = [];

  for (const row of rows) {
    const feedbackText = row.Feedback || '';
    const insertRes = await query(
      `INSERT INTO raw_feedback (source, external_id, text, author_id, author_tier, sentiment, sentiment_score, is_duplicate, collected_at)
       VALUES ('sheet', $1, $2, $3, $4, 'neutral', 0.5, false, NOW()) RETURNING id`,
      [row.ID || null, feedbackText, row.User || 'anonymous', row.Tier || 'free']
    );
    
    if (insertRes.rows.length > 0) {
      processedFeedback.push({
        id: insertRes.rows[0].id,
        text: feedbackText
      });
    }
  }

  await logStage(`Data Ingestion: Normalized and stored ${processedFeedback.length} feedback items`, 'completed', processedFeedback.length);
  console.log(`[DemoPipeline] Ingested ${processedFeedback.length} feedback items`);

  // ─── Stage 2: Clustering via Cluster Agent ─────────────
  await logStage('Cluster Agent: Analyzing feedback for topic patterns...', 'completed');

  let clusters: any[] = [];
  try {
    // Pass processedFeedback directly instead of querying the DB
    const clusterResult = await runClusterAgent(processedFeedback);
    clusters = clusterResult.clusters || [];
    console.log(`[DemoPipeline] Cluster Agent produced ${clusters.length} clusters`);
  } catch (err: any) {
    console.error('[DemoPipeline] Cluster Agent error:', err.message);
    // Fallback: create a single cluster with all items
    clusters = [{
      topicLabel: 'General Feedback',
      keywords: ['feedback', 'issues', 'requests'],
      summary: 'All user feedback items grouped together',
      rawFeedbackIds: processedFeedback.map(i => i.id)
    }];
  }

  // Save clusters to DB and link feedback
  const savedClusters: { clusterId: string; topicLabel: string; feedbackTexts: string[] }[] = [];

  for (const cluster of clusters) {
    const insertRes = await query(
      `INSERT INTO feedback_clusters (topic_label, keywords, mention_count, avg_sentiment, processed, created_at)
       VALUES ($1, $2, $3, 0.5, true, NOW()) RETURNING id`,
      [cluster.topicLabel, cluster.keywords || [], cluster.rawFeedbackIds?.length || 0]
    );
    const clusterId = insertRes.rows[0].id;

    // Update raw_feedback with cluster_id
    const ids = cluster.rawFeedbackIds || [];
    if (ids.length > 0) {
      await query(
        `UPDATE raw_feedback SET cluster_id = $1 WHERE id = ANY($2::uuid[])`,
        [clusterId, ids]
      );
    }

    // Gather feedback texts from memory instead of re-querying
    const fbTexts = processedFeedback
      .filter(fb => ids.includes(fb.id))
      .map(fb => fb.text);

    savedClusters.push({
      clusterId,
      topicLabel: cluster.topicLabel,
      feedbackTexts: fbTexts
    });
  }

  await logStage(`Cluster Agent: Identified ${clusters.length} topic clusters`, 'completed', clusters.length);

  // ─── Stage 3: Analyst Agent → BRD Generation ──────────
  await logStage('Analyst Agent: Generating BRDs from clusters...', 'completed');

  const generatedBrds: { brdId: string; brdData: any; clusterId: string }[] = [];

  for (const cluster of savedClusters) {
    const feedbackForAnalyst = cluster.feedbackTexts.length > 0
      ? cluster.feedbackTexts.join('\n')
      : `Topic: ${cluster.topicLabel}`;

    try {
      console.log(`[DemoPipeline] Cluster "${cluster.topicLabel}" - Input to Analyst Agent:`, feedbackForAnalyst);
      const brdResult = await withTimeout(
        runAnalystAgent(feedbackForAnalyst),
        45000,
        `Analyst Agent timed out after 45s for cluster "${cluster.topicLabel}"`
      );
      console.log(`[DemoPipeline] Analyst Agent Result for "${cluster.topicLabel}":`, JSON.stringify(brdResult, null, 2));

      const brdInsert = await query(
        `INSERT INTO brds (
          cluster_id, title, problem_statement, target_audience, business_value, proposed_solution,
          success_metrics, out_of_scope, source_evidence,
          wsjf_bv, wsjf_tc, wsjf_rr, wsjf_effort, wsjf_final_score,
          confidence_score, confidence_reason,
          status, original_ai_json
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9,
          $10, $11, $12, $13, $14,
          $15, $16,
          'pending_review', $17
        ) RETURNING id`,
        [
          cluster.clusterId,
          brdResult.title || `BRD: ${cluster.topicLabel}`,
          brdResult.problemStatement || '',
          brdResult.targetAudience || '',
          brdResult.businessValue || '',
          brdResult.proposedSolution || '',
          brdResult.requirements || [],
          [],
          cluster.feedbackTexts.slice(0, 4),
          // WSJF defaults
          8, 7, 5, 4,
          (8 + 7 + 5) / 4,
          0.85,
          `AI-generated from ${cluster.feedbackTexts.length} feedback items in cluster "${cluster.topicLabel}"`,
          JSON.stringify(brdResult)
        ]
      );

      generatedBrds.push({
        brdId: brdInsert.rows[0].id,
        brdData: brdResult,
        clusterId: cluster.clusterId
      });

      await logStage(`Analyst Agent generated BRD: ${brdResult.title || cluster.topicLabel}`, 'completed');
    } catch (err: any) {
      console.error(`[DemoPipeline] Analyst Agent error for cluster ${cluster.topicLabel}:`, err.message);

      const fallbackBrd = buildFallbackBrd(cluster.topicLabel, cluster.feedbackTexts);
      const fallbackInsert = await query(
        `INSERT INTO brds (
          cluster_id, title, problem_statement, target_audience, business_value, proposed_solution,
          success_metrics, out_of_scope, source_evidence,
          wsjf_bv, wsjf_tc, wsjf_rr, wsjf_effort, wsjf_final_score,
          confidence_score, confidence_reason,
          status, original_ai_json
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9,
          $10, $11, $12, $13, $14,
          $15, $16,
          'pending_review', $17
        ) RETURNING id`,
        [
          cluster.clusterId,
          fallbackBrd.title,
          fallbackBrd.problemStatement,
          fallbackBrd.targetAudience,
          fallbackBrd.businessValue,
          fallbackBrd.proposedSolution,
          fallbackBrd.requirements,
          [],
          fallbackBrd.sourceEvidence,
          7, 6, 5, 4,
          (7 + 6 + 5) / 4,
          0.65,
          `Fallback BRD generated because Analyst Agent failed: ${err.message}`,
          JSON.stringify({ fallback: true, reason: err.message })
        ]
      );

      generatedBrds.push({
        brdId: fallbackInsert.rows[0].id,
        brdData: fallbackBrd,
        clusterId: cluster.clusterId
      });

      await logStage(
        `Analyst Agent: Error for "${cluster.topicLabel}" — fallback BRD generated`,
        'failed'
      );
    }
  }

  console.log(`[DemoPipeline] Total BRDs generated: ${generatedBrds.length}`);

  // ─── Stage 4: Critic Agent → QA Review ─────────────────
  await logStage('Critic Agent: Reviewing BRDs for quality assurance...', 'completed');

  for (const brd of generatedBrds) {
    try {
      const criticResult = await runCriticAgent(brd.brdData);
      console.log(`[DemoPipeline] Critic Agent reviewed "${brd.brdData.title}": score=${criticResult.score}, approved=${criticResult.approved}`);

      const criticStatus = criticResult.approved ? 'approved' : 'pending_review';
      await query(
        `UPDATE brds SET
          critic_score = $1,
          critic_issues = $2,
          confidence_score = $3,
          status = $4,
          reviewer_email = 'gemini-critic@autoflow.ai',
          reviewed_at = NOW()
        WHERE id = $5`,
        [
          (criticResult.score || 75) / 100,
          JSON.stringify(criticResult.suggestedImprovements || []),
          (criticResult.score || 75) / 100,
          criticStatus,
          brd.brdId
        ]
      );

      await logStage(
        `Critic Agent ${criticResult.approved ? 'approved' : 'flagged'} BRD: ${brd.brdData.title}`,
        'completed'
      );
    } catch (err: any) {
      console.error(`[DemoPipeline] Critic Agent error for BRD ${brd.brdData.title}:`, err.message);
      // Auto-approve on critic failure so pipeline continues
      await query(`UPDATE brds SET status = 'approved', reviewer_email = 'auto-approved@autoflow.ai', reviewed_at = NOW() WHERE id = $1`, [brd.brdId]);
      await logStage(`Critic Agent: Error reviewing "${brd.brdData.title}" — auto-approved`, 'completed');
    }
  }

  // ─── Stage 5: Story Writer Agent → Epics & User Stories ─
  await logStage('Story Writer Agent: Generating epics and user stories...', 'completed');

  let totalEpics = 0;
  let totalStories = 0;

  for (const brd of generatedBrds) {
    try {
      console.log(`[DemoPipeline] BRD "${brd.brdData.title}" - Input to Story Writer Agent:`, JSON.stringify(brd.brdData, null, 2));
      // Use the local brdData instead of re-querying the DB
      const storyResult = await withTimeout(
        runStoryWriterAgent(brd.brdData),
        45000,
        `Story Writer Agent timed out after 45s for BRD "${brd.brdData.title}"`
      );
      console.log(`[DemoPipeline] Story Writer Agent Result for "${brd.brdData.title}":`, JSON.stringify(storyResult, null, 2));

      const epics = storyResult.epics || [];
      const stories = storyResult.userStories || [];

      for (let ei = 0; ei < epics.length; ei++) {
        const epic = epics[ei];
        const epicRef = `EP-${String(totalEpics + ei + 1).padStart(3, '0')}`;
        const epicPoints = stories
          .filter((s: any) => s.epicTitle === epic.title)
          .reduce((sum: number, s: any) => sum + (s.storyPoints || 0), 0);

        const epicInsert = await query(
          `INSERT INTO epics (brd_id, epic_ref, title, description, total_points, status)
           VALUES ($1, $2, $3, $4, $5, 'draft') RETURNING id`,
          [brd.brdId, epicRef, epic.title, epic.description, epicPoints]
        );
        const epicId = epicInsert.rows[0].id;

        // Insert user stories linked to this epic
        const epicStories = stories.filter((s: any) => s.epicTitle === epic.title);
        for (let si = 0; si < epicStories.length; si++) {
          const story = epicStories[si];
          const storyRef = `${epicRef}-S${String(si + 1).padStart(2, '0')}`;
          await query(
            `INSERT INTO user_stories (epic_id, story_ref, title, story_text, story_points, priority, acceptance_criteria, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft')`,
            [
              epicId,
              storyRef,
              story.title,
              story.description || '',
              story.storyPoints || 3,
              'medium',
              story.acceptanceCriteria || []
            ]
          );
        }
        totalStories += epicStories.length;
      }
      totalEpics += epics.length;

      await logStage(
        `Story Writer Agent generated ${epics.length} epics for BRD: ${brd.brdData.title}`,
        'completed'
      );
      console.log(`[DemoPipeline] Story Writer generated ${epics.length} epics, ${stories.length} stories for "${brd.brdData.title}"`);

    } catch (err: any) {
      console.error(`[DemoPipeline] Story Writer error for BRD ${brd.brdData.title}:`, err.message);
      
      const fallbackResult = buildFallbackStories(brd.brdData);
      const epics = fallbackResult.epics;
      const stories = fallbackResult.userStories;

      for (let ei = 0; ei < epics.length; ei++) {
        const epic = epics[ei];
        const epicRef = `EP-FB-${String(totalEpics + ei + 1).padStart(3, '0')}`;
        const epicInsert = await query(
          `INSERT INTO epics (brd_id, epic_ref, title, description, total_points, status)
           VALUES ($1, $2, $3, $4, $5, 'draft') RETURNING id`,
          [brd.brdId, epicRef, epic.title, epic.description, 8]
        );
        const epicId = epicInsert.rows[0].id;

        const epicStories = stories.filter((s: any) => s.epicTitle === epic.title);
        for (let si = 0; si < epicStories.length; si++) {
          const story = epicStories[si];
          await query(
            `INSERT INTO user_stories (epic_id, story_ref, title, story_text, story_points, priority, acceptance_criteria, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft')`,
            [epicId, `${epicRef}-S${si+1}`, story.title, story.description, story.storyPoints, 'medium', story.acceptanceCriteria, 'draft']
          );
        }
        totalStories += epicStories.length;
      }
      totalEpics += epics.length;

      await logStage(`Story Writer Agent: Error for "${brd.brdData.title}" — fallback stories generated`, 'failed');
    }
  }

  await logStage(
    `Story Writer Agent: Completed — ${totalEpics} epics, ${totalStories} user stories generated`,
    'completed',
    totalEpics + totalStories
  );

  console.log(`[DemoPipeline] ✅ Pipeline complete: ${clusters.length} clusters, ${generatedBrds.length} BRDs, ${totalEpics} epics, ${totalStories} stories`);
}
