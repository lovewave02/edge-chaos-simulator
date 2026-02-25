import { describe, expect, it } from 'vitest';

import { runSimulation } from '../src/index.js';

describe('smoke', () => {
  it('runs without crash', () => {
    const r = runSimulation({
      scenario: 'packet_loss',
      policy: 'cache_prefer',
      primaryRegion: 'apne2',
      requestCount: 50
    });

    expect(r.requestCount).toBe(50);
  });
});
