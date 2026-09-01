import { normalizeUrl, getDomain, isSameDomain, isInternalLink } from "../src/utils/url.js";
import { AuditEngine } from "../src/analyzer/engine.js";
import { CrawlPayload } from "../src/types/index.js";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

console.log("Running Solari Scout Unit Tests...\n");

// 1. Test URL Normalization & Domain Detection
console.log("Test 1: URL Utilities");
assert(normalizeUrl("example.com") === "https://example.com/", "URL prefixing failed");
assert(normalizeUrl("https://example.com/page#section") === "https://example.com/page", "Fragment removal failed");
assert(getDomain("https://sub.example.com/path") === "sub.example.com", "Domain extraction failed");
assert(isSameDomain("https://example.com", "https://sub.example.com"), "Same domain check failed");
assert(isInternalLink("https://example.com/about", "example.com"), "Internal link detection failed");
assert(!isInternalLink("https://google.com", "example.com"), "External link filter failed");
console.log("  ✓ URL utilities passed");

// 2. Test Scoring Engine & Deduplication
console.log("Test 2: Deterministic Audit Engine");
const samplePayload: CrawlPayload = {
  targetUrl: "https://test.com/",
  domain: "test.com",
  startedAt: new Date().toISOString(),
  completedAt: new Date().toISOString(),
  pagesVisited: [
    {
      url: "https://test.com/",
      status: 200,
      metadata: {
        title: "Short",
        titleLength: 5,
        description: "Sample",
        descriptionLength: 6,
        h1Count: 0,
        headingsHierarchyValid: false,
        imagesMissingAlt: 2,
        totalImages: 2,
      },
      internalLinks: ["https://test.com/broken"],
      externalLinks: [],
      forms: [
        {
          pageUrl: "https://test.com/",
          action: "/login",
          method: "POST",
          inputs: [{ name: "password", type: "password", required: true, hasLabel: false }],
          hasSubmitButton: false,
          isPotentiallyDestructive: true,
          status: "SKIPPED_DESTRUCTIVE",
        },
      ],
      ctas: [],
    },
  ],
  linksTested: [
    {
      url: "https://test.com/broken",
      sourceUrl: "https://test.com/",
      anchorText: "Broken",
      status: 404,
      outcome: "NOT_FOUND",
    },
  ],
  formsDetected: [],
  errors: [],
};

const report = AuditEngine.analyze(samplePayload);
assert(report.summary.brokenLinks === 1, "Broken link counting failed");
assert(report.summary.highCount > 0, "High severity count failed");
assert(report.score.overall < 100, "Health score reduction failed");
assert(report.findings.some((f) => f.id.includes("NAV_BROKEN")), "Navigation finding missing");
assert(report.findings.some((f) => f.id.includes("A11Y_IMG_ALT")), "Alt finding missing");
console.log("  ✓ Audit engine passed");

// 3. Test Markdown Report Generation
console.log("Test 3: Markdown Generation");
const markdown = AuditEngine.generateMarkdown(report);
assert(markdown.includes("# Website Audit Report: test.com"), "Markdown header missing");
assert(markdown.includes("Overall Health Score"), "Health score section missing");
console.log("  ✓ Markdown generation passed");

console.log("\nALL UNIT TESTS PASSED SUCCESSFULLY! ✓");
