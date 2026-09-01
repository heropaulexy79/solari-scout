import {
  CrawlPayload,
  Finding,
  AuditReport,
  ScoreBreakdown,
  Severity,
  LinkResult,
  FormInfo,
  PageMetadata
} from "../types/index.js";

export class AuditEngine {
  static analyze(payload: CrawlPayload): AuditReport {
    const findings: Finding[] = [];

    // 1. Link & Navigation Checks
    const brokenLinks = payload.linksTested.filter(
      (l) => l.outcome === "NOT_FOUND" || l.outcome === "SERVER_ERROR" || l.outcome === "NAVIGATION_ERROR"
    );

    for (const link of brokenLinks) {
      findings.push({
        id: `NAV_BROKEN_${link.url}`,
        severity: link.outcome === "NOT_FOUND" ? "HIGH" : "CRITICAL",
        category: "navigation",
        type: "DETERMINISTIC",
        title: `Broken internal link (${link.outcome})`,
        description: `Link "${link.anchorText || link.url}" on ${link.sourceUrl} resolved with failure status (${link.status || link.error || link.outcome}).`,
        url: link.url,
        recommendation: `Fix or remove broken URL reference at source page ${link.sourceUrl}.`,
        evidence: {
          status: link.status,
          outcome: link.outcome,
          sourcePage: link.sourceUrl,
          anchorText: link.anchorText,
        },
      });
    }

    // Check for JavaScript / empty links
    for (const page of payload.pagesVisited) {
      for (const link of payload.linksTested.filter((l) => l.sourceUrl === page.url)) {
        if (!link.url || link.url === "#" || link.url.startsWith("javascript:")) {
          findings.push({
            id: `NAV_SUSPICIOUS_${page.url}_${link.anchorText}`,
            severity: "LOW",
            category: "navigation",
            type: "DETERMINISTIC",
            title: "Suspicious or empty anchor target",
            description: `Anchor with text "${link.anchorText}" points to empty or inline JS target (${link.url || "empty"}).`,
            url: page.url,
            recommendation: "Replace '#' or inline JavaScript links with accessible buttons or explicit URLs.",
            evidence: { pageUrl: page.url, anchorText: link.anchorText, href: link.url },
          });
        }
      }

      // 2. Technical & Metadata Checks
      const meta = page.metadata;
      if (!meta.title) {
        findings.push({
          id: `META_NO_TITLE_${page.url}`,
          severity: "HIGH",
          category: "metadata",
          type: "DETERMINISTIC",
          title: "Missing HTML page title",
          description: `Page ${page.url} is missing a <title> element.`,
          url: page.url,
          recommendation: "Add a unique, descriptive <title> tag between 10 and 60 characters.",
          evidence: { url: page.url },
        });
      } else if (meta.titleLength < 10 || meta.titleLength > 70) {
        findings.push({
          id: `META_TITLE_LEN_${page.url}`,
          severity: "LOW",
          category: "metadata",
          type: "DETERMINISTIC",
          title: "Suboptimal title length",
          description: `Title "${meta.title}" length (${meta.titleLength} chars) is outside recommended range (10-70 chars).`,
          url: page.url,
          recommendation: "Adjust title tag length for optimal search engine snippet formatting.",
          evidence: { title: meta.title, length: meta.titleLength },
        });
      }

      if (!meta.description) {
        findings.push({
          id: `META_NO_DESC_${page.url}`,
          severity: "MEDIUM",
          category: "metadata",
          type: "DETERMINISTIC",
          title: "Missing meta description",
          description: `Page ${page.url} is missing a meta description tag.`,
          url: page.url,
          recommendation: "Provide a meta description outlining page content.",
          evidence: { url: page.url },
        });
      }

      if (!meta.viewport) {
        findings.push({
          id: `META_NO_VIEWPORT_${page.url}`,
          severity: "HIGH",
          category: "technical",
          type: "DETERMINISTIC",
          title: "Missing responsive viewport meta tag",
          description: `Page ${page.url} does not define viewport settings, breaking mobile responsiveness.`,
          url: page.url,
          recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">.',
          evidence: { url: page.url },
        });
      }

      if (meta.h1Count === 0) {
        findings.push({
          id: `H1_MISSING_${page.url}`,
          severity: "MEDIUM",
          category: "technical",
          type: "DETERMINISTIC",
          title: "Missing main heading (H1)",
          description: `Page ${page.url} contains no <h1> tag.`,
          url: page.url,
          recommendation: "Include exactly one top-level <h1> heading per document.",
          evidence: { url: page.url },
        });
      } else if (meta.h1Count > 1) {
        findings.push({
          id: `H1_MULTIPLE_${page.url}`,
          severity: "LOW",
          category: "technical",
          type: "DETERMINISTIC",
          title: "Multiple H1 headings detected",
          description: `Page ${page.url} contains ${meta.h1Count} <h1> tags.`,
          url: page.url,
          recommendation: "Structure page so primary subject is enclosed in a single <h1> element.",
          evidence: { url: page.url, h1Count: meta.h1Count },
        });
      }

      // 3. Accessibility signals
      if (meta.imagesMissingAlt > 0) {
        findings.push({
          id: `A11Y_IMG_ALT_${page.url}`,
          severity: "MEDIUM",
          category: "accessibility",
          type: "DETERMINISTIC",
          title: "Potential accessibility issue: Images missing alt attributes",
          description: `${meta.imagesMissingAlt} out of ${meta.totalImages} images on ${page.url} lack alt text.`,
          url: page.url,
          recommendation: "Add descriptive alt attributes to informative images, or alt='' for decorative images.",
          evidence: {
            imagesMissingAlt: meta.imagesMissingAlt,
            totalImages: meta.totalImages,
          },
        });
      }

      // 4. Form Checks
      for (const form of page.forms) {
        const unlabeledInputs = form.inputs.filter((i) => !i.hasLabel);
        if (unlabeledInputs.length > 0) {
          findings.push({
            id: `FORM_UNLABELED_${page.url}_${form.action}`,
            severity: "MEDIUM",
            category: "forms",
            type: "DETERMINISTIC",
            title: "Form inputs missing accessible labels",
            description: `Form at ${page.url} has ${unlabeledInputs.length} input(s) without associated <label> elements or aria-label attributes.`,
            url: page.url,
            recommendation: "Ensure all interactive inputs have explicit label associations.",
            evidence: {
              pageUrl: page.url,
              unlabeledInputs: unlabeledInputs.map((i) => i.name || i.id || i.type),
            },
          });
        }

        if (!form.hasSubmitButton) {
          findings.push({
            id: `FORM_NO_SUBMIT_${page.url}_${form.action}`,
            severity: "LOW",
            category: "forms",
            type: "DETERMINISTIC",
            title: "Form missing explicit submit button",
            description: `Form at ${page.url} does not contain an explicit submit button (<button type="submit"> or <input type="submit">).`,
            url: page.url,
            recommendation: "Add a visible submit control to allow unambiguous keyboard and screen-reader submission.",
            evidence: { pageUrl: page.url, action: form.action },
          });
        }

        if (form.isPotentiallyDestructive) {
          findings.push({
            id: `FORM_DESTRUCTIVE_NOTICE_${page.url}`,
            severity: "INFO",
            category: "forms",
            type: "HEURISTIC",
            title: "Form detected with potentially destructive action (Skipped Execution)",
            description: `Form on ${page.url} contains input fields matching login/password/payment keywords. Form submission was safely bypassed.`,
            url: page.url,
            recommendation: "Verify form endpoints independently using authenticated test credentials.",
            evidence: {
              status: form.status,
              reason: form.reason,
              action: form.action,
            },
          });
        }
      }

      // 5. UX / Call to Actions
      for (const cta of page.ctas) {
        if (!cta.isValidLink && cta.href) {
          findings.push({
            id: `CTA_DEAD_${page.url}_${cta.text}`,
            severity: "HIGH",
            category: "ux",
            type: "HEURISTIC",
            title: `Key CTA "${cta.text}" leads to an invalid link`,
            description: `Prominent CTA button/link "${cta.text}" on ${page.url} targets invalid link target "${cta.href}".`,
            url: page.url,
            recommendation: `Update CTA href target on ${page.url}.`,
            evidence: { ctaText: cta.text, href: cta.href },
          });
        }
      }
    }

    // Deduplicate findings by ID
    const dedupedMap = new Map<string, Finding>();
    for (const f of findings) {
      if (!dedupedMap.has(f.id)) {
        dedupedMap.set(f.id, f);
      }
    }
    const finalFindings = Array.from(dedupedMap.values());

    // Calculate score
    const scoreBreakdown: ScoreBreakdown = {
      navigation: calculateSubscore(finalFindings, "navigation", 30),
      technical: calculateSubscore(finalFindings, "technical", 25),
      metadata: calculateSubscore(finalFindings, "metadata", 15),
      accessibility: calculateSubscore(finalFindings, "accessibility", 15),
      forms: calculateSubscore(finalFindings, "forms", 15),
    };

    const overallScore = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          scoreBreakdown.navigation +
            scoreBreakdown.technical +
            scoreBreakdown.metadata +
            scoreBreakdown.accessibility +
            scoreBreakdown.forms
        )
      )
    );

    const counts = {
      criticalCount: finalFindings.filter((f) => f.severity === "CRITICAL").length,
      highCount: finalFindings.filter((f) => f.severity === "HIGH").length,
      mediumCount: finalFindings.filter((f) => f.severity === "MEDIUM").length,
      lowCount: finalFindings.filter((f) => f.severity === "LOW").length,
      infoCount: finalFindings.filter((f) => f.severity === "INFO").length,
    };

    return {
      target: payload.targetUrl,
      domain: payload.domain,
      startedAt: payload.startedAt,
      completedAt: payload.completedAt,
      summary: {
        pagesVisited: payload.pagesVisited.length,
        linksTested: payload.linksTested.length,
        brokenLinks: brokenLinks.length,
        formsDetected: payload.formsDetected.length,
        issuesCount: finalFindings.length - counts.infoCount,
        ...counts,
      },
      score: {
        overall: overallScore,
        breakdown: scoreBreakdown,
        explanation:
          "Health score is calculated based on weighted criteria: Navigation (30%), Technical Integrity (25%), Metadata (15%), Accessibility Signals (15%), Forms (15%). Severity penalties reduce respective subscores.",
      },
      findings: finalFindings,
      pages: payload.pagesVisited.map((p) => ({
        url: p.url,
        status: p.status,
        title: p.metadata.title,
      })),
      linkResults: payload.linksTested,
      forms: payload.formsDetected,
      evidence: payload.pagesVisited
        .filter((p) => p.screenshotPath)
        .map((p) => ({
          type: "screenshot",
          path: p.screenshotPath,
          details: { url: p.url },
        })),
      sessionReplayUrl: payload.sessionReplayUrl,
    };
  }

  static generateMarkdown(report: AuditReport): string {
    const s = report.summary;
    const b = report.score.breakdown;

    const criticalList = report.findings.filter((f) => f.severity === "CRITICAL");
    const highList = report.findings.filter((f) => f.severity === "HIGH");
    const mediumList = report.findings.filter((f) => f.severity === "MEDIUM");
    const lowList = report.findings.filter((f) => f.severity === "LOW");
    const infoList = report.findings.filter((f) => f.severity === "INFO");

    return `# Website Audit Report: ${report.domain}

**Target URL:** ${report.target}  
**Audit Date:** ${new Date(report.startedAt).toUTCString()}  
**Pages Analyzed:** ${s.pagesVisited}  
**Links Tested:** ${s.linksTested}  

---

## Executive Summary

Solari Scout completed an automated web audit of **${report.target}**.

- **Overall Health Score:** **${report.score.overall} / 100**
- **Total Issues Discovered:** ${s.issuesCount}
- **Broken Links:** ${s.brokenLinks}
- **Forms Detected:** ${s.formsDetected}

---

## Health Score Breakdown

| Category | Score Weight | Subscore |
| :--- | :---: | :---: |
| Navigation Integrity | 30% | ${b.navigation} / 30 |
| Technical Integrity | 25% | ${b.technical} / 25 |
| Metadata Compliance | 15% | ${b.metadata} / 15 |
| Accessibility Signals | 15% | ${b.accessibility} / 15 |
| Forms & Controls | 15% | ${b.forms} / 15 |
| **Total Health Score** | **100%** | **${report.score.overall} / 100** |

*Note: Health score is an internal deterministic quality metric calculated by Solari Scout.*

---

## Issue Severity Summary

- **CRITICAL:** ${s.criticalCount}
- **HIGH:** ${s.highCount}
- **MEDIUM:** ${s.mediumCount}
- **LOW:** ${s.lowCount}
- **INFO:** ${s.infoCount}

---

${renderSection("Critical Findings", criticalList)}
${renderSection("High Priority Findings", highList)}
${renderSection("Medium Priority Findings", mediumList)}
${renderSection("Low Priority Findings", lowList)}
${renderSection("Informational Observations", infoList)}

---

## Pages Visited

| URL | Status | Title |
| :--- | :---: | :--- |
${report.pages.map((p) => `| \`${p.url}\` | ${p.status} | ${p.title || "*No Title*"} |`).join("\n")}

