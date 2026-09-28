# Day 1 Interactive Route Map Design

## Goal

Add a trial interactive map for Day 1 of the `Seceda → Marmolada → Costabella` route. The map must show the primary start through Col Raiser and the shorter start from Seceda, follow mapped hiking trails, and provide a downloadable GPX for each option.

## Placement and Interaction

Place the map inside the Day 1 card, after the introductory paragraph and before the two detailed option sections.

- Default to `Варіант A · Col Raiser`.
- Use a compact segmented control to switch between `Варіант A` and `Варіант B`.
- Reframe the map to the selected track without changing the surrounding page position.
- Show start, Seceda, Forces de Siëles, and Rifugio Puez as named markers where applicable.
- Add one `Завантажити GPX` action for the selected option.
- Keep pan, pinch zoom, and normal map controls usable on mobile.

## Route Data

Store route geometry separately from the page:

- `routes/day-1-col-raiser.geojson` and `routes/day-1-col-raiser.gpx`
- `routes/day-1-seceda.geojson` and `routes/day-1-seceda.gpx`

Build both tracks from OpenStreetMap hiking paths using pedestrian or hiking routing, then inspect the resulting line against the intended sequence:

- Option A: Col Raiser upper station → Seceda → Forces de Siëles → Rifugio Puez
- Option B: Seceda upper station → Forces de Siëles → Rifugio Puez

The line must not use straight point-to-point segments. Treat distance and ascent displayed on the page as working route estimates; do not silently overwrite them from the router unless the difference is material and has been reviewed.

## Map Implementation

Use Leaflet in the existing standalone HTML page, loaded from a pinned CDN version. Use OpenTopoMap raster tiles with the required OpenStreetMap and OpenTopoMap attribution. Load the selected local GeoJSON file with `fetch`, while the equivalent GPX remains a direct download.

Use the page's existing forest, rust, gold, paper, and border colors. The map is a functional full-width tool inside the Day 1 content rather than a decorative nested card. Give it a stable responsive height, clear focus styles, and a text fallback linking to the GPX files if JavaScript or tiles fail.

## Failure Handling

- Keep the rest of the route page usable if Leaflet, tiles, or route data fail to load.
- Replace the map canvas with a short Ukrainian error message when GeoJSON loading fails.
- Keep GPX download links available independently of map initialization.

## Verification

- Validate both GeoJSON and GPX files and confirm each has a non-empty route line.
- Confirm the Option A track starts at Col Raiser, Option B starts at Seceda, and both end at Rifugio Puez.
- Confirm switching options changes the displayed track, markers, download target, and fitted bounds.
- Check the page at desktop and mobile widths for readable controls and a stable map height.
- Confirm direct GPX downloads and the published GitHub Pages route page return HTTP 200.
