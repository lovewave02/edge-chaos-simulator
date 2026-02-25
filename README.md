# Edge Chaos Simulator

Simulation lab for evaluating edge failure scenarios and fallback policy tradeoffs.

## MVP implemented
- Scenario injection:
  - `packet_loss`
  - `regional_outage`
  - `retry_storm`
- Fallback policies:
  - `fail_open`
  - `nearest_healthy`
  - `cache_prefer`
- SLO-style outputs:
  - success rate
  - p95 latency
  - estimated cost
  - SLO violations
- Markdown report generator and runnable scenario example

## Quick start
```bash
npm install
npm test
npm run build
npm run dev:example
```

## Core files
- `src/scenarios.ts`: scenario application to regional state
- `src/engine.ts`: request simulation and policy comparison
- `src/report.ts`: markdown reporting
- `examples/run-scenarios.ts`: end-to-end sample run

## Why this is portfolio-worthy
- Shows reliability engineering thinking with measurable outcomes.
- Makes tradeoffs explicit instead of hand-wavy architecture claims.
- Easy to demo in interview: run one command, compare policies.

## Next roadmap
1. Seeded deterministic RNG for reproducible benchmark runs
2. Add visualization dashboard for policy comparison history
3. Add strategy plugin API for custom routing algorithms
