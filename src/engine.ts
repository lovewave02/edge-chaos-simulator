import { applyScenario, defaultRegions } from './scenarios.js';
import type { FallbackPolicy, RegionState, SimulationInput, SimulationSummary } from './types.js';

function pickFallback(regions: RegionState[], policy: FallbackPolicy, primaryRegion: RegionState): RegionState {
  if (policy === 'nearest_healthy') {
    const healthy = regions.filter((r) => r.healthy);
    return healthy.sort((a, b) => a.baseLatencyMs - b.baseLatencyMs)[0] ?? primaryRegion;
  }

  if (policy === 'cache_prefer') {
    const healthy = regions.filter((r) => r.healthy);
    return (
      healthy.sort((a, b) => b.cacheHitRate - a.cacheHitRate || a.baseLatencyMs - b.baseLatencyMs)[0] ??
      primaryRegion
    );
  }

  return primaryRegion;
}

function simulateRequest(region: RegionState, policy: FallbackPolicy): { ok: boolean; latency: number; cost: number } {
  const cacheSavedMs = policy === 'cache_prefer' ? region.cacheHitRate * 20 : 0;
  const latency = Math.max(1, region.baseLatencyMs - cacheSavedMs);

  let failureChance = region.errorRate;
  if (policy === 'fail_open') {
    failureChance = Math.max(0, failureChance - 0.03);
  }

  const ok = Math.random() >= failureChance;
  const cost = 0.0009 + latency * 0.000002;
  return { ok, latency, cost };
}

function percentile95(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const idx = Math.min(s.length - 1, Math.floor(s.length * 0.95));
  return Number((s[idx] ?? 0).toFixed(1));
}

export function runSimulation(input: SimulationInput): SimulationSummary {
  const base = defaultRegions();
  const regions = applyScenario(base, input.scenario);

  const primary = regions.find((r) => r.id === input.primaryRegion) ?? regions[0];
  const routed = primary.healthy ? primary : pickFallback(regions, input.policy, primary);

  let success = 0;
  let sloViolations = 0;
  let totalCost = 0;
  const latencies: number[] = [];

  for (let i = 0; i < input.requestCount; i += 1) {
    const result = simulateRequest(routed, input.policy);
    latencies.push(result.latency);
    totalCost += result.cost;
    if (result.ok) success += 1;
    if (result.latency > 200 || !result.ok) sloViolations += 1;
  }

  const notes = [
    `primary=${input.primaryRegion}`,
    `routed=${routed.id}`,
    routed.id !== input.primaryRegion ? 'fallback_applied=true' : 'fallback_applied=false'
  ];

  return {
    scenario: input.scenario,
    policy: input.policy,
    requestCount: input.requestCount,
    successRatePct: Number(((success / input.requestCount) * 100).toFixed(2)),
    p95LatencyMs: percentile95(latencies),
    estimatedCostUsd: Number(totalCost.toFixed(4)),
    sloViolations,
    notes
  };
}

export function comparePolicies(
  scenario: SimulationInput['scenario'],
  requestCount = 1000,
  primaryRegion: SimulationInput['primaryRegion'] = 'apne2'
): SimulationSummary[] {
  const policies: FallbackPolicy[] = ['fail_open', 'nearest_healthy', 'cache_prefer'];
  return policies.map((policy) => runSimulation({ scenario, policy, requestCount, primaryRegion }));
}
