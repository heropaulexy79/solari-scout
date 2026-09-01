# Website Audit Report: example.com

**Target URL:** https://example.com/  
**Audit Date:** Tue, 01 Sep 2026 10:51:50 GMT  
**Pages Analyzed:** 1  
**Links Tested:** 2  

---

## Executive Summary

Solari Scout completed an automated web audit of **https://example.com/**.

- **Overall Health Score:** **89 / 100**
- **Total Issues Discovered:** 2
- **Broken Links:** 1
- **Forms Detected:** 0

---

## Health Score Breakdown

| Category | Score Weight | Subscore |
| :--- | :---: | :---: |
| Navigation Integrity | 30% | 21 / 30 |
| Technical Integrity | 25% | 25 / 25 |
| Metadata Compliance | 15% | 15 / 15 |
| Accessibility Signals | 15% | 13 / 15 |
| Forms & Controls | 15% | 15 / 15 |
| **Total Health Score** | **100%** | **89 / 100** |

*Note: Health score is an internal deterministic quality metric calculated by Solari Scout.*

---

## Issue Severity Summary

- **CRITICAL:** 0
- **HIGH:** 1
- **MEDIUM:** 1
- **LOW:** 0
- **INFO:** 0

---


## High Priority Findings

### Broken internal link (NOT_FOUND)
- **URL:** `https://example.com/broken-link`
- **Category:** navigation (DETERMINISTIC)
- **Description:** Link "Broken Page" on https://example.com/ resolved with failure status (404).
- **Recommendation:** Fix or remove broken URL reference at source page https://example.com/.
- **Evidence:** ```json
{
  "status": 404,
  "outcome": "NOT_FOUND",
  "sourcePage": "https://example.com/",
  "anchorText": "Broken Page"
}
```


## Medium Priority Findings

### Potential accessibility issue: Images missing alt attributes
- **URL:** `https://example.com/`
- **Category:** accessibility (DETERMINISTIC)
- **Description:** 1 out of 3 images on https://example.com/ lack alt text.
- **Recommendation:** Add descriptive alt attributes to informative images, or alt='' for decorative images.
- **Evidence:** ```json
{
  "imagesMissingAlt": 1,
  "totalImages": 3
}
```





---

## Pages Visited

| URL | Status | Title |
| :--- | :---: | :--- |
| `https://example.com/` | 200 | Sample Title for example.com |

---

## Link Outcome Matrix

| Source Page | Anchor / Target | Status | Outcome |
| :--- | :--- | :---: | :--- |
| `https://example.com/` | `About Us` | 200 | PASS |
| `https://example.com/` | `Broken Page` | 404 | NOT_FOUND |

---

## Form Analysis & Safety Controls

_No web forms detected during audit._

---

## Evidence & Session Replay

- **Captured Screenshots:** 0 files saved in `./reports/evidence/`
- **Solari Session Replay:** *Not available or recording was not enabled.*

---

## Recommended Action Plan

1. **[HIGH] Broken internal link (NOT_FOUND)**: Fix or remove broken URL reference at source page https://example.com/.
2. **[MEDIUM] Potential accessibility issue: Images missing alt attributes**: Add descriptive alt attributes to informative images, or alt='' for decorative images.
