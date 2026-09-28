import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const expectedDays = 6;
const allowedRetraceDays = new Set([2, 5]);
const summaries = [];

function distanceMeters([longitudeA, latitudeA], [longitudeB, latitudeB]) {
  const toRadians = (degrees) => degrees * Math.PI / 180;
  const latitudeDelta = toRadians(latitudeB - latitudeA);
  const longitudeDelta = toRadians(longitudeB - longitudeA);
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(toRadians(latitudeA)) * Math.cos(toRadians(latitudeB))
    * Math.sin(longitudeDelta / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function edgeKey(start, end) {
  const pointKey = ([longitude, latitude]) => `${longitude.toFixed(5)},${latitude.toFixed(5)}`;
  return [pointKey(start), pointKey(end)].sort().join("|");
}

for (let day = 1; day <= expectedDays; day += 1) {
  const geojsonPath = path.join(root, "routes", `brenta-day-${day}.geojson`);
  const gpxPath = path.join(root, "routes", `brenta-day-${day}.gpx`);

  if (!fs.existsSync(geojsonPath) || !fs.existsSync(gpxPath)) {
    throw new Error(`Missing Brenta route pair for day ${day}`);
  }

  const data = JSON.parse(fs.readFileSync(geojsonPath, "utf8"));
  const route = data.features.find((feature) => feature.properties?.kind === "route");
  const waypoints = data.features.filter((feature) => feature.properties?.kind === "waypoint");
  const coordinates = route?.geometry?.coordinates ?? [];

  if (route?.geometry?.type !== "LineString" || coordinates.length < 2) {
    throw new Error(`Day ${day} needs one non-empty route LineString`);
  }
  if (coordinates.some((coordinate) => coordinate.length < 3 || coordinate.some((value) => !Number.isFinite(Number(value))))) {
    throw new Error(`Day ${day} has coordinates without finite longitude, latitude, or elevation`);
  }
  if (waypoints.length < 2) {
    throw new Error(`Day ${day} needs named start and finish waypoints`);
  }
  if (distanceMeters(coordinates[0], waypoints[0].geometry.coordinates) > 250) {
    throw new Error(`Day ${day} route does not begin near its first waypoint`);
  }
  if (distanceMeters(coordinates.at(-1), waypoints.at(-1).geometry.coordinates) > 250) {
    throw new Error(`Day ${day} route does not end near its last waypoint`);
  }

  const edgeCounts = new Map();
  for (let index = 1; index < coordinates.length; index += 1) {
    const key = edgeKey(coordinates[index - 1], coordinates[index]);
    edgeCounts.set(key, (edgeCounts.get(key) ?? 0) + 1);
  }
  const repeatedEdges = [...edgeCounts.values()].filter((count) => count > 1).length;
  if (!allowedRetraceDays.has(day) && repeatedEdges > 12) {
    throw new Error(`Day ${day} contains ${repeatedEdges} repeated edges; inspect it for an accidental spur`);
  }

  const gpx = fs.readFileSync(gpxPath, "utf8");
  const gpxPointCount = (gpx.match(/<trkpt\s/g) ?? []).length;
  if (gpxPointCount !== coordinates.length) {
    throw new Error(`Day ${day} GeoJSON/GPX point mismatch: ${coordinates.length}/${gpxPointCount}`);
  }

  summaries.push({
    day,
    points: coordinates.length,
    waypoints: waypoints.length,
    distanceKm: route.properties.distance_km,
    ascentM: route.properties.ascent_m,
    repeatedEdges
  });
}

console.log(JSON.stringify({ days: summaries.length, routes: summaries }, null, 2));
