"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateWsjf = calculateWsjf;
// Formula: WSJF = (BV * sourceWeight + TC + RR) / Effort
// Apply mention boost (log scale) and sentiment boost (1.5x if > 0.8 intensity)
function calculateWsjf(input) {
    const costOfDelay = (input.businessValue * input.sourceWeight) + input.timeCriticality + input.riskReduction;
    const baseScore = costOfDelay / input.effort;
    const mentionBoost = Math.log10(input.mentionCount + 1) * 0.5;
    const sentimentBoost = input.sentimentIntensity > 0.8 ? 1.5 : 1.0;
    return parseFloat((baseScore * sentimentBoost + mentionBoost).toFixed(3));
}
