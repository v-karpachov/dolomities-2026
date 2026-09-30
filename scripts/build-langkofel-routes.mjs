import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const routesDirectory = path.join(root, "routes");
const brouterEndpoint = "https://brouter.de/brouter";
const mesulesGpxUrl = "https://www.outdooractive.com/en/download.tour.gpx?i=16420375&project=api-val-gardena-groeden";

const points = {
  santaCristina: [11.7210192, 46.5581421],
  montePana: [11.7180154, 46.5506489],
  langkofel: [11.7236498, 46.5199011],
  comici: [11.7480649, 46.528653],
  passoSella: [11.7673265, 46.5080689],
  boe: [11.8232815, 46.5146145],
  mesulesExit: [11.82062, 46.5232]
};

function brouterUrl(waypoints) {
  const url = new URL(brouterEndpoint);
  url.searchParams.set("lonlats", waypoints.map(([longitude, latitude]) => `${longitude},${latitude}`).join("|"));
  url.searchParams.set("profile", "hiking-beta");
  url.searchParams.set("alternativeidx", "0");
  url.searchParams.set("format", "geojson");
  return url;
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { "user-agent": "Dolomites-2026-route-builder" } });
  if (!response.ok) throw new Error(`Request failed (${response.status}): ${url}`);
  return response.text();
}

async function fetchRoute(waypoints) {
  const data = JSON.parse(await fetchText(brouterUrl(waypoints)));
  const line = data.features.find((feature) => feature.geometry?.type === "LineString");
  if (!line) throw new Error("BRouter response did not contain a LineString");
  return line.geometry.coordinates.map(normalizeCoordinate);
}

function parseGpxTrack(gpx) {
  return [...gpx.matchAll(/<trkpt lat="([^"]+)" lon="([^"]+)">\s*<ele>([^<]+)<\/ele>/g)]
    .map((match) => normalizeCoordinate([Number(match[2]), Number(match[1]), Number(match[3])]));
}

function normalizeCoordinate([longitude, latitude, elevation = 0]) {
  return [round(longitude, 6), round(latitude, 6), round(elevation, 1)];
}

function round(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function distanceMeters([longitudeA, latitudeA], [longitudeB, latitudeB]) {
  const toRadians = (degrees) => degrees * Math.PI / 180;
  const latitudeDelta = toRadians(latitudeB - latitudeA);
  const longitudeDelta = toRadians(longitudeB - longitudeA);
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(toRadians(latitudeA)) * Math.cos(toRadians(latitudeB)) * Math.sin(longitudeDelta / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearestIndex(coordinates, target) {
  return coordinates.reduce((best, coordinate, index) => {
    const distance = distanceMeters(coordinate, target);
    return distance < best.distance ? { index, distance } : best;
  }, { index: 0, distance: Number.POSITIVE_INFINITY }).index;
}

function mergeCoordinates(...segments) {
  const merged = [];
  for (const segment of segments) {
    for (const coordinate of segment) {
      const previous = merged.at(-1);
      if (!previous || distanceMeters(previous, coordinate) > 2) merged.push(coordinate);
    }
  }
  return merged;
}

function routeStats(coordinates) {
  let distance = 0;
  let ascent = 0;
  let descent = 0;
  for (let index = 1; index < coordinates.length; index += 1) {
    distance += distanceMeters(coordinates[index - 1], coordinates[index]);
    const elevationDelta = coordinates[index][2] - coordinates[index - 1][2];
    if (elevationDelta > 0) ascent += elevationDelta;
    else descent -= elevationDelta;
  }
  return {
    distance_km: round(distance / 1000, 2),
    ascent_m: Math.round(ascent),
    descent_m: Math.round(descent)
  };
}

function waypoint(name, target, coordinates, showLabel = true) {
  const coordinate = coordinates[nearestIndex(coordinates, target)];
  return {
    type: "Feature",
    properties: { kind: "waypoint", name, show_label: showLabel },
    geometry: { type: "Point", coordinates: coordinate }
  };
}

function writeGeoJson(filename, name, source, coordinates, waypoints) {
  const stats = routeStats(coordinates);
  const featureCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { kind: "route", name, ...stats, source },
        geometry: { type: "LineString", coordinates }
      },
      ...waypoints
    ]
  };
  fs.writeFileSync(path.join(routesDirectory, filename), `${JSON.stringify(featureCollection, null, 2)}\n`);
  return stats;
}

