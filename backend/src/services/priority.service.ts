interface WsjfInput {
  businessValue: number;       // 1-10
  timeCriticality: number;     // 1-10
  riskReduction: number;       // 1-10
  effort: number;              // 1-10
  sourceWeight: number;        // enterprise=3.0, pro=2.0, free=1.0
  mentionCount: number;
  sentimentIntensity: number;  // 0-1
}

// Formula: WSJF = (BV * sourceWeight + TC + RR) / Effort
// Apply mention boost (log scale) and sentiment boost (1.5x if > 0.8 intensity)
export function calculateWsjf(input: WsjfInput): number {
  const costOfDelay = (input.businessValue * input.sourceWeight) + input.timeCriticality + input.riskReduction;
  const baseScore = costOfDelay / input.effort;
  const mentionBoost = Math.log10(input.mentionCount + 1) * 0.5;
  const sentimentBoost = input.sentimentIntensity > 0.8 ? 1.5 : 1.0;
  return parseFloat((baseScore * sentimentBoost + mentionBoost).toFixed(3));
}