---

## Link Outcome Matrix

| Source Page | Anchor / Target | Status | Outcome |
| :--- | :--- | :---: | :--- |
${report.linkResults
  .slice(0, 50)
  .map(
    (l) =>
      `| \`${l.sourceUrl}\` | \`${l.anchorText || l.url}\` | ${l.status || "-"} | ${l.outcome} |`
  )
  .join("\n")}

---

## Form Analysis & Safety Controls

${
  report.forms.length === 0
    ? "_No web forms detected during audit._"
    : report.forms
        .map(
          (f) => `
- **Location:** \`${f.pageUrl}\`
  - **Action:** \`${f.action}\` (${f.method})
  - **Inputs:** ${f.inputs.length} fields (${f.inputs.map((i) => i.type).join(", ")})
  - **Status:** \`${f.status}\` ${f.reason ? `(${f.reason})` : ""}
`
        )
        .join("\n")
}

---

## Evidence & Session Replay

- **Captured Screenshots:** ${report.evidence.length} files saved in \`./reports/evidence/\`
${report.sessionReplayUrl ? `- **Solari Session Replay:** [Watch Replay](${report.sessionReplayUrl})` : "- **Solari Session Replay:** *Not available or recording was not enabled.*"}

---

## Recommended Action Plan

${
  report.findings.length === 0
    ? "No corrective actions required."
    : report.findings
        .filter((f) => f.severity !== "INFO")
        .map((f, idx) => `${idx + 1}. **[${f.severity}] ${f.title}**: ${f.recommendation}`)
        .join("\n")
}
`;
  }
}

function calculateSubscore(findings: Finding[], category: string, maxPoints: number): number {
  const catFindings = findings.filter((f) => f.category === category);
  let penalty = 0;
  for (const f of catFindings) {
    if (f.severity === "CRITICAL") penalty += maxPoints * 0.5;
    else if (f.severity === "HIGH") penalty += maxPoints * 0.3;
    else if (f.severity === "MEDIUM") penalty += maxPoints * 0.15;
    else if (f.severity === "LOW") penalty += maxPoints * 0.05;
  }
  return Math.max(0, Math.round(maxPoints - penalty));
}

function renderSection(title: string, items: Finding[]): string {
  if (items.length === 0) return "";
  return `## ${title}

${items
  .map(
    (f) => `### ${f.title}
- **URL:** \`${f.url}\`
- **Category:** ${f.category} (${f.type})
- **Description:** ${f.description}
- **Recommendation:** ${f.recommendation}
- **Evidence:** \`\`\`json\n${JSON.stringify(f.evidence, null, 2)}\n\`\`\`
`
  )
  .join("\n")}
`;
}
