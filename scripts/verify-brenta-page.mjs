import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const html = fs.readFileSync(path.join(root, "brenta.html"), "utf8");

function count(pattern) {
  return (html.match(pattern) ?? []).length;
}

const checks = {
  maps: count(/<section class="route-map" data-route-map/g),
  canvases: count(/class="route-map-canvas"/g),
  profiles: count(/<div class="elevation-profile" data-elevation-profile>/g),
  gpxLinks: count(/class="route-map-download" href="routes\/brenta-day-[1-6]\.gpx(?:\?[^\"]+)?"/g),
  routeDefinitions: count(/"brenta-day-[1-6]": \{/g),
  leafletCss: html.includes("leaflet@1.9.4/dist/leaflet.css"),
  leafletJs: html.includes("leaflet@1.9.4/dist/leaflet.js"),
  elevationRenderer: html.includes("function drawElevationProfile(container)"),
  synchronizedMarker: html.includes("state.profileMarker.setLatLng"),
  keyboardNavigation: html.includes('event.key !== "ArrowLeft"') && html.includes('event.key !== "ArrowRight"'),
  planningDraftNote: html.includes("планувальні чернетки"),
  startLogistics: html.includes("data-start-logistics"),
  logisticsHeading: html.includes("Як дістатися до старту"),
  logisticsRoute: html.includes("start-logistics-route"),
  recommendedService: html.includes("Рекомендований рейс"),
  departureStrip: html.includes("start-logistics-departure"),
  busLines: count(/<strong>B201<\/strong>/g) === 2 && html.includes("<strong>B231</strong>"),
  timedTransfer: html.includes("Пересадка у Tione · 3 хв"),
  transportLinkTagsRemoved: !html.includes("start-logistics-links"),
  wideLogistics: html.includes('class="start-logistics start-logistics-wide"'),
  compactLogisticsHeading: html.includes('class="start-logistics-title"'),
  mainArrival: html.includes("08:48") && html.includes("10:56"),
  earlyArrival: html.includes("07:48") && html.includes("09:56"),
  logisticsBeforeDaysHeading: html.indexOf("data-start-logistics") >= 0
    && html.indexOf("data-start-logistics") < html.indexOf('id="days-title"'),
  logisticsBeforeDayOne: html.indexOf("data-start-logistics") >= 0
    && html.indexOf("data-start-logistics") < html.indexOf("День 1 — Madonna di Campiglio")
};

for (const key of ["maps", "canvases", "profiles", "gpxLinks", "routeDefinitions"]) {
  if (checks[key] !== 6) throw new Error(`Expected 6 ${key}, found ${checks[key]}`);
}
for (const key of [
  "leafletCss",
  "leafletJs",
  "elevationRenderer",
  "synchronizedMarker",
  "keyboardNavigation",
  "planningDraftNote",
  "startLogistics",
  "logisticsHeading",
  "logisticsRoute",
  "recommendedService",
  "departureStrip",
  "busLines",
  "timedTransfer",
  "transportLinkTagsRemoved",
  "wideLogistics",
  "compactLogisticsHeading",
  "mainArrival",
  "earlyArrival",
  "logisticsBeforeDaysHeading",
  "logisticsBeforeDayOne"
]) {
  if (!checks[key]) throw new Error(`Missing Brenta page capability: ${key}`);
}

console.log(JSON.stringify(checks, null, 2));
