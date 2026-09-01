# Website Audit Report: grub.bio

**Target URL:** https://grub.bio/  
**Audit Date:** Tue, 01 Sep 2026 11:58:30 GMT  
**Pages Analyzed:** 7  
**Links Tested:** 10  

---

## Executive Summary

Solari Scout completed an automated web audit of **https://grub.bio/**.

- **Overall Health Score:** **85 / 100**
- **Total Issues Discovered:** 7
- **Broken Links:** 0
- **Forms Detected:** 9

---

## Health Score Breakdown

| Category | Score Weight | Subscore |
| :--- | :---: | :---: |
| Navigation Integrity | 30% | 30 / 30 |
| Technical Integrity | 25% | 25 / 25 |
| Metadata Compliance | 15% | 15 / 15 |
| Accessibility Signals | 15% | 15 / 15 |
| Forms & Controls | 15% | 0 / 15 |
| **Total Health Score** | **100%** | **85 / 100** |

*Note: Health score is an internal deterministic quality metric calculated by Solari Scout.*

---

## Issue Severity Summary

- **CRITICAL:** 0
- **HIGH:** 0
- **MEDIUM:** 7
- **LOW:** 0
- **INFO:** 0

---



## Medium Priority Findings

### Form inputs missing accessible labels
- **URL:** `https://grub.bio/`
- **Category:** forms (DETERMINISTIC)
- **Description:** Form at https://grub.bio/ has 1 input(s) without associated <label> elements or aria-label attributes.
- **Recommendation:** Ensure all interactive inputs have explicit label associations.
- **Evidence:** ```json
{
  "pageUrl": "https://grub.bio/",
  "unlabeledInputs": [
    "email"
  ]
}
```

### Form inputs missing accessible labels
- **URL:** `https://grub.bio/about`
- **Category:** forms (DETERMINISTIC)
- **Description:** Form at https://grub.bio/about has 1 input(s) without associated <label> elements or aria-label attributes.
- **Recommendation:** Ensure all interactive inputs have explicit label associations.
- **Evidence:** ```json
{
  "pageUrl": "https://grub.bio/about",
  "unlabeledInputs": [
    "email"
  ]
}
```

### Form inputs missing accessible labels
- **URL:** `https://grub.bio/contact`
- **Category:** forms (DETERMINISTIC)
- **Description:** Form at https://grub.bio/contact has 6 input(s) without associated <label> elements or aria-label attributes.
- **Recommendation:** Ensure all interactive inputs have explicit label associations.
- **Evidence:** ```json
{
  "pageUrl": "https://grub.bio/contact",
  "unlabeledInputs": [
    "name",
    "organisation",
    "email",
    "phone",
    "inquiry_type",
    "message"
  ]
}
```

### Form inputs missing accessible labels
- **URL:** `https://grub.bio/products`
- **Category:** forms (DETERMINISTIC)
- **Description:** Form at https://grub.bio/products has 7 input(s) without associated <label> elements or aria-label attributes.
- **Recommendation:** Ensure all interactive inputs have explicit label associations.
- **Evidence:** ```json
{
  "pageUrl": "https://grub.bio/products",
  "unlabeledInputs": [
    "company_name",
    "name",
    "industry",
    "email",
    "phone",
    "address",
    "message"
  ]
}
```

### Form inputs missing accessible labels
- **URL:** `https://grub.bio/services`
- **Category:** forms (DETERMINISTIC)
- **Description:** Form at https://grub.bio/services has 1 input(s) without associated <label> elements or aria-label attributes.
- **Recommendation:** Ensure all interactive inputs have explicit label associations.
- **Evidence:** ```json
{
  "pageUrl": "https://grub.bio/services",
  "unlabeledInputs": [
    "email"
  ]
}
```

### Form inputs missing accessible labels
- **URL:** `https://grub.bio/sustainability`
- **Category:** forms (DETERMINISTIC)
- **Description:** Form at https://grub.bio/sustainability has 1 input(s) without associated <label> elements or aria-label attributes.
- **Recommendation:** Ensure all interactive inputs have explicit label associations.
- **Evidence:** ```json
{
  "pageUrl": "https://grub.bio/sustainability",
  "unlabeledInputs": [
    "email"
  ]
}
```

### Form inputs missing accessible labels
- **URL:** `https://grub.bio/technology`
- **Category:** forms (DETERMINISTIC)
- **Description:** Form at https://grub.bio/technology has 1 input(s) without associated <label> elements or aria-label attributes.
- **Recommendation:** Ensure all interactive inputs have explicit label associations.
- **Evidence:** ```json
{
  "pageUrl": "https://grub.bio/technology",
  "unlabeledInputs": [
    "email"
  ]
}
```





---

## Pages Visited

