import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const pagePath = path.join(root, "rosengarten-sassolungo-marmolada.html");
const legacyPagePath = path.join(root, "sassolungo-marmolada-costabella.html");
const archivedPagePath = path.join(root, "seceda-marmolada-costabella.html");

if (!fs.existsSync(pagePath)) throw new Error("Missing canonical Rosengarten route page");
if (!fs.existsSync(legacyPagePath)) throw new Error("Missing legacy Rosengarten redirect page");

const html = fs.readFileSync(pagePath, "utf8");
const legacyHtml = fs.readFileSync(legacyPagePath, "utf8");
const archivedHtml = fs.readFileSync(archivedPagePath, "utf8");

const routeIds = [
  "rosengarten-day-1",
  "rosengarten-day-2-laurenzi",
  "rosengarten-day-2-molignon",
  "rosengarten-day-3",
  "rosengarten-day-3-bypass",
  "rosengarten-day-4",
  "rosengarten-day-5",
  "rosengarten-day-6"
];
const routeFiles = routeIds.flatMap((id) => [`routes/${id}.geojson`, `routes/${id}.gpx`]);

const routeCollection = (id) => JSON.parse(fs.readFileSync(path.join(root, `routes/${id}.geojson`), "utf8"));
const routeCoordinates = (id) => routeCollection(id).features
  .find((feature) => feature.properties.kind === "route").geometry.coordinates;
const waypointNames = (id) => new Set(routeCollection(id).features
  .filter((feature) => feature.properties.kind === "waypoint")
  .map((feature) => feature.properties.name));

const distanceMeters = ([longitudeA, latitudeA], [longitudeB, latitudeB]) => {
  const radians = Math.PI / 180;
  const latitudeDelta = (latitudeB - latitudeA) * radians;
  const longitudeDelta = (longitudeB - longitudeA) * radians;
  const value = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(latitudeA * radians) * Math.cos(latitudeB * radians) * Math.sin(longitudeDelta / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(value));
};

const primaryDayIds = [
  "rosengarten-day-1",
  "rosengarten-day-2-laurenzi",
  "rosengarten-day-3",
  "rosengarten-day-4",
  "rosengarten-day-5",
  "rosengarten-day-6"
];
const dayCoordinates = primaryDayIds.map(routeCoordinates);
const continuity = dayCoordinates.every((coordinates, index) =>
  index === 0 || distanceMeters(dayCoordinates[index - 1].at(-1), coordinates[0]) < 60
);
const maximumSegment = Math.max(...dayCoordinates.flatMap((coordinates) =>
  coordinates.slice(1).map((coordinate, index) => distanceMeters(coordinates[index], coordinate))
));

const dayOneWaypoints = waypointNames("rosengarten-day-1");
const laurenziWaypoints = waypointNames("rosengarten-day-2-laurenzi");
const molignonWaypoints = fs.existsSync(path.join(root, "routes/rosengarten-day-2-molignon.geojson"))
  ? waypointNames("rosengarten-day-2-molignon")
  : new Set();
const dayThreeBypassWaypoints = fs.existsSync(path.join(root, "routes/rosengarten-day-3-bypass.geojson"))
  ? waypointNames("rosengarten-day-3-bypass")
  : new Set();
const laurenziCoordinates = routeCoordinates("rosengarten-day-2-laurenzi");
const molignonCoordinates = routeCoordinates("rosengarten-day-2-molignon");
const dayFiveCoordinates = routeCoordinates("rosengarten-day-5");
const dayFiveWaypoints = waypointNames("rosengarten-day-5");
const daySixCollection = routeCollection("rosengarten-day-6");
const daySixCoordinates = routeCoordinates("rosengarten-day-6");
const daySixWaypoints = waypointNames("rosengarten-day-6");
const lagoAntermoia = [11.6602803, 46.4778661];
const alpeTires = [11.632844, 46.4972051];
const fedaiaNorthShore = [11.876, 46.464];
const fedaiaSouthShore = [11.879953, 46.456811];
const passoFedaia = [11.86259, 46.464024];
const capannaAlGhiacciaio = [11.8613317, 46.4446096];
const valRosalia = [11.8352, 46.432];
const minimumLagoDistance = Math.min(...laurenziCoordinates.map((coordinate) =>
  distanceMeters(coordinate, lagoAntermoia)
));
const minimumAlpeTiresDistance = Math.min(...molignonCoordinates.map((coordinate) =>
  distanceMeters(coordinate, alpeTires)
));
const minimumNorthShoreDistance = Math.min(...dayFiveCoordinates.map((coordinate) =>
  distanceMeters(coordinate, fedaiaNorthShore)
));
const minimumSouthShoreDistance = Math.min(...dayFiveCoordinates.map((coordinate) =>
  distanceMeters(coordinate, fedaiaSouthShore)
));
const minimumPassoFedaiaDistance = Math.min(...dayFiveCoordinates.map((coordinate) =>
  distanceMeters(coordinate, passoFedaia)
));
const minimumCapannaDistance = Math.min(...dayFiveCoordinates.map((coordinate) =>
  distanceMeters(coordinate, capannaAlGhiacciaio)
));
const minimumValRosaliaDistance = Math.min(...daySixCoordinates.map((coordinate) =>
  distanceMeters(coordinate, valRosalia)
));
const daySixDistance = daySixCollection.features
  .find((feature) => feature.properties.kind === "route").properties.distance_km;

