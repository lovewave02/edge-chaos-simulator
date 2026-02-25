import { describe, expect, it } from 'vitest';

import { renderMarkdownReport } from '../src/index.js';

describe('renderMarkdownReport', () => {
  it('renders report table', () => {
    const md = renderMarkdownReport([
      {
        scenario: 'packet_loss',
        policy: 'fail_open',
        requestCount: 100,
        successRatePct: 95,
        p95LatencyMs: 120,
        estimatedCostUsd: 1.22,
        sloViolations: 3,
        notes: []
      }
    ]);

    expect(md).toContain('# Edge Chaos Report');
    expect(md).toContain('fail_open');
  });
});
