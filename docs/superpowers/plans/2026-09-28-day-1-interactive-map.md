# Day 1 Interactive Route Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an interactive Day 1 map with two selectable hiking tracks and downloadable GPX files to the Seceda to Marmolada to Costabella route page.

**Architecture:** Keep route geometry in local GeoJSON and GPX files under `routes/`. The standalone route page loads Leaflet and OpenTopoMap tiles in the browser, fetches the selected GeoJSON, and updates the line, named markers, fitted bounds, and GPX download link without reloading the page.

**Tech Stack:** Static HTML/CSS/JavaScript, Leaflet 1.9.4, GeoJSON, GPX 1.1, OpenStreetMap route data, OpenTopoMap tiles, GitHub Pages.

## Global Constraints

- Keep all visible copy in Ukrainian.
- Preserve the existing warm paper, forest, rust, and gold visual system.
- Follow mapped hiking paths; do not draw straight point-to-point segments.
- Keep the page usable when map scripts, tiles, or route data fail.
- Do not change the displayed Day 1 distance and elevation estimates without a separate review.
- Support touch interaction and a stable mobile layout.

---

### Task 1: Create and Validate Day 1 Track Assets

**Files:**
- Create: `routes/day-1-col-raiser.geojson`
- Create: `routes/day-1-col-raiser.gpx`
- Create: `routes/day-1-seceda.geojson`
- Create: `routes/day-1-seceda.gpx`

**Interfaces:**
- Consumes: the route sequences `Col Raiser → Seceda → Forces de Siëles → Rifugio Puez` and `Seceda → Forces de Siëles → Rifugio Puez`.
- Produces: GeoJSON `FeatureCollection` files containing one `LineString` route and named `Point` features; matching GPX 1.1 files containing one track and named waypoints.

- [ ] **Step 1: Resolve and inspect the route geometry**

Use OpenStreetMap place data and hiking routing to resolve the four named locations and construct both alternatives. Inspect the line against the mapped trails and ensure the shorter alternative is the suffix of the primary route from Seceda onward.

- [ ] **Step 2: Save the browser map assets**

Save each browser asset with this shape:

```json
{
  "type": "FeatureCollection",
  "features": [
    {"type":"Feature","properties":{"kind":"route","name":"Варіант A · Col Raiser"},"geometry":{"type":"LineString","coordinates":[]}},
    {"type":"Feature","properties":{"kind":"waypoint","name":"Col Raiser"},"geometry":{"type":"Point","coordinates":[]}}
  ]
}
```

Include the complete routed coordinate arrays in the saved files. Option B omits the Col Raiser waypoint.

- [ ] **Step 3: Save matching GPX downloads**

Use GPX 1.1 with UTF-8 names, one `<trk>` per file, one `<trkseg>`, and `<trkpt lat="…" lon="…">` entries matching the corresponding GeoJSON line. Add named `<wpt>` elements for the same visible map markers.

- [ ] **Step 4: Validate both formats**

Run:

```bash
jq -e '.type == "FeatureCollection" and ([.features[] | select(.geometry.type == "LineString") | .geometry.coordinates | length] | min > 2)' routes/day-1-*.geojson
xmllint --noout routes/day-1-*.gpx
```

Expected: every command exits with status 0, both route lines contain more than two coordinates, and both GPX files are well-formed XML.

### Task 2: Add the Interactive Map to the Route Page

**Files:**
- Modify: `seceda-marmolada-costabella.html`

**Interfaces:**
- Consumes: `routes/day-1-col-raiser.geojson`, `routes/day-1-seceda.geojson`, and their matching GPX files.
- Produces: `initDayOneMap(): void` and `selectDayOneRoute(routeId: "col-raiser" | "seceda"): Promise<void>` in the page script.

- [ ] **Step 1: Load pinned Leaflet assets**

Add Leaflet 1.9.4 CSS in `<head>` and its script before the page's own map script. Include integrity and `crossorigin` attributes from the Leaflet distribution.

- [ ] **Step 2: Add stable responsive map styling**

Add styles for `.route-map`, `.route-map-toolbar`, `.route-map-toggle`, `.route-map-download`, `.route-map-canvas`, `.route-map-status`, and selected/focus states. Keep the canvas height at `460px` on desktop and `360px` below `640px`, with an `8px` maximum corner radius.

- [ ] **Step 3: Add Day 1 map markup**

Insert after the Day 1 introduction:

```html
<section class="route-map" aria-labelledby="day-1-map-title">
  <div class="route-map-toolbar">
    <div>
      <p class="route-map-kicker">Мапа дня 1</p>
      <h3 id="day-1-map-title">Варіанти старту</h3>
    </div>
    <div class="route-map-actions">
      <div class="route-map-toggle" role="group" aria-label="Варіант маршруту дня 1">
        <button type="button" data-route="col-raiser" aria-pressed="true">Через Col Raiser</button>
        <button type="button" data-route="seceda" aria-pressed="false">Через Seceda</button>
      </div>
      <a class="route-map-download" href="routes/day-1-col-raiser.gpx" download>Завантажити GPX</a>
    </div>
  </div>
  <div id="day-1-map" class="route-map-canvas" aria-label="Інтерактивна мапа маршруту дня 1"></div>
  <p class="route-map-status" aria-live="polite">Завантажуємо маршрут…</p>
</section>
```

- [ ] **Step 4: Implement route switching and failure handling**

Create a `DAY_ONE_ROUTES` configuration for the two local files and colors. Initialize Leaflet with OpenTopoMap tiles and full attribution. On selection, update `aria-pressed`, fetch and draw the selected GeoJSON, bind permanent or click labels to waypoint markers, fit bounds with padding, update the GPX link, and clear the loading status. On failure, keep the GPX link visible and show `Не вдалося завантажити мапу. GPX-файл доступний за посиланням вище.`

- [ ] **Step 5: Check static page contracts**

Run:

```bash
rg -n 'leaflet@1.9.4|day-1-map|day-1-col-raiser.geojson|day-1-seceda.geojson|Завантажити GPX' seceda-marmolada-costabella.html
git diff --check
```

Expected: all map assets and both route configurations are present, and the diff has no whitespace errors.

### Task 3: Verify and Publish the Trial Map

**Files:**
- Verify: `seceda-marmolada-costabella.html`
- Verify: `routes/day-1-*`

**Interfaces:**
- Consumes: the completed static page and route assets.
- Produces: a published GitHub Pages map whose two options can be viewed and downloaded.

- [ ] **Step 1: Serve the site locally**

Run a local static server from the repository root and open `seceda-marmolada-costabella.html` through HTTP so GeoJSON `fetch` requests are allowed.

- [ ] **Step 2: Verify desktop and mobile behavior**

At approximately `1440×1000` and `390×844`, verify that the map renders nonblank, the selected route changes, named markers are visible, controls do not overlap, the map canvas keeps its height, and both GPX links download the correct files.

- [ ] **Step 3: Commit and publish only intended files**

Run:

```bash
git add seceda-marmolada-costabella.html routes/day-1-col-raiser.geojson routes/day-1-col-raiser.gpx routes/day-1-seceda.geojson routes/day-1-seceda.gpx docs/superpowers/plans/2026-09-28-day-1-interactive-map.md
git commit -m "Add interactive map for route day one"
git push origin main
```

- [ ] **Step 4: Verify GitHub Pages**

Wait for `pages-build-deployment` to finish successfully. Confirm the published HTML and all four route asset URLs return HTTP 200, and verify that the live page contains the Day 1 map controls.
