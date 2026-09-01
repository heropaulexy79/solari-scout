document.addEventListener('DOMContentLoaded', () => {
  const auditForm = document.getElementById('audit-form');
  const targetUrlInput = document.getElementById('target-url');
  const submitBtn = document.getElementById('submit-btn');
  const progressContainer = document.getElementById('progress-container');
  const resultsDashboard = document.getElementById('results-dashboard');
  const quickLinksContainer = document.getElementById('quick-links');
  const savedReportsBtn = document.getElementById('saved-reports-btn');
  const reportsCountSpan = document.getElementById('reports-count');
  const reportsDrawer = document.getElementById('reports-drawer');
  const closeDrawerBtn = document.getElementById('close-drawer');
  const reportsList = document.getElementById('reports-list');

  let currentReport = null;

  // Load saved audits on startup
  fetchReports();

  // Submit Audit Form
  auditForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = targetUrlInput.value.trim();
    if (!url) return;

    startAudit(url);
  });

  // Drawer Toggles
  savedReportsBtn.addEventListener('click', () => reportsDrawer.classList.remove('hidden'));
  closeDrawerBtn.addEventListener('click', () => reportsDrawer.classList.add('hidden'));

  async function fetchReports() {
    try {
      const res = await fetch('/api/reports');
      const reports = await res.json();
      reportsCountSpan.textContent = reports.length;

      // Render Quick Target Pills
      quickLinksContainer.innerHTML = '';
      reports.slice(0, 4).forEach((r) => {
        const pill = document.createElement('button');
        pill.className = 'pill';
        pill.textContent = r.domain;
        pill.addEventListener('click', () => loadReport(r.file));
        quickLinksContainer.appendChild(pill);
      });

      // Render Drawer List
      reportsList.innerHTML = '';
      reports.forEach((r) => {
        const item = document.createElement('div');
        item.className = 'finding-item';
        item.style.cursor = 'pointer';
        item.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong>${r.domain}</strong>
            <span class="badge ${r.overallScore >= 80 ? 'solari-badge' : ''}">${r.overallScore}/100</span>
          </div>
          <p style="font-size:0.75rem; color:var(--text-muted); margin-top:0.25rem;">${new Date(r.date).toLocaleString()}</p>
        `;
        item.addEventListener('click', () => {
          loadReport(r.file);
          reportsDrawer.classList.add('hidden');
        });
        reportsList.appendChild(item);
      });
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    }
  }

  async function startAudit(url) {
    // Reset UI
    progressContainer.classList.remove('hidden');
    resultsDashboard.classList.add('hidden');
    submitBtn.disabled = true;
    resetSteps();

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, maxPages: 10, maxDepth: 2 }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const payload = JSON.parse(line.replace('data: ', ''));
            updateStepUI(payload);

            if (payload.extra && payload.extra.report) {
              currentReport = payload.extra.report;
              renderDashboard(currentReport);
              fetchReports();
            }
          }
        }
      }
    } catch (err) {
      console.error('Audit execution error:', err);
    } finally {
      submitBtn.disabled = false;
    }
  }

  function resetSteps() {
    document.querySelectorAll('.step-item').forEach((el) => {
      el.classList.remove('active', 'completed');
      el.querySelector('.step-icon').textContent = '⏳';
    });
  }

  function updateStepUI(eventData) {
    const { step, status } = eventData;
    const stepEl = document.querySelector(`.step-item[data-step="${step}"]`);
    if (!stepEl) return;

    if (status === 'in_progress') {
      stepEl.classList.add('active');
      stepEl.querySelector('.step-icon').textContent = '⚡';
    } else if (status === 'done') {
      stepEl.classList.remove('active');
      stepEl.classList.add('completed');
      stepEl.querySelector('.step-icon').textContent = '✓';
    }
  }

  async function loadReport(filename) {
    try {
      const res = await fetch(`/api/reports/${filename}`);
      const report = await res.json();
      currentReport = report;
      renderDashboard(report);
      resultsDashboard.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to load report:', err);
    }
  }

  function renderDashboard(report) {
    progressContainer.classList.add('hidden');
    resultsDashboard.classList.remove('hidden');

    document.getElementById('target-domain-display').textContent = report.domain;

    // Health score radial chart
    const scoreVal = report.score.overall;
    document.getElementById('overall-score-val').textContent = scoreVal;
    const strokeEl = document.getElementById('score-stroke');
    strokeEl.setAttribute('stroke-dasharray', `${scoreVal}, 100`);

    // Session replay URL
    const replayContainer = document.getElementById('replay-container');
    const replayLink = document.getElementById('replay-link');
    if (report.sessionReplayUrl) {
      replayContainer.classList.remove('hidden');
      replayLink.href = report.sessionReplayUrl;
    } else {
      replayContainer.classList.add('hidden');
    }

    // Breakdown subscores
    const b = report.score.breakdown;
    document.getElementById('score-nav').textContent = `${b.navigation} / 30`;
    document.getElementById('score-tech').textContent = `${b.technical} / 25`;
    document.getElementById('score-meta').textContent = `${b.metadata} / 15`;
    document.getElementById('score-a11y').textContent = `${b.accessibility} / 15`;
    document.getElementById('score-forms').textContent = `${b.forms} / 15`;

    // Metric Counters
    const s = report.summary;
    document.getElementById('m-pages').textContent = s.pagesVisited;
    document.getElementById('m-links').textContent = s.linksTested;
    document.getElementById('m-broken').textContent = s.brokenLinks;
    document.getElementById('m-forms').textContent = s.formsDetected;
    document.getElementById('m-issues').textContent = s.issuesCount;

    document.getElementById('cnt-all').textContent = report.findings.length;
    document.getElementById('cnt-critical').textContent = s.criticalCount;
    document.getElementById('cnt-high').textContent = s.highCount;
    document.getElementById('cnt-medium').textContent = s.mediumCount;
    document.getElementById('cnt-low').textContent = s.lowCount;

    // Render Findings List
    renderFindings(report.findings);

    // Render Pages Table
    const pagesTbody = document.querySelector('#pages-table tbody');
    pagesTbody.innerHTML = report.pages
      .map(
        (p) => `
      <tr>
        <td><code>${p.url}</code></td>
        <td><span class="badge ${p.status === 200 ? 'solari-badge' : ''}">${p.status}</span></td>
        <td>${p.title || '<em>No title</em>'}</td>
      </tr>
    `
      )
      .join('');

    // Render Links Table
    const linksTbody = document.querySelector('#links-table tbody');
    linksTbody.innerHTML = report.linkResults
      .slice(0, 30)
      .map(
        (l) => `
      <tr>
        <td><code>${l.sourceUrl}</code></td>
        <td><code>${l.anchorText || l.url}</code></td>
        <td><span class="badge ${l.outcome === 'PASS' ? 'solari-badge' : ''}">${l.outcome}</span></td>
      </tr>
    `
      )
      .join('');

    // Severity Filters Event Handling
    document.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.onclick = () => {
        document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const sev = btn.dataset.sev;
        if (sev === 'ALL') renderFindings(report.findings);
        else renderFindings(report.findings.filter((f) => f.severity === sev));
      };
    });
  }

  function renderFindings(findings) {
    const container = document.getElementById('findings-list');
    if (findings.length === 0) {
      container.innerHTML = '<p style="color:var(--text-muted); padding:1rem;">No findings match selected filter.</p>';
      return;
    }

    container.innerHTML = findings
      .map(
        (f) => `
      <div class="finding-item">
        <div class="finding-header">
          <strong>${f.title}</strong>
          <span class="sev-badge ${f.severity}">${f.severity}</span>
        </div>
        <p style="font-size:0.875rem; color:var(--text-muted);">${f.description}</p>
        <div class="finding-rec">
          💡 <strong>Recommendation:</strong> ${f.recommendation}
        </div>
      </div>
    `
      )
      .join('');
  }
});