const checks = {
  title: html.includes("Rosengarten → Sassolungo → Marmolada"),
  canonicalUrl: html.includes('<link rel="canonical" href="https://v-karpachov.github.io/dolomities-2026/rosengarten-sassolungo-marmolada.html">'),
  legacyRedirect: legacyHtml.includes('http-equiv="refresh" content="0; url=rosengarten-sassolungo-marmolada.html"')
    && legacyHtml.includes('location.replace("rosengarten-sassolungo-marmolada.html" + window.location.search + window.location.hash)')
    && legacyHtml.includes('href="rosengarten-sassolungo-marmolada.html"'),
  rosengartenHero: html.includes("https://img3.oastatic.com/img2/76425499/2500x950r/variant.jpg")
    && html.includes("center center / cover no-repeat")
    && html.includes("background-position: 64% center;")
    && !html.includes("https://upload.wikimedia.org/wikipedia/commons/3/30/Vajolett%C3%BCrme_und_Gartlh%C3%BCtte_SW.JPG")
    && !html.includes("https://static.wixstatic.com/media/09b168_d39418f30c7b4e26a840402478dcf053~mv2.jpg"),
  sixDays: (html.match(/class="day-card"/g) ?? []).length === 6,
  logistics: html.includes("Trento → Nova Levante → Rifugio Fronza")
    && html.includes("07:32 → 09:43")
    && html.includes("Nova Levante + König Laurin · €26"),
  dayOne: dayOneWaypoints.has("Passo Santner")
    && dayOneWaypoints.has("Rifugio Re Alberto")
    && dayOneWaypoints.has("Rifugio Vajolet"),
  dayTwoVariants: html.includes('data-route="rosengarten-day-2-laurenzi"')
    && html.includes('data-route="rosengarten-day-2-molignon"')
    && laurenziWaypoints.has("Ferrata Laurenzi")
    && molignonWaypoints.has("Passo Molignon"),
  molignonBypassesAlpeTires: !molignonWaypoints.has("Rifugio Alpe di Tires")
    && minimumAlpeTiresDistance > 100
    && !html.includes("Rifugio Alpe di Tires"),
  primaryDayTwoStopsRemoved: !laurenziWaypoints.has("Passo Molignon")
    && !laurenziWaypoints.has("Rifugio Alpe di Tires")
    && !laurenziWaypoints.has("Lago d'Antermoia"),
  dayThreeVariants: html.includes('data-route="rosengarten-day-3"')
    && html.includes('data-route="rosengarten-day-3-bypass"')
    && dayThreeBypassWaypoints.has("Toni-Demetz-Hütte")
    && dayThreeBypassWaypoints.has("l'Antersass"),
  lagoAntermoiaAvoided: !laurenziWaypoints.has("Lago d'Antermoia")
    && minimumLagoDistance > 300
    && html.includes("без заходу до Lago d'Antermoia"),
  dayFiveSouthShore: minimumSouthShoreDistance < 100
    && minimumNorthShoreDistance > 300
    && html.includes("південним боком"),
  dayFiveSkipsPassoFedaia: !dayFiveWaypoints.has("Passo Fedaia")
    && minimumPassoFedaiaDistance > 250
    && !html.includes("Passo Fedaia"),
  dayFiveSkipsCapanna: !dayFiveWaypoints.has("Pian dei Fiacconi")
    && minimumCapannaDistance > 300
    && !html.includes("Pian dei Fiacconi"),
  daySixUsesShortestValRosaliaExit: daySixWaypoints.has("Val Rosalia")
    && minimumValRosaliaDistance < 100
    && daySixDistance < 10
    && html.includes("Dal Bianco → Val Rosalia → Alba di Canazei"),
  laurenziCondition: html.includes("Laurenzi лише за сухих умов")
    && html.includes("нестраховані відрізки"),
  routeReferences: routeFiles.every((file) => html.includes(file)),
  routeFiles: routeFiles.every((file) => fs.existsSync(path.join(root, file))),
  continuity,
  maximumSegmentBelow500m: maximumSegment < 500,
  oldEndingRemoved: !html.includes("Bepi Zac") && !html.includes("Passo San Pellegrino"),
  archivedPagePreserved: archivedHtml.includes("Seceda → Marmolada → Costabella")
};

for (const [key, value] of Object.entries(checks)) {
  if (!value) throw new Error(`Missing Rosengarten page capability: ${key}`);
}

console.log(JSON.stringify({
  ...checks,
  maximumSegment: Math.round(maximumSegment),
  minimumLagoDistance: Math.round(minimumLagoDistance),
  minimumAlpeTiresDistance: Math.round(minimumAlpeTiresDistance),
  minimumNorthShoreDistance: Math.round(minimumNorthShoreDistance),
  minimumSouthShoreDistance: Math.round(minimumSouthShoreDistance),
  minimumPassoFedaiaDistance: Math.round(minimumPassoFedaiaDistance),
  minimumCapannaDistance: Math.round(minimumCapannaDistance),
  minimumValRosaliaDistance: Math.round(minimumValRosaliaDistance),
  daySixDistance
}, null, 2));
