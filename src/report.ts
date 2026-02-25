import type { SimulationSummary } from './types.js';

export function renderMarkdownReport(summaries: SimulationSummary[]): string {
  const lines = [
    '# Edge Chaos Report',
    '',
    'policy | success_rate | p95_latency_ms | slo_violations | estimated_cost_usd',
    '--- | ---: | ---: | ---: | ---:'
  ];

  for (const s of summaries) {
    lines.push(
      `${s.policy} | ${s.successRatePct}% | ${s.p95LatencyMs} | ${s.sloViolations} | $${s.estimatedCostUsd}`
    );
  }

  return lines.join('\n');
}
