const scenarioSelect = document.querySelector('#scenario');
const requestsInput = document.querySelector('#requests');
const regionInput = document.querySelector('#region');
const runButton = document.querySelector('#runButton');
const statusText = document.querySelector('#status');
const resultBody = document.querySelector('#resultBody');
const reportText = document.querySelector('#reportText');

function scoreOf(row) {
  const success = Number(row.successRatePct ?? 0);
  const latencyPenalty = Number(row.p95LatencyMs ?? 0) * 0.08;
  const violationPenalty = Number(row.sloViolations ?? 0) * 0.02;
  const costPenalty = Number(row.estimatedCostUsd ?? 0) * 8;
  return success - latencyPenalty - violationPenalty - costPenalty;
}

function formatPercent(value) {
  return `${Number(value).toFixed(1)}%`;
}

function formatNumber(value, digits = 2) {
  return Number(value).toFixed(digits);
}

function renderRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    resultBody.innerHTML = '<tr><td colspan="6" class="empty">결과가 없습니다.</td></tr>';
    return;
  }

  let bestPolicy = rows[0];
  for (const row of rows) {
    if (scoreOf(row) > scoreOf(bestPolicy)) {
      bestPolicy = row;
    }
  }

  const html = rows
    .map((row) => {
      const isBest = row.policy === bestPolicy.policy;
      return `
      <tr class="${isBest ? 'best' : ''}">
        <td>${row.policy}${isBest ? ' (추천)' : ''}</td>
        <td>${formatPercent(row.successRatePct)}</td>
        <td>${formatNumber(row.p95LatencyMs, 0)}ms</td>
        <td>${formatNumber(row.estimatedCostUsd, 4)}</td>
        <td>${row.sloViolations}</td>
        <td>${formatNumber(scoreOf(row), 2)}</td>
      </tr>`;
    })
    .join('');

  resultBody.innerHTML = html;
}

async function runSimulation() {
  runButton.disabled = true;
  statusText.textContent = '실행 중...';

  const query = new URLSearchParams({
    scenario: scenarioSelect.value,
    requests: requestsInput.value || '800',
    region: regionInput.value || 'apne2'
  });

  try {
    const response = await fetch(`/api/compare?${query.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    renderRows(data.summaries);
    reportText.textContent = data.markdownReport || '리포트가 생성되지 않았습니다.';
    statusText.textContent = '완료: 결과를 아래에서 비교하세요.';
  } catch (error) {
    statusText.textContent = `오류: ${error instanceof Error ? error.message : 'unknown'}`;
    resultBody.innerHTML = '<tr><td colspan="6" class="empty">실행 실패. 다시 시도해 주세요.</td></tr>';
    reportText.textContent = '오류로 인해 리포트를 생성하지 못했습니다.';
  } finally {
    runButton.disabled = false;
  }
}

runButton.addEventListener('click', runSimulation);
runSimulation();
