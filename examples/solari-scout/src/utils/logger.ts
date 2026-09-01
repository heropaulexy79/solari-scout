export class Logger {
  static banner(targetUrl: string) {
    console.log(`
╭────────────────────────────────────────╮
│             SOLARI SCOUT               │
│     Autonomous Website Intelligence    │
╰────────────────────────────────────────╯

Target: ${targetUrl}
`);
  }

  static step(stepNum: number, totalSteps: number, title: string) {
    const padded = `[${stepNum}/${totalSteps}] ${title}`.padEnd(40, ".");
    process.stdout.write(`${padded} `);
  }

  static stepDone() {
    console.log("✓");
  }

  static stepFailed(reason?: string) {
    console.log(`✗ ${reason ? `(${reason})` : ""}`);
  }

  static info(msg: string) {
    console.log(`  ℹ ${msg}`);
  }

  static summary(data: {
    pagesVisited: number;
    linksTested: number;
    brokenLinks: number;
    formsDetected: number;
    issuesDiscovered: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    overallScore: number;
    reportPath: string;
  }) {
    console.log(`
AUDIT COMPLETE

Pages visited:       ${data.pagesVisited}
Links tested:        ${data.linksTested}
Broken links:        ${data.brokenLinks}
Forms detected:      ${data.formsDetected}
Issues discovered:   ${data.issuesDiscovered}

Critical:             ${data.critical}
High:                 ${data.high}
Medium:               ${data.medium}
Low:                  ${data.low}

Website Health:      ${data.overallScore}/100

Report:
${data.reportPath}
`);
  }
}
