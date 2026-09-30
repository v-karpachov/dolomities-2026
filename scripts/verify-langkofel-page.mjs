import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const pagePath = path.join(root, "sassolungo-marmolada-costabella.html");
const archivedPagePath = path.join(root, "seceda-marmolada-costabella.html");
const html = fs.readFileSync(pagePath, "utf8");
const archivedHtml = fs.readFileSync(archivedPagePath, "utf8");

const routeFiles = [
  "routes/langkofel-day-1.geojson",
  "routes/langkofel-day-1.gpx",
  "routes/langkofel-day-2.geojson",
  "routes/langkofel-day-2.gpx",
  ...Array.from({ length: 4 }, (_, index) => `routes/day-${index + 3}.geojson`),
  ...Array.from({ length: 4 }, (_, index) => `routes/day-${index + 3}.gpx`)
];

const routeCoordinates = (filename) => {
  const collection = JSON.parse(fs.readFileSync(path.join(root, filename), "utf8"));
  return collection.features.find((feature) => feature.properties.kind === "route").geometry.coordinates;
};

const distanceMeters = ([longitudeA, latitudeA], [longitudeB, latitudeB]) => {
  const radians = Math.PI / 180;
  const latitudeDelta = (latitudeB - latitudeA) * radians;
  const longitudeDelta = (longitudeB - longitudeA) * radians;
  const value = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(latitudeA * radians) * Math.cos(latitudeB * radians) * Math.sin(longitudeDelta / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(value));
};

const dayFiles = [
  "routes/langkofel-day-1.geojson",
  "routes/langkofel-day-2.geojson",
  "routes/day-3.geojson",
  "routes/day-4.geojson",
  "routes/day-5.geojson",
  "routes/day-6.geojson"
];
const dayCoordinates = dayFiles.map(routeCoordinates);
const continuity = dayCoordinates.every((coordinates, index) =>
  index === 0 || distanceMeters(dayCoordinates[index - 1].at(-1), coordinates[0]) < 50
);
const maximumSegment = Math.max(...dayCoordinates.flatMap((coordinates) =>
  coordinates.slice(1).map((coordinate, index) => distanceMeters(coordinates[index], coordinate))
));

const checks = {
  title: html.includes("Sassolungo → Marmolada → Costabella"),
  sixDays: (html.match(/class="day-card"/g) ?? []).length === 6,
  logistics: html.includes("Trento → Santa Cristina") && html.includes("07:05 → 09:36"),
  dayOne: html.includes("Santa Cristina → Monte Pana → Langkofelhütte"),
  dayTwo: html.includes("Langkofelhütte → Comici → Passo Sella → Mesules → Boè"),
  weatherCondition: html.includes("тільки по сухій скелі"),
  routeReferences: routeFiles.every((file) => html.includes(file)),
  routeFiles: routeFiles.every((file) => fs.existsSync(path.join(root, file))),
  continuity,
  maximumSegmentBelow500m: maximumSegment < 500,
  archivedPagePreserved: archivedHtml.includes("Seceda → Marmolada → Costabella")
};

for (const [key, value] of Object.entries(checks)) {
  if (!value) throw new Error(`Missing Langkofel page capability: ${key}`);
}

console.log(JSON.stringify({ ...checks, maximumSegment: Math.round(maximumSegment) }, null, 2));
