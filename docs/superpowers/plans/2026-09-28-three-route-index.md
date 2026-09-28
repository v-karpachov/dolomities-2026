# Three-route Index Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current comparison home page with a responsive three-route overview while preserving the comparison and linking to all detailed routes.

**Architecture:** Keep the project buildless and standalone. Move the existing page to `comparison.html`, create a focused `index.html` with three route columns and three independent galleries, and add a static verifier plus browser checks for navigation and responsive interaction.

**Tech Stack:** HTML5, CSS, vanilla JavaScript, Playwright browser verification, GitHub Pages.

## Global Constraints

- Visible copy remains Ukrainian.
- Reuse existing route figures and photographs; introduce no new route claims.
- Desktop uses three equal columns; mobile uses one horizontally snapping route at a time.
- Each gallery shows one image, rotates every three seconds, and supports arrows, swipe, and keyboard navigation.
- Preserve standalone GitHub Pages compatibility.
- Preserve `.DS_Store` as an unrelated untracked file.

---

### Task 1: Preserve the comparison and define index checks

**Files:**
- Rename: `index.html` → `comparison.html`
- Create: `scripts/verify-index-page.mjs`

**Interfaces:**
- Consumes: current comparison page and existing detail page filenames.
- Produces: preserved comparison URL and deterministic checks for the new home page.

- [ ] **Step 1: Rename the existing comparison page**

Run `git mv index.html comparison.html`.

- [ ] **Step 2: Add a verifier that requires three route columns, three galleries, detail links, a comparison link, carousel controls, and mobile snap CSS**

- [ ] **Step 3: Run the verifier and confirm it fails because the new `index.html` does not exist**

Run `node scripts/verify-index-page.mjs`.

- [ ] **Step 4: Commit the preserved comparison and failing verifier together with Task 2 after the new index passes**

---

### Task 2: Build the three-route overview

**Files:**
- Create: `index.html`
- Modify: `comparison.html`

**Interfaces:**
- Consumes: `brenta.html`, `pale-bivacco.html`, `seceda-marmolada-costabella.html`, and photographs already referenced by project pages.
- Produces: the GitHub Pages entry page and three direct route journeys.

- [ ] **Step 1: Add compact introduction and aligned route columns**

Include route title, duration, distance, ascent, ferrata count or technical-link count, short description, and detail link for each route.

- [ ] **Step 2: Add one independent gallery per route**

Each gallery uses a stable 3:2 image frame, image caption, previous and next buttons, and an accessible slide position label.

- [ ] **Step 3: Add carousel behavior**

Implement automatic advancement every 3000 ms, pause while focused or hovered, arrow-key control, touch swipe, reduced-motion support, and image error fallback to the next slide.

- [ ] **Step 4: Add responsive behavior**

Keep three columns on wide screens. At narrow widths, use horizontal scroll snapping with one route per viewport and a visible swipe hint.

- [ ] **Step 5: Update the preserved comparison navigation**

Change its primary return links to `index.html` and add a concise label identifying it as the older Brenta/Alta Via 2 comparison.

- [ ] **Step 6: Run static verification**

Run `node scripts/verify-index-page.mjs` and `git diff --check`; both must pass.

- [ ] **Step 7: Commit**

Commit message: `Add three-route home page`.

---

### Task 3: Verify, publish, and check the live page

**Files:**
- Verify: `index.html`, `comparison.html`, and all three detailed route pages.

**Interfaces:**
- Consumes: completed static pages.
- Produces: verified GitHub Pages deployment.

- [ ] **Step 1: Run a local server and Playwright checks at desktop and mobile sizes**

Verify three visible route summaries, three loaded gallery images, working arrow controls, swipe movement, detail links, no console errors, and no horizontal document overflow.

- [ ] **Step 2: Visually inspect desktop and mobile screenshots**

Confirm aligned columns, readable descriptions, stable image frames, and no text overlap.

- [ ] **Step 3: Push `main` and wait for the Pages workflow**

- [ ] **Step 4: Run the same browser checks against the live URL with a cache-busting query**

- [ ] **Step 5: Stop the local server and report the new home and preserved comparison URLs**

---

### Task 4: Add the three-route overview map

**Files:**
- Modify: `index.html`
- Modify: `scripts/verify-index-page.mjs`

**Interfaces:**
- Consumes: the eighteen primary day-level GeoJSON tracks under `routes/`.
- Produces: `initOverviewMap()` and three `data-map-route` filter buttons.

- [ ] **Step 1: Extend the static verifier before changing the page**

Require Leaflet CSS and JavaScript, one `data-overview-map` container, three `data-map-route` buttons, eighteen primary GeoJSON paths, route filtering, start/finish markers, and an inline map status element.

- [ ] **Step 2: Run the verifier and confirm the map requirements fail**

Run `node scripts/verify-index-page.mjs`.

- [ ] **Step 3: Add the map structure and responsive styling before the route grid**

Use a 500 px desktop canvas and a 360 px mobile canvas. Keep the legend buttons above the map and allow them to wrap without horizontal overflow.

- [ ] **Step 4: Implement `initOverviewMap()`**

Load each route's daily files with `Promise.all`, extract the route LineString, add color-coded polylines to one Leaflet feature group per route, add start and finish circle markers, and fit the combined bounds.

- [ ] **Step 5: Implement route selection**

Clicking a route button sets `aria-pressed="true"`, keeps its line fully opaque, dims the other groups, and fits the selected bounds. Clicking the active button clears the selection and restores the combined bounds.

- [ ] **Step 6: Verify static and browser behavior**

Run `node scripts/verify-index-page.mjs`, `git diff --check`, and Playwright at 1440×1000 and 390×844. Assert eighteen route layers, two markers per route, three filter buttons, selection/restore behavior, no page errors, and no horizontal overflow.

- [ ] **Step 7: Commit and publish**

Commit message: `Add overview map to route index`. Push `main`, wait for GitHub Pages, and repeat the Playwright check against the live URL.
