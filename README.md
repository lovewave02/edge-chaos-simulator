# Edge Chaos Simulator

A simulation sandbox for "what happens if edge regions degrade/fail" with automatic fallback policy scoring.

## Why this is portfolio-worthy
- Reliability engineering + system design depth.
- Demonstrates measurable tradeoffs (latency, error rate, cost).
- Rare and memorable interview project.

## MVP scope
- Simulate region latency/error injection
- Evaluate fallback policies (fail-open, nearest healthy, cached)
- Output SLO impact report

## Tech stack
- Runtime: TypeScript
- Queue/state: lightweight in-memory for MVP
- Optional deployment: Cloudflare Workers/Durable Objects
