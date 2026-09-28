import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const indexPath = path.join(root, "index.html");
const comparisonPath = path.join(root, "comparison.html");

if (!fs.existsSync(indexPath)) throw new Error("Missing new index.html");
if (!fs.existsSync(comparisonPath)) throw new Error("Missing preserved comparison.html");

const html = fs.readFileSync(indexPath, "utf8");
const comparison = fs.readFileSync(comparisonPath, "utf8");
const count = (pattern) => (html.match(pattern) ?? []).length;
const overviewTracks = [
  ...Array.from({ length: 6 }, (_, index) => `routes/brenta-day-${index + 1}.geojson`),
  "routes/pale-day-1.geojson",
  "routes/pale-day-2.geojson",
  "routes/pale-day-3.geojson",
  "routes/pale-day-4.geojson",
  "routes/pale-day-5-reali.geojson",
  "routes/pale-day-6.geojson",
  "routes/day-1-col-raiser.geojson",
  "routes/day-2.geojson",
  "routes/day-3.geojson",
  "routes/day-4.geojson",
  "routes/day-5.geojson",
  "routes/day-6.geojson"
];

const checks = {
  routeCards: count(/<article class="route-card/g),
  galleries: count(/class="gallery" data-gallery/g),
  previousButtons: count(/<button class="gallery-arrow previous"[^>]+data-gallery-previous/g),
  nextButtons: count(/<button class="gallery-arrow next"[^>]+data-gallery-next/g),
  slideCounts: count(/<span class="gallery-count" data-gallery-count/g),
  detailLinks: [
    "brenta.html",
    "pale-bivacco.html",
    "seceda-marmolada-costabella.html"
  ].every((href) => html.includes(`href="${href}"`)),
  comparisonLink: html.includes('href="comparison.html"'),
  mobileSnap: html.includes("scroll-snap-type: x mandatory") && html.includes("scroll-snap-align: start"),
  autoRotation: html.includes("3000"),
  swipeNavigation: html.includes("pointerdown") && html.includes("pointerup"),
  keyboardNavigation: html.includes('event.key === "ArrowLeft"') && html.includes('event.key === "ArrowRight"'),
  reducedMotion: html.includes("prefers-reduced-motion: reduce"),
  comparisonBackLink: comparison.includes('href="index.html"'),
  overviewMap: html.includes("data-overview-map"),
  mapRouteButtons: count(/<button[^>]+data-map-route=/g),
  leafletCss: html.includes('href="vendor/leaflet.css"'),
  leafletJs: html.includes('src="vendor/leaflet.js"'),
  overviewTracks: overviewTracks.every((track) => html.includes(track)),
  mapFiltering: html.includes("function selectMapRoute"),
  mapMarkers: html.includes("L.circleMarker"),
  mapStatus: html.includes("data-overview-map-status")
};

for (const key of ["routeCards", "galleries", "previousButtons", "nextButtons", "slideCounts"]) {
  if (checks[key] !== 3) throw new Error(`Expected 3 ${key}, found ${checks[key]}`);
}
if (checks.mapRouteButtons !== 3) throw new Error(`Expected 3 mapRouteButtons, found ${checks.mapRouteButtons}`);

for (const key of [
  "detailLinks",
  "comparisonLink",
  "mobileSnap",
  "autoRotation",
  "swipeNavigation",
  "keyboardNavigation",
  "reducedMotion",
  "comparisonBackLink",
  "overviewMap",
  "leafletCss",
  "leafletJs",
  "overviewTracks",
  "mapFiltering",
  "mapMarkers",
  "mapStatus"
]) {
  if (!checks[key]) throw new Error(`Missing index capability: ${key}`);
}

console.log(JSON.stringify(checks, null, 2));
