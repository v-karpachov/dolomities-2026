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
  comparisonBackLink: comparison.includes('href="index.html"')
};

for (const key of ["routeCards", "galleries", "previousButtons", "nextButtons", "slideCounts"]) {
  if (checks[key] !== 3) throw new Error(`Expected 3 ${key}, found ${checks[key]}`);
}

for (const key of [
  "detailLinks",
  "comparisonLink",
  "mobileSnap",
  "autoRotation",
  "swipeNavigation",
  "keyboardNavigation",
  "reducedMotion",
  "comparisonBackLink"
]) {
  if (!checks[key]) throw new Error(`Missing index capability: ${key}`);
}

console.log(JSON.stringify(checks, null, 2));
