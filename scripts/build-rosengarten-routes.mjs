import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const routesDirectory = path.join(root, "routes");
const brouterEndpoint = "https://brouter.de/brouter";
const santnerGpxUrl = "https://www.outdooractive.com/en/download.tour.gpx?i=16082696&project=api-carezza";
const molignonOsmUrl = "https://api.openstreetmap.org/api/0.6/map?bbox=11.62,46.46,11.68,46.51";
const fedaiaOsmUrl = "https://api.openstreetmap.org/api/0.6/map?bbox=11.835,46.426,11.895,46.469";

const points = {
  fronza: [11.6120696, 46.4426625],
  santner: [11.618746, 46.4562675],
  reAlberto: [11.6229441, 46.4592815],
  vajolet: [11.6327551, 46.4586001],
  passoPrincipe: [11.6387488, 46.4740217],
  lagoAntermoia: [11.6602803, 46.4778661],
  laurenziEast: [11.6536501, 46.4798906],
  molignonDentro: [11.6505064, 46.4830443],
  molignonFuori: [11.6436026, 46.4876807],
  laurenziWest: [11.6398679, 46.4908381],
  passoMolignon: [11.6397326, 46.4891968],
  passoDuron: [11.6535989, 46.4975112],
  sassoPiatto: [11.7008981, 46.5044281],
  langkofel: [11.7236498, 46.5199011],
  boe: [11.8232815, 46.5146145],
  bontadini: [11.888313, 46.463584],
  fedaiaNorthShore: [11.876, 46.464],
  passoFedaia: [11.86259, 46.464024],
  fedaiaSouthJunction: [11.8625, 46.4595],
  forcellaMarmolada: [11.840182, 46.438764],
  passoOmbretta: [11.84642, 46.430449],
  dalBianco: [11.8452751, 46.4291801],
  contrin: [11.8158915, 46.4297615],
  alba: [11.7805769, 46.4676647]
};

function round(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function normalizeCoordinate([longitude, latitude, elevation = 0]) {
  return [round(longitude, 6), round(latitude, 6), round(elevation, 1)];
}

function distanceMeters([longitudeA, latitudeA], [longitudeB, latitudeB]) {
  const toRadians = (degrees) => degrees * Math.PI / 180;
  const latitudeDelta = toRadians(latitudeB - latitudeA);
  const longitudeDelta = toRadians(longitudeB - longitudeA);
  const value = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(toRadians(latitudeA)) * Math.cos(toRadians(latitudeB)) * Math.sin(longitudeDelta / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(value));
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
      if (!merged.length || distanceMeters(merged.at(-1), coordinate) > 2) merged.push(coordinate);
    }
  }
  return merged;
}

