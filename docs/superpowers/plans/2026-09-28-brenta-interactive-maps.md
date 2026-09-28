# Brenta Interactive Maps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add six detailed Brenta day maps with downloadable GPX files, elevation profiles, and synchronized map/profile markers to `brenta.html`.

**Architecture:** Each day is represented by a matching `routes/brenta-day-N.geojson` and `routes/brenta-day-N.gpx`. The page reuses the self-contained Leaflet and SVG profile implementation already proven on the Pale and Seceda pages, with a route configuration object mapping day IDs to files, colors, and profile labels.

**Tech Stack:** Standalone HTML/CSS/JavaScript, Leaflet 1.9.4, GeoJSON, GPX 1.1, Node.js verification scripts, GitHub Pages.

## Global Constraints

- Follow the current six-day Brenta itinerary and preserve both light-pack ferrata loops in full.
- Use OSM/BRouter hiking lines where available and manually join ferrata sections the router cannot traverse correctly.
- Treat route files as planning drafts, not authoritative navigation data.
- Keep the existing Brenta page typography, colors, spacing, and responsive layout.
- Every route coordinate must contain elevation.
- GeoJSON and GPX point counts must match for every day.

---

### Task 1: Build and validate Brenta route datasets

**Files:**
- Create: `routes/brenta-day-1.geojson`
- Create: `routes/brenta-day-1.gpx`
- Create: `routes/brenta-day-2.geojson`
- Create: `routes/brenta-day-2.gpx`
- Create: `routes/brenta-day-3.geojson`
- Create: `routes/brenta-day-3.gpx`
- Create: `routes/brenta-day-4.geojson`
- Create: `routes/brenta-day-4.gpx`
- Create: `routes/brenta-day-5.geojson`
- Create: `routes/brenta-day-5.gpx`
- Create: `routes/brenta-day-6.geojson`
- Create: `routes/brenta-day-6.gpx`
- Create: `scripts/verify-brenta-routes.mjs`

**Interfaces:**
- Produces: GeoJSON `FeatureCollection` files containing one `LineString` with `properties.kind === "route"` and named waypoint `Point` features.
- Produces: GPX files whose `<trkpt>` sequence exactly matches the corresponding GeoJSON route coordinates.

- [ ] **Step 1: Write the failing route verifier**

Create `scripts/verify-brenta-routes.mjs` with assertions for six route pairs, finite 3D coordinates, matching GPX point counts, required start/end waypoints, and suspicious exact retracing over more than 100 metres.

- [ ] **Step 2: Run the verifier and confirm RED**

Run: `node scripts/verify-brenta-routes.mjs`

Expected: failure because `routes/brenta-day-1.geojson` does not exist.

- [ ] **Step 3: Generate the six route pairs**

Build these exact daily lines:

1. Fontanella -> Vallesinella -> Tuckett.
2. Tuckett -> Sentiero Orsi -> Pedrotti -> Busa degli Sfulmini -> Spellini -> Bocca degli Armi -> Bocchette Centrali -> Pedrotti.
3. Pedrotti -> Palmieri -> Agostini -> Castiglioni -> XII Apostoli.
4. XII Apostoli -> Ideale -> Brentari -> Pedrotti -> Bocca di Brenta -> Detassis.
5. Detassis -> Oliva Detassis -> Bocchette Alte -> Bocca di Tuckett -> SOSAT -> Detassis.
6. Detassis -> Val Brenta -> Fontanella.

Write the same route coordinates and named waypoints to each GeoJSON/GPX pair. Store route metadata as `distance_km`, `ascent_m`, and `source: "BRouter / OpenStreetMap"`.

- [ ] **Step 4: Run the verifier and confirm GREEN**

Run: `node scripts/verify-brenta-routes.mjs`

Expected: JSON summary with `days: 6`, matching route/GPX point counts, and no accidental repeated fragments.

- [ ] **Step 5: Commit route data**

```bash
git add routes/brenta-day-* scripts/verify-brenta-routes.mjs
git commit -m "Add Brenta day route data"
```

### Task 2: Integrate maps and elevation profiles

**Files:**
- Modify: `brenta.html`
- Test: `scripts/verify-brenta-page.mjs`

**Interfaces:**
- Consumes: `routes/brenta-day-N.geojson` and `routes/brenta-day-N.gpx` from Task 1.
- Produces: six `[data-route-map]` regions and six `[data-elevation-profile]` regions initialized by `routeDefinitions`.

- [ ] **Step 1: Write the failing page verifier**

Create `scripts/verify-brenta-page.mjs` to assert six map canvases, six profile containers, six GPX links, seven expected ferrata/profile labels, Leaflet assets, and the shared profile synchronization functions.

- [ ] **Step 2: Run the verifier and confirm RED**

Run: `node scripts/verify-brenta-page.mjs`

Expected: failure reporting zero map/profile regions.

- [ ] **Step 3: Add shared map/profile styles and markup**

Copy the established route-map and elevation-profile styles from `seceda-marmolada-costabella.html`, adapting only spacing needed by the existing Brenta day cards. Insert one map section under every day's stats and before its description.

- [ ] **Step 4: Add route configuration and renderer**

Add `routeDefinitions` entries for `brenta-day-1` through `brenta-day-6`, including profile labels for Vallesinella, Tuckett, Bocca di Tuckett, Pedrotti, Spellini, Bocchette Centrali, Agostini, Castiglioni, XII Apostoli, Ideale, Brentari, Bocca di Brenta, Detassis, Bocchette Alte, and SOSAT. Reuse the Leaflet renderer, SVG elevation renderer, `ResizeObserver`, pointer/touch/keyboard interaction, and synchronized map marker behavior.

- [ ] **Step 5: Add planning-draft context**

Add one concise route note near the day section stating that map lines and GPX files are planning drafts and must be checked against current ferrata conditions and closures.

- [ ] **Step 6: Run the page verifier and confirm GREEN**

Run: `node scripts/verify-brenta-page.mjs`

Expected: JSON summary with `maps: 6`, `profiles: 6`, and `gpxLinks: 6`.

- [ ] **Step 7: Commit page integration**

```bash
git add brenta.html scripts/verify-brenta-page.mjs
git commit -m "Add interactive maps to Brenta route"
```

### Task 3: Browser verification and publication

**Files:**
- Verify: `brenta.html`
- Verify: `routes/brenta-day-*.geojson`
- Verify: `routes/brenta-day-*.gpx`

**Interfaces:**
- Consumes: the complete static page and route files.
- Produces: deployed GitHub Pages output at `/brenta.html`.

- [ ] **Step 1: Start a local static server**

Run from the repository root: `python3 -m http.server 8765`

- [ ] **Step 2: Verify desktop and mobile behavior**

Check 1440x1000 and 390x844 viewports. Assert six rendered Leaflet maps, six profile SVGs, synchronized markers on pointer movement, keyboard movement with ArrowLeft/ArrowRight, working GPX links, no page errors, and zero horizontal overflow.

- [ ] **Step 3: Run final static verification**

```bash
node scripts/verify-brenta-routes.mjs
node scripts/verify-brenta-page.mjs
xmllint --noout routes/brenta-day-*.gpx
git diff --check
```

Expected: all commands exit successfully.

- [ ] **Step 4: Push and wait for GitHub Pages**

```bash
git push origin main
gh run list --limit 3 --json databaseId,name,status,conclusion,headSha,url
RUN_ID=$(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')
gh run watch "$RUN_ID" --exit-status
```

- [ ] **Step 5: Verify deployed assets**

Fetch the deployed page and all 12 route files. Re-run the static assertions against the downloaded assets and confirm the published commit matches the local route counts.
