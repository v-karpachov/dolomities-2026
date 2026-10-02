# Rosengarten Hero Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the detail page hero with the existing Torri del Vajolet photograph.

**Architecture:** Keep the current hero and overlays. Use the selected image at full container width over the existing dark background, then protect the image and sizing with the existing page verification script.

**Tech Stack:** Standalone HTML/CSS, Node.js verification scripts, GitHub Pages.

## Global Constraints

- Reuse the Torri del Vajolet image already present in `index.html`.
- Do not change the gallery, route content, maps, or other pages.
- Preserve the current overlay and hero dimensions.
- Avoid `cover` cropping that makes the towers look excessively enlarged.

---

### Task 1: Replace and verify the hero image

**Files:**
- Modify: `sassolungo-marmolada-costabella.html`
- Modify: `scripts/verify-langkofel-page.mjs`

**Interfaces:**
- Consumes: the Wikimedia Commons Torri del Vajolet URL already used by the route gallery.
- Produces: a hero that displays Torri del Vajolet while preserving the current layout.

- [ ] **Step 1: Add a failing verification check**

Add a check that the detail page contains the Torri del Vajolet image URL in `.hero::before`, no longer contains the Wix background URL, and uses full-width background sizing instead of `cover`.

- [ ] **Step 2: Run the focused verification**

Run: `node scripts/verify-langkofel-page.mjs`

Expected: FAIL for the hero background capability.

- [ ] **Step 3: Replace the image URL**

In `.hero::before`, replace the Wix image URL with:

```css
url("https://upload.wikimedia.org/wikipedia/commons/3/30/Vajolett%C3%BCrme_und_Gartlh%C3%BCtte_SW.JPG") center top / 100% auto no-repeat
```

- [ ] **Step 4: Verify behavior and presentation**

Run `node scripts/verify-langkofel-page.mjs` and all other `scripts/verify-*.mjs` checks. Inspect the hero at desktop and mobile widths and confirm that the subject remains visible and the title remains readable.

- [ ] **Step 5: Publish**

Commit the HTML, verification script, and this plan; push `main`; wait for the GitHub Pages deployment and verify the live page.
