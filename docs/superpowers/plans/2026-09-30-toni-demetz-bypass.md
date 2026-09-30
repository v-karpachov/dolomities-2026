# Toni-Demetz Bypass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the mapped Mesules ascent and add a selectable day 2 alternative through Toni-Demetz and Val Lasties without a ferrata.

**Architecture:** Extend the existing route generator to produce two day 2 datasets from the official Mesules loop and BRouter approach segments. Reuse the route selector, Leaflet renderer, and synchronized elevation profile pattern already present on `pale-bivacco.html`.

**Tech Stack:** Standalone HTML/CSS/JavaScript, Node.js route-generation scripts, GeoJSON, GPX, Leaflet.

## Global Constraints

- Preserve the primary Comici + Mesules route as the default.
- The bypass must go through Toni-Demetz and ordinary trail 647 over l'Antersass, not equipped trail 647A.
- Route data remains a planning draft requiring field verification.
- Do not modify the archived Seceda page.

---

### Task 1: Route Regression Checks

**Files:**
- Modify: `scripts/verify-langkofel-page.mjs`

**Interfaces:**
- Consumes: generated GeoJSON route and waypoint features.
- Produces: checks for the Mesules west-wall line and Toni-Demetz bypass.

- [ ] **Step 1: Add failing geometry and page checks**

Assert that the primary day 2 line comes within 100 metres of an official Mesules wall coordinate, the bypass files and selector are present, and bypass waypoints include `Toni-Demetz-Hütte` and `l'Antersass`.

- [ ] **Step 2: Run the verification and confirm the expected failure**

Run: `node scripts/verify-langkofel-page.mjs`

Expected: failure because the current primary line follows Val Lasties and the bypass dataset does not exist.

### Task 2: Generate Both Day 2 Routes

**Files:**
- Modify: `scripts/build-langkofel-routes.mjs`
- Modify: `routes/langkofel-day-2.geojson`
- Modify: `routes/langkofel-day-2.gpx`
- Create: `routes/langkofel-day-2-bypass.geojson`
- Create: `routes/langkofel-day-2-bypass.gpx`

**Interfaces:**
- Consumes: BRouter walking lines and the official Val Gardena Mesules loop GPX.
- Produces: primary and bypass GeoJSON/GPX pairs with route statistics and named waypoints.

- [ ] **Step 1: Select the first Passo Sella crossing for Mesules**

Restrict the Passo Sella search to the outbound part of the official loop before its high point, then slice forward to the Sella plateau.

- [ ] **Step 2: Build the bypass from the return branch**

Route from Langkofelhütte through Toni-Demetz to the second Passo Sella crossing, reverse the Val Lasties section, and force l'Antersass before Rifugio Boè.

- [ ] **Step 3: Generate route files and record statistics**

Run: `node scripts/build-langkofel-routes.mjs`

Expected: JSON output containing `dayTwoMesules` and `dayTwoBypass` statistics.

### Task 3: Day 2 Selector and Copy

**Files:**
- Modify: `sassolungo-marmolada-costabella.html`

**Interfaces:**
- Consumes: the two route IDs and their generated statistics.
- Produces: an accessible two-button selector that switches the map, profile, and GPX.

- [ ] **Step 1: Add the route-toggle styles from the Pale page pattern**

Include desktop and mobile styles for `.route-map-actions`, `.route-map-toggle`, and `.route-map-kicker`.

- [ ] **Step 2: Update day 2 markup and route configuration**

Use the general heading `День 2 — Langkofelhütte → Passo Sella → Boè`, add separate parameter labels, buttons `Mesules` and `Toni-Demetz + обхід`, and register `langkofel-day-2-bypass` in `ROUTE_MAPS`.

- [ ] **Step 3: Add concise Ukrainian descriptions**

Describe the corrected ferrata line and the non-ferrata route via Toni-Demetz, Val Lasties, and ordinary trail 647 over l'Antersass.

### Task 4: Verification and Delivery

**Files:**
- Test: `scripts/verify-langkofel-page.mjs`

**Interfaces:**
- Consumes: final HTML and route files.
- Produces: verified local page ready for GitHub Pages.

- [ ] **Step 1: Run route and page verification**

Run: `node scripts/verify-langkofel-page.mjs`

Expected: every check is `true` and route segments remain below 500 metres.

- [ ] **Step 2: Inspect the rendered page at desktop and mobile widths**

Confirm both selectors redraw the line and profile, the GPX link changes, and controls fit without overlap.

- [ ] **Step 3: Commit and push the intended files**

Exclude the unrelated `.DS_Store` from the commit.
