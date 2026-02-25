export type RegionId = 'apne2' | 'usw2' | 'euw1';

export type Scenario = 'packet_loss' | 'regional_outage' | 'retry_storm';

export type FallbackPolicy = 'fail_open' | 'nearest_healthy' | 'cache_prefer';

export interface RegionState {
  id: RegionId;
  baseLatencyMs: number;
  errorRate: number;
  healthy: boolean;
  cacheHitRate: number;
}

export interface SimulationInput {
  scenario: Scenario;
  policy: FallbackPolicy;
  primaryRegion: RegionId;
  requestCount: number;
}

export interface SimulationSummary {
  scenario: Scenario;
  policy: FallbackPolicy;
  requestCount: number;
  successRatePct: number;
  p95LatencyMs: number;
  estimatedCostUsd: number;
  sloViolations: number;
  notes: string[];
}