function reverseCoordinates(coordinates) {
  return [...coordinates].reverse();
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

function parseOsm(xml) {
  const nodes = new Map(
    [...xml.matchAll(/<node id="(\d+)"[^>]* lat="([^"]+)" lon="([^"]+)"[^>]*>/g)]
      .map((match) => [match[1], [Number(match[3]), Number(match[2])]])
  );
  const ways = [];
  for (const match of xml.matchAll(/<way id="(\d+)"[\s\S]*?<\/way>/g)) {
    if (!/name[^>]+Laurenzi/i.test(match[0])) continue;
    ways.push([...match[0].matchAll(/<nd ref="(\d+)"\/>/g)].map((node) => node[1]));
  }
  return { nodes, ways };
}

function connectedPath(nodes, ways, startTarget, endTarget) {
  const adjacency = new Map();
  const connect = (from, to) => {
    if (!adjacency.has(from)) adjacency.set(from, []);
    adjacency.get(from).push(to);
  };
  for (const way of ways) {
    for (let index = 1; index < way.length; index += 1) {
      connect(way[index - 1], way[index]);
      connect(way[index], way[index - 1]);
    }
  }
  const ids = [...adjacency.keys()];
  const closestId = (target) => ids.reduce((best, id) => {
    const distance = distanceMeters(nodes.get(id), target);
    return distance < best.distance ? { id, distance } : best;
  }, { id: ids[0], distance: Number.POSITIVE_INFINITY }).id;
  const start = closestId(startTarget);
  const end = closestId(endTarget);
  const queue = [start];
  const previous = new Map([[start, null]]);
  while (queue.length) {
    const current = queue.shift();
    if (current === end) break;
    for (const next of adjacency.get(current) ?? []) {
      if (previous.has(next)) continue;
      previous.set(next, current);
      queue.push(next);
    }
  }
  if (!previous.has(end)) throw new Error("Could not join the mapped Laurenzi segments");
  const pathIds = [];
  for (let current = end; current; current = previous.get(current)) pathIds.push(current);
  return pathIds.reverse().map((id) => nodes.get(id));
}

function parseWalkableGraph(xml) {
  const nodes = new Map(
    [...xml.matchAll(/<node id="(\d+)"[^>]* lat="([^"]+)" lon="([^"]+)"[^>]*>/g)]
      .map((match) => [match[1], [Number(match[3]), Number(match[2])]])
  );
  const adjacency = new Map();
  const connect = (from, to, length) => {
    if (!adjacency.has(from)) adjacency.set(from, []);
    adjacency.get(from).push({ id: to, length });
  };
  for (const match of xml.matchAll(/<way id="(\d+)"[\s\S]*?<\/way>/g)) {
    const way = match[0];
    if (!/<tag k="highway" v="[^"]+"\/>/.test(way)) continue;
    if (/<tag k="access" v="(?:no|private)"\/>/.test(way)) continue;
    const ids = [...way.matchAll(/<nd ref="(\d+)"\/>/g)].map((node) => node[1]);
    for (let index = 1; index < ids.length; index += 1) {
      const from = ids[index - 1];
      const to = ids[index];
      if (!nodes.has(from) || !nodes.has(to)) continue;
      const length = distanceMeters(nodes.get(from), nodes.get(to));
      connect(from, to, length);
      connect(to, from, length);
    }
  }
  return { nodes, adjacency };
}

function shortestMappedPath(graph, startTarget, endTarget) {
  const graphIds = [...graph.adjacency.keys()];
  const closestId = (target) => graphIds.reduce((best, id) => {
    const distance = distanceMeters(graph.nodes.get(id), target);
    return distance < best.distance ? { id, distance } : best;
  }, { id: graphIds[0], distance: Number.POSITIVE_INFINITY }).id;
  const start = closestId(startTarget);
  const end = closestId(endTarget);
  const queue = [{ id: start, distance: 0 }];
  const distances = new Map([[start, 0]]);
  const previous = new Map();
  while (queue.length) {
    queue.sort((left, right) => left.distance - right.distance);
    const current = queue.shift();
    if (current.distance !== distances.get(current.id)) continue;
    if (current.id === end) break;
    for (const edge of graph.adjacency.get(current.id) ?? []) {
      const nextDistance = current.distance + edge.length;
      if (nextDistance >= (distances.get(edge.id) ?? Number.POSITIVE_INFINITY)) continue;
      distances.set(edge.id, nextDistance);
      previous.set(edge.id, current.id);
      queue.push({ id: edge.id, distance: nextDistance });
    }
  }
  if (!previous.has(end)) throw new Error("Could not join the mapped Fedaia trail segments");
  const ids = [];
  for (let current = end; current; current = previous.get(current)) {
    ids.push(current);
    if (current === start) break;
  }
  return ids.reverse().map((id) => graph.nodes.get(id));
}

function mappedPathThrough(graph, targets) {
  return mergeCoordinates(...targets.slice(1).map((target, index) =>
    shortestMappedPath(graph, targets[index], target)
  ));
}

async function addElevations(coordinates) {
  const enriched = [];
  for (let offset = 0; offset < coordinates.length; offset += 75) {
    const chunk = coordinates.slice(offset, offset + 75);
    const locations = chunk.map(([longitude, latitude]) => `${latitude},${longitude}`).join("|");
    const data = JSON.parse(await fetchText(`https://api.opentopodata.org/v1/eudem25m?locations=${locations}`));
    if (data.status !== "OK") throw new Error(`Elevation lookup failed: ${data.status}`);
    data.results.forEach((result, index) => {
      enriched.push(normalizeCoordinate([...chunk[index], result.elevation ?? 0]));
    });
  }
  return enriched;
}

function applyElevationAnchors(coordinates, anchors) {
  const sorted = anchors
    .map(([target, elevation]) => ({ index: nearestIndex(coordinates, target), elevation }))
    .sort((left, right) => left.index - right.index);
  const output = coordinates.map((coordinate) => [...coordinate]);
  for (let anchorIndex = 0; anchorIndex < sorted.length - 1; anchorIndex += 1) {
    const from = sorted[anchorIndex];
    const to = sorted[anchorIndex + 1];
    const span = Math.max(1, to.index - from.index);
    for (let index = from.index; index <= to.index; index += 1) {
      const progress = (index - from.index) / span;
      output[index][2] = round(from.elevation + (to.elevation - from.elevation) * progress, 1);
    }
  }
  return output;
}

function waypoint(name, target, coordinates, showLabel = true) {
  return {
    type: "Feature",
    properties: { kind: "waypoint", name, show_label: showLabel },
    geometry: { type: "Point", coordinates: coordinates[nearestIndex(coordinates, target)] }
  };
}

function writeGeoJson(filename, name, source, coordinates, waypoints, statsOverride = {}) {
  const stats = { ...routeStats(coordinates), ...statsOverride };
  const collection = {
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
  fs.writeFileSync(path.join(routesDirectory, filename), `${JSON.stringify(collection, null, 2)}\n`);
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
<gpx version="1.1" creator="Dolomites 2026" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><name>${escapeXml(name)}</name></metadata>
${waypointXml}
  <trk><name>${escapeXml(name)}</name><trkseg>
${trackXml}
  </trkseg></trk>
</gpx>
`;
  fs.writeFileSync(path.join(routesDirectory, filename), gpx);
}

function writeRoute(prefix, name, source, coordinates, waypoints, statsOverride = {}) {
  const stats = writeGeoJson(`${prefix}.geojson`, name, source, coordinates, waypoints, statsOverride);
  writeGpx(`${prefix}.gpx`, name, coordinates, waypoints);
  return stats;
}

function routeFromExisting(filename, name) {
  const collection = JSON.parse(fs.readFileSync(path.join(routesDirectory, filename), "utf8"));
  const line = collection.features.find((feature) => feature.properties.kind === "route");
  const waypoints = collection.features.filter((feature) => feature.properties.kind === "waypoint");
  return { coordinates: line.geometry.coordinates, waypoints, source: line.properties.source, name };
}

const santnerLoop = parseGpxTrack(await fetchText(santnerGpxUrl));
const santnerExitIndex = nearestIndex(santnerLoop, points.vajolet);
const santnerTraverse = santnerLoop.slice(0, santnerExitIndex + 1);
const santnerTail = await fetchRoute([santnerTraverse.at(-1), points.vajolet]);
const dayOneCoordinates = mergeCoordinates(santnerTraverse, santnerTail);
const dayOneWaypoints = [
  waypoint("Rifugio Fronza", points.fronza, dayOneCoordinates),
  waypoint("Passo Santner", points.santner, dayOneCoordinates),
  waypoint("Rifugio Re Alberto", points.reAlberto, dayOneCoordinates, false),
  waypoint("Rifugio Vajolet", points.vajolet, dayOneCoordinates)
];
const dayOneStats = writeRoute(
  "rosengarten-day-1",
  "День 1 · Fronza → Santner → Vajolet",
  "Official Carezza / Outdooractive Santner GPX + BRouter / OpenStreetMap",
  dayOneCoordinates,
  dayOneWaypoints
);

const { nodes: molignonNodes, ways: laurenziWays } = parseOsm(await fetchText(molignonOsmUrl));
const laurenziFlat = connectedPath(molignonNodes, laurenziWays, points.laurenziEast, points.laurenziWest);
const laurenziElevated = await addElevations(laurenziFlat);
const laurenziCoordinates = applyElevationAnchors(laurenziElevated, [
  [points.laurenziEast, 2645],
  [points.molignonDentro, 2850],
  [points.molignonFuori, 2780],
  [points.laurenziWest, 2600]
]);
const laurenziApproach = await fetchRoute([
  points.vajolet,
  points.passoPrincipe,
  laurenziCoordinates[0]
]);
const laurenziExit = await fetchRoute([
  laurenziCoordinates.at(-1),
  points.passoDuron
]);
const commonFinish = await fetchRoute([
  points.passoDuron,
  points.sassoPiatto,
  points.langkofel
]);
const dayTwoLaurenziCoordinates = mergeCoordinates(
  laurenziApproach,
  laurenziCoordinates,
  laurenziExit,
  commonFinish
);
const dayTwoLaurenziWaypoints = [
  waypoint("Rifugio Vajolet", points.vajolet, dayTwoLaurenziCoordinates),
  waypoint("Passo Principe", points.passoPrincipe, dayTwoLaurenziCoordinates, false),
  waypoint("Ferrata Laurenzi", points.molignonDentro, dayTwoLaurenziCoordinates),
  waypoint("Passo Duron", points.passoDuron, dayTwoLaurenziCoordinates, false),
  waypoint("Rifugio Sasso Piatto", points.sassoPiatto, dayTwoLaurenziCoordinates, false),
  waypoint("Langkofelhütte", points.langkofel, dayTwoLaurenziCoordinates)
];
const dayTwoLaurenziStats = writeRoute(
  "rosengarten-day-2-laurenzi",
  "День 2 · Vajolet → Laurenzi → Langkofelhütte",
  "BRouter / OpenStreetMap + mapped Via Ferrata Laurenzi geometry",
  dayTwoLaurenziCoordinates,
  dayTwoLaurenziWaypoints
);

const molignonApproach = await fetchRoute([
  points.vajolet,
  points.passoPrincipe,
  points.passoMolignon,
  points.passoDuron
]);
const dayTwoBypassCoordinates = mergeCoordinates(molignonApproach, commonFinish);
const dayTwoBypassWaypoints = [
  waypoint("Rifugio Vajolet", points.vajolet, dayTwoBypassCoordinates),
  waypoint("Passo Principe", points.passoPrincipe, dayTwoBypassCoordinates, false),
  waypoint("Passo Molignon", points.passoMolignon, dayTwoBypassCoordinates),
  waypoint("Passo Duron", points.passoDuron, dayTwoBypassCoordinates, false),
  waypoint("Rifugio Sasso Piatto", points.sassoPiatto, dayTwoBypassCoordinates, false),
  waypoint("Langkofelhütte", points.langkofel, dayTwoBypassCoordinates)
];
const dayTwoBypassStats = writeRoute(
  "rosengarten-day-2-molignon",
  "День 2 · Vajolet → Passo Molignon → Langkofelhütte",
  "BRouter / OpenStreetMap",
  dayTwoBypassCoordinates,
  dayTwoBypassWaypoints
);

const reusedRoutes = [
  ["langkofel-day-2.geojson", "rosengarten-day-3", "День 3 · Langkofelhütte → Mesules → Boè"],
  ["langkofel-day-2-bypass.geojson", "rosengarten-day-3-bypass", "День 3 · Langkofelhütte → Toni-Demetz → Val Lasties → Boè"],
  ["day-3.geojson", "rosengarten-day-4", "День 4 · Boè → Trincee → Bontadini"]
];
const reusedStats = {};
for (const [sourceFilename, prefix, name] of reusedRoutes) {
  const route = routeFromExisting(sourceFilename, name);
  reusedStats[prefix] = writeRoute(prefix, route.name, route.source, route.coordinates, route.waypoints);
}

const fedaiaGraph = parseWalkableGraph(await fetchText(fedaiaOsmUrl));
const dayFiveApproachFlat = mappedPathThrough(fedaiaGraph, [
  points.bontadini,
  points.fedaiaNorthShore,
  points.passoFedaia,
  points.fedaiaSouthJunction,
  points.forcellaMarmolada
]);
const dayFiveApproach = applyElevationAnchors(
  dayFiveApproachFlat.map((coordinate) => normalizeCoordinate([...coordinate, 0])),
  [
    [points.bontadini, 2546],
    [points.fedaiaNorthShore, 2240],
    [points.passoFedaia, 2057],
    [points.fedaiaSouthJunction, 2050],
    [points.forcellaMarmolada, 2885]
  ]
);
const originalDayFive = routeFromExisting(
  "day-4.geojson",
  "День 5 · Bontadini → Forcella Marmolada → Dal Bianco"
);
const originalForcellaIndex = nearestIndex(originalDayFive.coordinates, points.forcellaMarmolada);
const dayFiveCoordinates = mergeCoordinates(
  dayFiveApproach,
  originalDayFive.coordinates.slice(originalForcellaIndex)
);
const dayFiveWaypoints = [
  waypoint("Bivacco Bontadini", points.bontadini, dayFiveCoordinates),
  waypoint("Lago di Fedaia · північний бік", points.fedaiaNorthShore, dayFiveCoordinates, false),
  waypoint("Passo Fedaia", points.passoFedaia, dayFiveCoordinates),
  waypoint("Forcella Marmolada", points.forcellaMarmolada, dayFiveCoordinates),
  waypoint("Passo Ombretta", points.passoOmbretta, dayFiveCoordinates),
  waypoint("Bivacco Dal Bianco", points.dalBianco, dayFiveCoordinates)
];
const dayFiveStats = writeRoute(
  "rosengarten-day-5",
  "День 5 · Bontadini → Forcella Marmolada → Dal Bianco",
  "OpenStreetMap mapped paths + planning elevation anchors",
  dayFiveCoordinates,
  dayFiveWaypoints
);

const daySixRaw = await fetchRoute([points.dalBianco, points.contrin, points.alba]);
const daySixCoordinates = applyElevationAnchors(daySixRaw, [
  [points.dalBianco, 2730],
  [points.contrin, 2016],
  [points.alba, 1460]
]);
const daySixWaypoints = [
  waypoint("Bivacco Dal Bianco", points.dalBianco, daySixCoordinates),
  waypoint("Rifugio Contrin", points.contrin, daySixCoordinates, false),
  waypoint("Alba di Canazei", points.alba, daySixCoordinates)
];
const daySixStats = writeRoute(
  "rosengarten-day-6",
  "День 6 · Dal Bianco → Val Contrin → Alba di Canazei",
  "BRouter / OpenStreetMap",
  daySixCoordinates,
  daySixWaypoints
);

console.log(JSON.stringify({
  dayOne: dayOneStats,
  dayTwoLaurenzi: dayTwoLaurenziStats,
  dayTwoMolignon: dayTwoBypassStats,
  dayThree: reusedStats["rosengarten-day-3"],
  dayThreeBypass: reusedStats["rosengarten-day-3-bypass"],
  dayFour: reusedStats["rosengarten-day-4"],
  dayFive: dayFiveStats,
  daySix: daySixStats
}, null, 2));
