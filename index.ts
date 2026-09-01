import { Logger } from "./src/utils/logger.js";
import { SolariBrowserScout } from "./src/browser/scout.js";
import { SolariSandboxAnalyzer } from "./src/sandbox/analyzer.js";
import { ScoutOptions } from "./src/types/index.js";
import { normalizeUrl } from "./src/utils/url.js";
import path from "node:path";
import fs from "node:fs";

// Load .env file if present
if (fs.existsSync(".env")) {
  const envContent = fs.readFileSync(".env", "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...vals] = trimmed.split("=");
      process.env[key.trim()] = vals.join("=").trim();
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  let targetUrl = args.find((arg) => !arg.startsWith("-"));

  if (!targetUrl) {
    targetUrl = "https://example.com";
  }

  const url = normalizeUrl(targetUrl);

  Logger.banner(url);

  const options: ScoutOptions = {
    maxPages: 10,
    maxLinksPerPage: 25,
    maxDepth: 2,
    maxExecutionTimeMs: 60000,
  };

  const apiKey = process.env.SOLARI_API_KEY;

  // [1/6] Launching cloud browser
  Logger.step(1, 6, "Launching cloud browser");
  const scout = new SolariBrowserScout(apiKey);
  Logger.stepDone();

  // [2/6] Discovering website & crawling
  Logger.step(2, 6, "Discovering website");
  // [3/6] Testing navigation
  // [4/6] Collecting evidence
  const crawlPayload = await scout.crawl(url, options);
  Logger.stepDone();

  Logger.step(3, 6, "Testing navigation");
  Logger.stepDone();

  Logger.step(4, 6, "Collecting evidence");
  Logger.stepDone();

  // [5/6] Running sandbox analysis
  Logger.step(5, 6, "Running sandbox analysis");
  const analyzer = new SolariSandboxAnalyzer(apiKey);
  const { report } = await analyzer.runAnalysis(crawlPayload);
  Logger.stepDone();

  // [6/6] Generating report
  Logger.step(6, 6, "Generating report");
  const reportRelPath = `./reports/${report.domain.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-audit.md`;
  Logger.stepDone();

  Logger.summary({
    pagesVisited: report.summary.pagesVisited,
    linksTested: report.summary.linksTested,
    brokenLinks: report.summary.brokenLinks,
    formsDetected: report.summary.formsDetected,
    issuesDiscovered: report.summary.issuesCount,
    critical: report.summary.criticalCount,
    high: report.summary.highCount,
    medium: report.summary.mediumCount,
    low: report.summary.lowCount,
    overallScore: report.score.overall,
    reportPath: path.resolve(reportRelPath),
  });
}

main().catch((err) => {
  console.error("Solari Scout encountered an unexpected error:", err);
  process.exit(1);
});
