import { createServer } from 'node:http';

import { comparePolicies, renderMarkdownReport } from './index.js';

const port = Number(process.env.PORT ?? 18086);

createServer((req, res) => {
  if ((req.url ?? '/').startsWith('/health')) {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  const url = new URL(req.url ?? '/', `http://localhost:${port}`);
  const scenario = (url.searchParams.get('scenario') ?? 'packet_loss') as
    | 'packet_loss'
    | 'regional_outage'
    | 'retry_storm';

  const rows = comparePolicies(scenario, 800, 'apne2');
  res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
  res.end(
    JSON.stringify({
      scenario,
      summaries: rows,
      markdownReport: renderMarkdownReport(rows)
    })
  );
}).listen(port, '0.0.0.0', () => {
  console.log(`edge-chaos-simulator listening on ${port}`);
});