function escapeXml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function writeGpx(filename, name, coordinates, waypoints) {
  const waypointXml = waypoints.map((feature) => {
    const [longitude, latitude, elevation] = feature.geometry.coordinates;
    return `  <wpt lat="${latitude}" lon="${longitude}"><ele>${elevation}</ele><name>${escapeXml(feature.properties.name)}</name></wpt>`;
  }).join("\n");
  const trackXml = coordinates.map(([longitude, latitude, elevation]) =>
    `      <trkpt lat="${latitude}" lon="${longitude}"><ele>${elevation}</ele></trkpt>`
  ).join("\n");
  const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Dolomites 2026" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata><name>${escapeXml(name)}</name></metadata>
${waypointXml}
  <trk>
    <name>${escapeXml(name)}</name>
    <trkseg>
${trackXml}
    </trkseg>
  </trk>
</gpx>
`;
  fs.writeFileSync(path.join(routesDirectory, filename), gpx);
}

const dayOneCoordinates = await fetchRoute([points.santaCristina, points.montePana, points.langkofel]);
const dayOneWaypoints = [
  waypoint("Santa Cristina", points.santaCristina, dayOneCoordinates),
  waypoint("Monte Pana", points.montePana, dayOneCoordinates),
  waypoint("Langkofelhütte", points.langkofel, dayOneCoordinates)
];
const dayOneName = "День 1 · Santa Cristina → Langkofelhütte";
const dayOneStats = writeGeoJson(
  "langkofel-day-1.geojson",
  dayOneName,
  "BRouter / OpenStreetMap",
  dayOneCoordinates,
  dayOneWaypoints
);
writeGpx("langkofel-day-1.gpx", dayOneName, dayOneCoordinates, dayOneWaypoints);

const mesulesCoordinates = parseGpxTrack(await fetchText(mesulesGpxUrl));
const mesulesStartIndex = nearestIndex(mesulesCoordinates, points.passoSella);
const mesulesExitIndex = nearestIndex(mesulesCoordinates, points.mesulesExit);
const mesulesTraverse = mesulesStartIndex <= mesulesExitIndex
  ? mesulesCoordinates.slice(mesulesStartIndex, mesulesExitIndex + 1)
  : mesulesCoordinates.slice(mesulesExitIndex, mesulesStartIndex + 1).reverse();
const dayTwoApproach = await fetchRoute([points.langkofel, points.comici, mesulesTraverse[0]]);
const dayTwoExit = await fetchRoute([mesulesTraverse.at(-1), points.boe]);
const dayTwoCoordinates = mergeCoordinates(dayTwoApproach, mesulesTraverse, dayTwoExit);
const mesulesHighPoint = mesulesTraverse.reduce((highest, coordinate) => coordinate[2] > highest[2] ? coordinate : highest);
const dayTwoWaypoints = [
  waypoint("Langkofelhütte", points.langkofel, dayTwoCoordinates),
  waypoint("Rifugio Comici", points.comici, dayTwoCoordinates),
  waypoint("Passo Sella", points.passoSella, dayTwoCoordinates),
  waypoint("Ferrata Mesules", [11.78101, 46.51526], dayTwoCoordinates, false),
  waypoint("Altopiano delle Mesules", mesulesHighPoint, dayTwoCoordinates, false),
  waypoint("Rifugio Boè", points.boe, dayTwoCoordinates)
];
const dayTwoName = "День 2 · Langkofelhütte → Mesules → Boè";
const dayTwoStats = writeGeoJson(
  "langkofel-day-2.geojson",
  dayTwoName,
  "BRouter / OpenStreetMap + official Val Gardena Mesules GPX",
  dayTwoCoordinates,
  dayTwoWaypoints
);
writeGpx("langkofel-day-2.gpx", dayTwoName, dayTwoCoordinates, dayTwoWaypoints);

console.log(JSON.stringify({ dayOne: dayOneStats, dayTwo: dayTwoStats }, null, 2));
