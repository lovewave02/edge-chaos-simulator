import { describe, expect, it } from 'vitest';

import { comparePolicies, runSimulation } from '../src/index.js';

describe('runSimulation', () => {
  it('returns bounded metrics', () => {
    const r = runSimulation({
      scenario: 'packet_loss',
      policy: 'nearest_healthy',
      primaryRegion: 'apne2',
      requestCount: 200
    });

    expect(r.successRatePct).toBeGreaterThanOrEqual(0);
    expect(r.successRatePct).toBeLessThanOrEqual(100);
    expect(r.p95LatencyMs).toBeGreaterThan(0);
    expect(r.estimatedCostUsd).toBeGreaterThan(0);
  });

  it('uses fallback route during regional outage', () => {
    const r = runSimulation({
      scenario: 'regional_outage',
      policy: 'nearest_healthy',
      primaryRegion: 'apne2',
      requestCount: 100
    });

    expect(r.notes.join(' ')).toContain('fallback_applied=true');
  });
});

describe('comparePolicies', () => {
  it('returns all policies', () => {
    const rows = comparePolicies('retry_storm', 120, 'apne2');
    expect(rows).toHaveLength(3);
    expect(rows.map((x) => x.policy).sort()).toEqual(['cache_prefer', 'fail_open', 'nearest_healthy']);
  });
});
