import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const html = fs.readFileSync(path.join(root, "seceda-marmolada-costabella.html"), "utf8");

const checks = {
  startLogistics: html.includes("data-start-logistics"),
  logisticsHeading: html.includes("Як дістатися до старту"),
  route: html.includes("Trento → Col Raiser"),
  departureAndArrival: html.includes("07:05 → 10:01"),
  train: html.includes("<strong>R16662</strong>"),
  bus350: html.includes("<strong>350</strong>"),
  bus358: html.includes("<strong>358</strong>"),
  liftHours: html.includes("08:30–17:00"),
  trailStart: html.includes("Вихід на маршрут близько 10:20"),
  noTransportLinkTags: !html.includes("start-logistics-links"),
  logisticsBeforeDaysHeading: html.indexOf("data-start-logistics") >= 0
    && html.indexOf("data-start-logistics") < html.indexOf('id="days-title"'),
  logisticsBeforeDayOne: html.indexOf("data-start-logistics") >= 0
    && html.indexOf("data-start-logistics") < html.indexOf("День 1 — Santa Cristina")
};

for (const [key, value] of Object.entries(checks)) {
  if (!value) throw new Error(`Missing Seceda page capability: ${key}`);
}

console.log(JSON.stringify(checks, null, 2));
