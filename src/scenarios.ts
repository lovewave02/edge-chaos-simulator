import type { RegionState, Scenario } from './types.js';

export function defaultRegions(): RegionState[] {
  return [
    { id: 'apne2', baseLatencyMs: 55, errorRate: 0.01, healthy: true, cacheHitRate: 0.14 },
    { id: 'usw2', baseLatencyMs: 88, errorRate: 0.015, healthy: true, cacheHitRate: 0.2 },
    { id: 'euw1', baseLatencyMs: 120, errorRate: 0.018, healthy: true, cacheHitRate: 0.17 }
  ];
}

export function applyScenario(regions: RegionState[], scenario: Scenario): RegionState[] {
  const updated = regions.map((r) => ({ ...r }));

  if (scenario === 'packet_loss') {
    const target = updated.find((r) => r.id === 'apne2');
    if (target) {
      target.errorRate += 0.12;
      target.baseLatencyMs += 35;
    }
  }

  if (scenario === 'regional_outage') {
    const target = updated.find((r) => r.id === 'apne2');
    if (target) {
      target.healthy = false;
      target.errorRate = 1;
      target.baseLatencyMs += 300;
    }
  }

  if (scenario === 'retry_storm') {
    for (const r of updated) {
      r.errorRate = Math.min(1, r.errorRate + 0.08);
      r.baseLatencyMs += 45;
    }
  }

  return updated;
}
