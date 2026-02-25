import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { comparePolicies, renderMarkdownReport } from './index.js';
import type { RegionId } from './types.js';

const port = Number(process.env.PORT ?? 18086);
const thisDir = dirname(fileURLToPath(import.meta.url));
const webDir = join(thisDir, 'web');

type ScenarioType = 'packet_loss' | 'regional_outage' | 'retry_storm';
const scenarios = new Set<ScenarioType>(['packet_loss', 'regional_outage', 'retry_storm']);
const regions = new Set<RegionId>(['apne2', 'usw2', 'euw1']);
const contentTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8'
};

function parseScenario(raw: string | null): ScenarioType {
  if (raw && scenarios.has(raw as ScenarioType)) {
    return raw as ScenarioType;
  }
  return 'packet_loss';
}

function parseRegion(raw: string | null): RegionId {
  if (raw && regions.has(raw as RegionId)) {
    return raw as RegionId;
  }
  return 'apne2';
}

async function serveStaticFile(path: string) {
  const filePath = path === '/' ? join(webDir, 'index.html') : join(webDir, path.replace('/static/', ''));
  const extension = filePath.slice(filePath.lastIndexOf('.'));
  const body = await readFile(filePath);
  return {
    status: 200,
    contentType: contentTypes[extension] ?? 'application/octet-stream',
    body
  };
}

createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const method = req.method ?? 'GET';
  const url = new URL(req.url ?? '/', `http://localhost:${port}`);

  if (url.pathname === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    if (method === 'HEAD') {
      res.end();
      return;
    }
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (url.pathname === '/api/compare') {
    const scenario = parseScenario(url.searchParams.get('scenario'));
    const requestCount = Number(url.searchParams.get('requests') ?? 800);
    const safeRequestCount = Number.isFinite(requestCount)
      ? Math.max(100, Math.min(10000, Math.round(requestCount)))
      : 800;
    const userRegion = parseRegion(url.searchParams.get('region'));

    const rows = comparePolicies(scenario, safeRequestCount, userRegion);
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    if (method === 'HEAD') {
      res.end();
      return;
    }
    res.end(
      JSON.stringify({
        scenario,
        requests: safeRequestCount,
        region: userRegion,
        summaries: rows,
        markdownReport: renderMarkdownReport(rows)
      })
    );
    return;
  }

  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'method_not_allowed' }));
    return;
  }

  if (url.pathname === '/' || url.pathname.startsWith('/static/')) {
    try {
      const served = await serveStaticFile(url.pathname);
      res.writeHead(served.status, { 'content-type': served.contentType });
      if (method === 'HEAD') {
        res.end();
        return;
      }
      res.end(served.body);
      return;
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }
  }

  res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ error: 'not_found' }));
}).listen(port, '0.0.0.0', () => {
  console.log(`edge-chaos-simulator listening on ${port}`);
});