| URL | Status | Title |
| :--- | :---: | :--- |
| `https://grub.bio/` | 200 | Grub.bio | Sustainable Insect Protein & Circular Bioeconomy |
| `https://grub.bio/about` | 200 | About Grub.bio | Driving Circular Bioeconomy Innovation |
| `https://grub.bio/contact` | 200 | Contact Grub.bio | Partner with Circular Economy Experts |
| `https://grub.bio/products` | 200 | Sustainable Products | Insect Protein & Organic Fertilizer |
| `https://grub.bio/services` | 200 | Sustainable Waste Management Services | Grub.bio |
| `https://grub.bio/sustainability` | 200 | Sustainability at Grub.bio | Building a Circular Future |
| `https://grub.bio/technology` | 500 | Circular Biotechnology & AI Technology | Grub.bio |

---

## Link Outcome Matrix

| Source Page | Anchor / Target | Status | Outcome |
| :--- | :--- | :---: | :--- |
| `https://grub.bio/` | `https://grub.bio/` | 200 | PASS |
| `https://grub.bio/` | `About Us` | 200 | PASS |
| `https://grub.bio/` | `https://grub.bio/contact` | 200 | PASS |
| `https://grub.bio/` | `Our Products` | 200 | PASS |
| `https://grub.bio/` | `Our Services` | 200 | PASS |
| `https://grub.bio/` | `Sustainability` | 200 | PASS |
| `https://grub.bio/` | `Our Technology` | 200 | PASS |
| `https://grub.bio/about` | `https://www.facebook.com/share/1BbmfRzVxY/` | 200 | PASS |
| `https://grub.bio/about` | `https://www.instagram.com/grub.bio/` | 200 | PASS |
| `https://grub.bio/about` | `https://x.com/grub_bio` | 200 | PASS |

---

## Form Analysis & Safety Controls


- **Location:** `https://grub.bio/`
  - **Action:** `https://grub.bio/` (GET)
  - **Inputs:** 1 fields (email)
  - **Status:** `SAFE_TESTED` 


- **Location:** `https://grub.bio/about`
  - **Action:** `https://grub.bio/about` (GET)
  - **Inputs:** 1 fields (email)
  - **Status:** `SAFE_TESTED` 


- **Location:** `https://grub.bio/contact`
  - **Action:** `https://grub.bio/contact` (GET)
  - **Inputs:** 6 fields (text, text, email, tel, text, text)
  - **Status:** `SAFE_TESTED` 


- **Location:** `https://grub.bio/contact`
  - **Action:** `https://grub.bio/contact` (GET)
  - **Inputs:** 1 fields (email)
  - **Status:** `SAFE_TESTED` 


- **Location:** `https://grub.bio/products`
  - **Action:** `https://grub.bio/products` (GET)
  - **Inputs:** 7 fields (text, text, text, email, tel, text, text)
  - **Status:** `SAFE_TESTED` 


- **Location:** `https://grub.bio/products`
  - **Action:** `https://grub.bio/products` (GET)
  - **Inputs:** 1 fields (email)
  - **Status:** `SAFE_TESTED` 


- **Location:** `https://grub.bio/services`
  - **Action:** `https://grub.bio/services` (GET)
  - **Inputs:** 1 fields (email)
  - **Status:** `SAFE_TESTED` 


- **Location:** `https://grub.bio/sustainability`
  - **Action:** `https://grub.bio/sustainability` (GET)
  - **Inputs:** 1 fields (email)
  - **Status:** `SAFE_TESTED` 


- **Location:** `https://grub.bio/technology`
  - **Action:** `https://grub.bio/technology` (GET)
  - **Inputs:** 1 fields (email)
  - **Status:** `SAFE_TESTED` 


---

## Evidence & Session Replay

- **Captured Screenshots:** 6 files saved in `./reports/evidence/`
- **Solari Session Replay:** [Watch Replay](https://console.getsolari.com/sessions/ip-10-0-10-199:03d84763-19e1-4e27-bd66-63206a61bdee:cmtik9cse01e1o1013tv1y444:1788263913876.IjK7q_DwB5M_c3NLo_bLSg)

---

## Recommended Action Plan

1. **[MEDIUM] Form inputs missing accessible labels**: Ensure all interactive inputs have explicit label associations.
2. **[MEDIUM] Form inputs missing accessible labels**: Ensure all interactive inputs have explicit label associations.
3. **[MEDIUM] Form inputs missing accessible labels**: Ensure all interactive inputs have explicit label associations.
4. **[MEDIUM] Form inputs missing accessible labels**: Ensure all interactive inputs have explicit label associations.
5. **[MEDIUM] Form inputs missing accessible labels**: Ensure all interactive inputs have explicit label associations.
6. **[MEDIUM] Form inputs missing accessible labels**: Ensure all interactive inputs have explicit label associations.
7. **[MEDIUM] Form inputs missing accessible labels**: Ensure all interactive inputs have explicit label associations.
