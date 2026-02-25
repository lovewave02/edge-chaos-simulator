import { comparePolicies, renderMarkdownReport } from '../src/index.js';

for (const scenario of ['packet_loss', 'regional_outage', 'retry_storm'] as const) {
  const summaries = comparePolicies(scenario, 800, 'apne2');
  console.log(`\n=== scenario: ${scenario} ===`);
  console.log(renderMarkdownReport(summaries));
}
