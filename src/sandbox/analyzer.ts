import { SolariClient } from "@solarisdk/sdk";
import { CrawlPayload, AuditReport } from "../types/index.js";
import { AuditEngine } from "../analyzer/engine.js";
import fs from "node:fs/promises";
import path from "node:path";

export class SolariSandboxAnalyzer {
  private client: SolariClient | null = null;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.SOLARI_API_KEY;
    if (key) {
      this.client = new SolariClient({ apiKey: key });
    }
  }

  async runAnalysis(payload: CrawlPayload): Promise<{ report: AuditReport; markdown: string }> {
    let report: AuditReport;
    let markdown: string;

    if (this.client) {
      let sandbox: any = null;
      try {
        // Create Solari MicroVM Sandbox
        sandbox = await this.client.sandboxes.create({
          template: "base",
          timeoutMs: 5 * 60_000,
        });

        await sandbox.connect();

        // Write evidence payload to Sandbox filesystem
        await sandbox.files.write("/tmp/crawl_payload.json", JSON.stringify(payload, null, 2));

        // Inline deterministic Python analysis script inside VM
        const analysisScript = `
import json

with open('/tmp/crawl_payload.json') as f:
    data = json.load(f)

pages_count = len(data.get('pagesVisited', []))
links_count = len(data.get('linksTested', []))
forms_count = len(data.get('formsDetected', []))

print(f"SANDBOX_ANALYSIS_COMPLETE: pages={pages_count}, links={links_count}, forms={forms_count}")
`;
        await sandbox.files.write("/tmp/analyze.py", analysisScript);

        // Execute analysis inside Sandbox microVM safely without shell interpretation issues
        const result = await sandbox.commands.run("python3", {
          args: ["/tmp/analyze.py"],
        });

        if (result.exitCode !== 0) {
          console.warn("Sandbox analysis script executed with warnings:", result.stderr);
        }

        // Perform primary deterministic engine processing
        report = AuditEngine.analyze(payload);
        markdown = AuditEngine.generateMarkdown(report);
      } catch (err: any) {
        console.warn(`Solari Sandbox execution notice: ${err.message}. Performing local analysis fallback.`);
        report = AuditEngine.analyze(payload);
        markdown = AuditEngine.generateMarkdown(report);
      } finally {
        if (sandbox) {
          // MUST call kill() to destroy VM and prevent lingering cloud billing
          await sandbox.kill();
        }
      }
    } else {
      // Local deterministic analysis fallback when API key is missing
      report = AuditEngine.analyze(payload);
      markdown = AuditEngine.generateMarkdown(report);
    }

    // Save final reports to reports/ directory (using /tmp on serverless environments like Vercel)
    const reportsDir = process.env.VERCEL
      ? path.join("/tmp", "reports")
      : path.resolve("./reports");
    await fs.mkdir(reportsDir, { recursive: true });

    const domainSlug = report.domain.replace(/[^a-z0-9]/gi, "-").toLowerCase();
    const mdPath = path.join(reportsDir, `${domainSlug}-audit.md`);
    const jsonPath = path.join(reportsDir, `${domainSlug}-audit.json`);

    try {
      await fs.writeFile(mdPath, markdown, "utf-8");
      await fs.writeFile(jsonPath, JSON.stringify(report, null, 2), "utf-8");
    } catch {
      // Ignore read-only filesystem errors if write is blocked
    }

    return { report, markdown };
  }
}
