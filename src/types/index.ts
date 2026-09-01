export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export type FindingCategory =
  | "navigation"
  | "technical"
  | "metadata"
  | "accessibility"
  | "forms"
  | "ux";

export type FindingType = "DETERMINISTIC" | "HEURISTIC";

export interface Finding {
  id: string;
  severity: Severity;
  category: FindingCategory;
  type: FindingType;
  title: string;
  description: string;
  url: string;
  recommendation: string;
  evidence: Record<string, any>;
}

export interface LinkResult {
  url: string;
  sourceUrl: string;
  anchorText: string;
  status: number | null;
  outcome:
    | "PASS"
    | "REDIRECT"
    | "NOT_FOUND"
    | "SERVER_ERROR"
    | "NAVIGATION_ERROR"
    | "TIMEOUT"
    | "UNKNOWN";
  error?: string;
}

export interface FormInput {
  name: string;
  type: string;
  id?: string;
  label?: string;
  required: boolean;
  hasLabel: boolean;
}

export interface FormInfo {
  pageUrl: string;
  action: string;
  method: string;
  inputs: FormInput[];
  hasSubmitButton: boolean;
  isPotentiallyDestructive: boolean;
  status: "DETECTED_NOT_TESTED" | "SAFE_TESTED" | "SKIPPED_DESTRUCTIVE";
  reason?: string;
}

export interface CTAInfo {
  text: string;
  href?: string;
  pageUrl: string;
  isVisible: boolean;
  isValidLink: boolean;
}

export interface PageMetadata {
  title?: string;
  titleLength: number;
  description?: string;
  descriptionLength: number;
  viewport?: string;
  h1Count: number;
  h1Text?: string;
  headingsHierarchyValid: boolean;
  imagesMissingAlt: number;
  totalImages: number;
}

export interface CrawledPage {
  url: string;
  status: number;
  metadata: PageMetadata;
  internalLinks: string[];
  externalLinks: string[];
  forms: FormInfo[];
  ctas: CTAInfo[];
  screenshotPath?: string;
}

export interface CrawlPayload {
  targetUrl: string;
  domain: string;
  startedAt: string;
  completedAt: string;
  pagesVisited: CrawledPage[];
  linksTested: LinkResult[];
  formsDetected: FormInfo[];
  errors: string[];
  sessionReplayUrl?: string | null;
}

export interface ScoreBreakdown {
  navigation: number;
  technical: number;
  metadata: number;
  accessibility: number;
  forms: number;
}

export interface AuditReport {
  target: string;
  domain: string;
  startedAt: string;
  completedAt: string;
  summary: {
    pagesVisited: number;
    linksTested: number;
    brokenLinks: number;
    formsDetected: number;
    issuesCount: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    infoCount: number;
  };
  score: {
    overall: number;
    breakdown: ScoreBreakdown;
    explanation: string;
  };
  findings: Finding[];
  pages: { url: string; status: number; title?: string }[];
  linkResults: LinkResult[];
  forms: FormInfo[];
  evidence: { type: string; path?: string; details: Record<string, any> }[];
  sessionReplayUrl?: string | null;
}

export interface ScoutOptions {
  maxPages: number;
  maxLinksPerPage: number;
  maxDepth: number;
  maxExecutionTimeMs: number;
}
