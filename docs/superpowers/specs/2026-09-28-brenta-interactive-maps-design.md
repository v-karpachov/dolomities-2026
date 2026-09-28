# Brenta Interactive Maps Design

## Goal

Add the same day-by-day route presentation used on the Pale and Seceda pages to `brenta.html`: an interactive map, downloadable GPX, elevation profile, and synchronized map/profile position for each of the six days.

## Route Data

- Store one GeoJSON and one GPX file per day under `routes/` using the `brenta-day-N` prefix.
- Follow the current Brenta itinerary and preserve both light-pack loops in full:
  - day 2: Pedrotti -> Spellini -> Bocchette Centrali -> Pedrotti;
  - day 5: Detassis -> Oliva Detassis -> Bocchette Alte -> SOSAT -> Detassis.
- Use OSM/BRouter hiking lines where available and manually join ferrata sections that the router cannot traverse correctly.
- Include elevations on every route coordinate and named waypoints for the main refuges, passes, summits, and ferrata transitions.
- Treat the resulting tracks as planning drafts, not authoritative navigation data.

## Page Integration

- Reuse the existing Leaflet map and SVG elevation-profile implementation from `pale-bivacco.html` and `seceda-marmolada-costabella.html`.
- Place each map directly below its day's parameter row and before the narrative description.
- Keep the existing Brenta typography, colors, spacing, and responsive layout.
- Show route distance and elevation range in the profile header.
- Synchronize pointer, touch, and keyboard movement on the profile with a marker on the map.
- Provide a GPX download link in every map toolbar.

## Verification

- Validate all GeoJSON and GPX files and ensure their route-point counts match.
- Check that all coordinates include elevation.
- Detect accidental out-and-back spurs and repeated route fragments before publishing.
- Verify six rendered maps and six rendered profiles on desktop and mobile.
- Verify profile-to-map marker movement, keyboard access, GPX links, and absence of horizontal overflow.
- Publish through the existing GitHub Pages workflow and verify the deployed files.
