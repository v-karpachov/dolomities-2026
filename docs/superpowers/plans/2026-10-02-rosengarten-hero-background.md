# Rosengarten Hero Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the detail-page hero with the selected wide Rosengarten panorama.

**Architecture:** Keep the current hero and overlays. Fill the hero with the selected wide panorama, use route-specific positioning at mobile width, then protect the image and sizing with the existing page verification script.

**Tech Stack:** Standalone HTML/CSS, Node.js verification scripts, GitHub Pages.

## Global Constraints

- Use the selected Outdooractive Rosengarten panorama.
- Do not change the gallery, route content, maps, or other pages.
- Preserve the current overlay and hero dimensions.
- Keep the mountain group visible at both desktop and mobile widths.

---

### Task 1: Replace and verify the hero image

**Files:**
- Modify: `rosengarten-sassolungo-marmolada.html`
- Modify: `scripts/verify-langkofel-page.mjs`

**Interfaces:**
- Consumes: the selected wide Outdooractive Rosengarten image URL.
- Produces: an airy Rosengarten hero that preserves the current layout.

- [ ] **Step 1: Add a failing verification check**

Add a check that the detail page contains the selected Outdooractive image URL in `.hero::before`, no longer uses the previous Torri del Vajolet hero, and fills the hero with `cover`.

- [ ] **Step 2: Run the focused verification**

Run: `node scripts/verify-langkofel-page.mjs`

Expected: FAIL for the hero background capability.

- [ ] **Step 3: Replace the image URL**

In `.hero::before`, use:

```css
url("https://img3.oastatic.com/img2/76425499/2500x950r/variant.jpg") center center / cover no-repeat
```

Keep a route-specific mobile `background-position` that preserves the most
recognizable mountain group beside the heading.

- [ ] **Step 4: Verify behavior and presentation**

Run `node scripts/verify-langkofel-page.mjs` and all other `scripts/verify-*.mjs` checks. Inspect the hero at desktop and mobile widths and confirm that the subject remains visible and the title remains readable.

- [ ] **Step 5: Publish**

Commit the HTML, verification script, and this plan; push `main`; wait for the GitHub Pages deployment and verify the live page.
