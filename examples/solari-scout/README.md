# Solari Scout

> **Autonomous Website Intelligence & QA Agent**  
> *Point it at a website. Let it investigate. Get the evidence.*

Solari Scout autonomously investigates websites using a **Solari Cloud Browser**, collects DOM and network evidence, executes deterministic analysis inside a **Solari Sandbox**, and generates structured audit reports (Markdown and JSON).

---

## Architecture & Flow

```text
User Target URL
      │
      ▼
Solari Cloud Browser (@solarisdk/browser)
  ├── Page metadata & heading hierarchy extraction
  ├── Internal link discovery & outcome testing (404/500/timeout)
  ├── Form detection & side-effect safety checks
  └── Screenshot evidence & session recording (.rrweb)
      │
      ▼
Solari Sandbox (@solarisdk/sdk)
  ├── MicroVM isolated filesystem execution
  ├── Deterministic findings & severity calculation
  ├── Health score weighting (0-100)
  └── Structured audit report rendering
      │
      ▼
Artifact Output: ./reports/<domain>-audit.md & .json
```

---

## Why Solari?

Traditional web audit scripts run locally and suffer from anti-bot blocks, IP throttling, unisolated code execution, and unverified mock browser environments. Solari solves these infrastructure challenges:

1. **Cloud Browser (`@solarisdk/browser`)**:
   - Zero browser installation or binary management.
   - Built-in stealth, proxy egress, and Playwright-compatible automation.
   - Per-session recording capturing DOM events for replay verification.

2. **Sandbox (`@solarisdk/sdk`)**:
   - Sub-second Linux microVM startup from snapshot state.
   - Isolated execution of data processing without security risks on host machine.
   - Stateful command execution and file management.

---

## Features

- 🔍 **Autonomous Website Crawling:** Discovers internal pages with configurable recursion limits (`MAX_PAGES`, `MAX_DEPTH`).
- 🔗 **Link Integrity Testing:** Validates link outcomes (`PASS`, `REDIRECT`, `NOT_FOUND`, `SERVER_ERROR`, `NAVIGATION_ERROR`).
- 🛡️ **Safety-First Form Inspection:** Detects form controls while explicitly skipping destructive submit triggers (passwords, credit cards, payment actions).
- 🏷️ **Technical & Meta Checks:** Identifies missing `<title>`, viewport tags, H1 heading anomalies, and missing image `alt` attributes.
- 📊 **Transparent Health Score:** Evaluates website health (0-100) across Navigation, Technical Integrity, Metadata, Accessibility Signals, and Forms.
- 📸 **Evidence-First Reports:** Produces timestamped Markdown (`-audit.md`), structured JSON (`-audit.json`), and captured screenshots.

---

## Quickstart

### 1. Installation

```bash
git clone https://github.com/solari-sdk/solari-cookbook.git
cd solari-cookbook/examples/solari-scout
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and set your API key:

```bash
export SOLARI_API_KEY=slr_live_your_api_key_here
```

### 3. Run Solari Scout

```bash
npm start -- https://example.com
```

---

## Example CLI Output

```text
╭────────────────────────────────────────╮
│             SOLARI SCOUT               │
│     Autonomous Website Intelligence    │
╰────────────────────────────────────────╯

Target: https://example.com

[1/6] Launching cloud browser .......... ✓
[2/6] Discovering website .............. ✓
[3/6] Testing navigation ............... ✓
[4/6] Collecting evidence .............. ✓
[5/6] Running sandbox analysis .......... ✓
[6/6] Generating report ................ ✓

AUDIT COMPLETE

Pages visited:       10
Links tested:        25
Broken links:        1
Forms detected:      1
Issues discovered:   4

Critical:             0
High:                 1
Medium:               2
Low:                  1

Website Health:      85/100

Report:
./reports/example-com-audit.md
```

---

## Health Scoring Model

| Dimension | Weight | Criteria Evaluated |
| :--- | :---: | :--- |
| **Navigation Integrity** | 30% | Broken internal links (404/500), dead-end pages, navigation errors. |
| **Technical Integrity** | 25% | Viewport meta tags, heading structure, document layout integrity. |
| **Metadata Compliance** | 15% | Page titles, title lengths (10-70 chars), meta descriptions. |
| **Accessibility Signals**| 15% | Missing image alt attributes, unlabeled interactive elements. |
| **Forms & Controls** | 15% | Missing submit controls, form field labels, unsafe submission risks. |

---

## Safety & Security Safeguards

Solari Scout enforces strict execution safety:
- **No Destructive Submissions:** Forms containing sensitive words (`password`, `card`, `pay`, `delete`) are logged with status `SKIPPED_DESTRUCTIVE` and skipped.
- **Domain Locking:** Crawling is strictly restricted to the target domain to prevent unauthorized external crawling.
- **Resource Limits:** Default timeout of 60 seconds and maximum page limits prevent runaway execution.
- **Process Teardown:** Explicit calls to `solari.close()` and `sandbox.kill()` clean up cloud browser slots and VM instances immediately.

---

## Testing

Run the included unit test suite:

```bash
npm test
```

Typecheck TypeScript source:

```bash
npm run typecheck
```

---

## License

MIT
