import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const html = fs.readFileSync(path.join(root, "pale-bivacco.html"), "utf8");

function count(pattern) {
  return (html.match(pattern) ?? []).length;
}

const checks = {
  maps: count(/<section class="route-map" data-route-map/g),
  canvases: count(/class="route-map-canvas"/g),
  profiles: count(/<div class="elevation-profile" data-elevation-profile>/g),
  gpxLinks: count(/class="route-map-download"/g),
  startLogistics: html.includes("data-start-logistics"),
  logisticsHeading: html.includes("Як дістатися до старту"),
  busLines: html.includes("<strong>B104</strong>") && html.includes("<strong>B122</strong>"),
  predazzoWait: html.includes("Очікування у Predazzo · 1 год 42 хв"),
  criticalConnection: html.includes("Наступний B122 лише о 16:29"),
  arrival: html.includes("07:40 → 12:09"),
  departureStrip: html.includes("start-logistics-departure"),
  noTransportLinkTags: !html.includes("start-logistics-links"),
  logisticsBeforeDaysHeading: html.indexOf("data-start-logistics") >= 0
    && html.indexOf("data-start-logistics") < html.indexOf('id="days-title"'),
  logisticsBeforeDayOne: html.indexOf("data-start-logistics") >= 0
    && html.indexOf("data-start-logistics") < html.indexOf("День 1 — San Martino")
};

for (const key of ["maps", "canvases", "profiles", "gpxLinks"]) {
  if (checks[key] !== 6) throw new Error(`Expected 6 ${key}, found ${checks[key]}`);
}

for (const key of [
  "startLogistics",
  "logisticsHeading",
  "busLines",
  "predazzoWait",
  "criticalConnection",
  "arrival",
  "departureStrip",
  "noTransportLinkTags",
  "logisticsBeforeDaysHeading",
  "logisticsBeforeDayOne"
]) {
  if (!checks[key]) throw new Error(`Missing Pale page capability: ${key}`);
}

console.log(JSON.stringify(checks, null, 2));
