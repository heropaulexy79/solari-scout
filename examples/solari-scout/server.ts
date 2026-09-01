import express from "express";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { SolariBrowserScout } from "./src/browser/scout.js";
import { SolariSandboxAnalyzer } from "./src/sandbox/analyzer.js";
import { ScoutOptions, AuditReport } from "./src/types/index.js";
import { normalizeUrl } from "./src/utils/url.js";

// ESM-compatible __dirname (works locally and in Vercel Lambda)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env if present (local dev only — Vercel injects env vars directly)
const localEnv = path.join(__dirname, ".env");
if (fs.existsSync(localEnv)) {
  const envContent = fs.readFileSync(localEnv, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...vals] = trimmed.split("=");
      process.env[key.trim()] = vals.join("=").trim();
    }
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/evidence", express.static(path.join(__dirname, "reports", "evidence")));


const getReportsDir = () => {
  if (process.env.VERCEL) {
    const tmpDir = path.join("/tmp", "reports");
    if (fs.existsSync(tmpDir)) return tmpDir;
  }
  return path.resolve("./reports");
};

// GET /api/reports - List existing audit reports
app.get("/api/reports", async (req, res) => {
  try {
    const reportsDir = getReportsDir();
    if (!fs.existsSync(reportsDir)) {
      return res.json([]);
    }
    const files = fs.readdirSync(reportsDir);
    const jsonFiles = files.filter((f) => f.endsWith("-audit.json"));

    const reports: Array<{ domain: string; file: string; target: string; overallScore: number; date: string }> = [];
    for (const file of jsonFiles) {
      try {
        const raw = fs.readFileSync(path.join(reportsDir, file), "utf-8");
        const data: AuditReport = JSON.parse(raw);
        reports.push({
          domain: data.domain,
          file,
          target: data.target,
          overallScore: data.score.overall,
          date: data.startedAt,
        });
      } catch {
        // Ignore unparseable files
      }
    }

    reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json(reports);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/:filename - Fetch specific report JSON
app.get("/api/reports/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;
    const safeName = path.basename(filename);
    const reportsDir = getReportsDir();
    const filePath = path.join(reportsDir, safeName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Report not found" });
    }

    const content = fs.readFileSync(filePath, "utf-8");
    res.json(JSON.parse(content));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/audit - Trigger audit execution with SSE streaming progress
app.post("/api/audit", async (req, res) => {
  const { url, maxPages = 10, maxDepth = 2 } = req.body;

  if (!url) {
    return res.status(400).json({ error: "Target URL is required" });
  }

  const normalizedTarget = normalizeUrl(url);
  const apiKey = process.env.SOLARI_API_KEY;

  // Set SSE headers for real-time progress updates
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendEvent = (step: number, total: number, title: string, status: "in_progress" | "done" | "error", extra?: any) => {
    res.write(`data: ${JSON.stringify({ step, total, title, status, extra })}\n\n`);
  };

  try {
    sendEvent(1, 6, "Launching cloud browser", "in_progress");
    const scout = new SolariBrowserScout(apiKey);
    sendEvent(1, 6, "Launching cloud browser", "done");

    sendEvent(2, 6, "Discovering website", "in_progress");
    const options: ScoutOptions = {
      maxPages: Number(maxPages) || 10,
      maxLinksPerPage: 25,
      maxDepth: Number(maxDepth) || 2,
      maxExecutionTimeMs: 60000,
    };

    const crawlPayload = await scout.crawl(normalizedTarget, options);
    sendEvent(2, 6, "Discovering website", "done", { pagesCount: crawlPayload.pagesVisited.length });

    sendEvent(3, 6, "Testing navigation", "in_progress");
    sendEvent(3, 6, "Testing navigation", "done", { linksCount: crawlPayload.linksTested.length });

    sendEvent(4, 6, "Collecting evidence", "in_progress");
    sendEvent(4, 6, "Collecting evidence", "done", { formsCount: crawlPayload.formsDetected.length });

    sendEvent(5, 6, "Running sandbox analysis", "in_progress");
    const analyzer = new SolariSandboxAnalyzer(apiKey);
    const { report } = await analyzer.runAnalysis(crawlPayload);
    sendEvent(5, 6, "Running sandbox analysis", "done");

    sendEvent(6, 6, "Generating report", "in_progress");
    const filename = `${report.domain.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-audit.json`;
    sendEvent(6, 6, "Generating report", "done", { report, filename });

    res.end();
  } catch (err: any) {
    sendEvent(6, 6, "Audit failed", "error", { message: err.message });
    res.end();
  }
});

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`
╭────────────────────────────────────────╮
│             SOLARI SCOUT               │
│     Web Dashboard Active               │
╰────────────────────────────────────────╯

Server running at: http://localhost:${PORT}
`);
  });
}

export default app;

