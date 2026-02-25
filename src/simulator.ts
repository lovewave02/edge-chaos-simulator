export type Scenario = 'packet_loss' | 'regional_outage' | 'retry_storm';

export function runScenario(s: Scenario) {
  return { scenario: s, status: 'stub', sloImpact: 0 };
}
