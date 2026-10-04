# Rosengarten Route URL Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the current route at `rosengarten-sassolungo-marmolada.html` while preserving the previous URL as a redirect.

**Architecture:** Rename the full detail page to the canonical filename, replace the previous file with a small redirect document, and update the index link. Extend the existing Node.js verification scripts before implementation.

**Tech Stack:** Standalone HTML/CSS/JavaScript, Node.js verification scripts, GitHub Pages.

## Global Constraints

- Do not change route content, maps, GPX files, or the archived Seceda route.
- Preserve old incoming links through a redirect page.
- Use `rosengarten-sassolungo-marmolada.html` as the canonical filename.

---

### Task 1: Rename the active route URL

**Files:**
- Rename: `sassolungo-marmolada-costabella.html` to `rosengarten-sassolungo-marmolada.html`
- Create: `sassolungo-marmolada-costabella.html`
- Modify: `index.html`
- Modify: `scripts/verify-index-page.mjs`
- Modify: `scripts/verify-langkofel-page.mjs`

**Interfaces:**
- Consumes: the existing Rosengarten route page and index route card.
- Produces: a canonical page at the new URL plus a compatible legacy redirect.

- [ ] **Step 1: Add failing URL checks**

Require the index and route verifier to use
`rosengarten-sassolungo-marmolada.html`, require the legacy redirect, and
require a canonical link on the renamed page.

- [ ] **Step 2: Confirm the checks fail**

Run `node scripts/verify-index-page.mjs` and
`node scripts/verify-langkofel-page.mjs`. Both must fail because the canonical
file and redirect do not exist yet.

- [ ] **Step 3: Rename the page and add the redirect**

Rename the full page, add its canonical link, update `index.html`, and create a
legacy HTML redirect that targets the canonical filename.

- [ ] **Step 4: Verify and publish**

Run every `scripts/verify-*.mjs` script and `git diff --check`, inspect the new
and legacy URLs locally, then commit, push `main`, wait for GitHub Pages, and
verify both live URLs.
