# Three-route index design

## Goal

Replace the current comparison page at `index.html` with a Ukrainian-language overview of the three current route options:

1. Dolomiti di Brenta
2. Pale di San Martino
3. Seceda → Marmolada → Costabella

Preserve the old Brenta versus Alta Via 2 comparison as `comparison.html`.

## Page structure

- A compact opening section introduces the three route choices without a large marketing hero.
- A full-width interactive overview map appears between the introduction and route columns.
- The main comparison area uses three equal columns on desktop and a single stacked column on mobile.
- Each route column contains its name, working route parameters, a short description, and a clear link to its detailed page.
- A gallery section follows the summaries. Each route has an independent single-image carousel with previous/next controls and automatic rotation every three seconds.
- A subdued footer link opens the preserved comparison page.

## Route links

- Dolomiti di Brenta → `brenta.html`
- Pale di San Martino → `pale-bivacco.html`
- Seceda → Marmolada → Costabella → `seceda-marmolada-costabella.html`
- Previous comparison → `comparison.html`

## Overview map

- Reuse the Leaflet and OpenTopoMap setup already used by the detailed route pages.
- Assemble each complete route from its existing daily GeoJSON files.
- Show all three lines by default, using the same rust, green, and gold accents as the route columns.
- Mark the start and finish of each route with compact labelled points.
- Place three route buttons above the map. Selecting one route dims the other lines and fits the map to the selected route; selecting it again restores the combined view.
- Use the primary Day 1 option for Seceda (`day-1-col-raiser.geojson`) and the primary Day 5 option for Pale (`pale-day-5-reali.geojson`). Alternatives remain on their detailed pages.
- Display a concise inline error state if route data or the map library cannot load.

## Visual direction

Reuse the current editorial mountain style: dark green headings, warm white background, rust accents, serif display type, restrained borders, and large landscape photography. Keep the three routes visually equal. Cards use small corner radii and stable image aspect ratios. The desktop layout aligns route names, parameters, descriptions, actions, and galleries across all three columns.

## Content and assets

Reuse existing route text, parameters, and remote photographs already present in the project. Brenta uses the existing Brenta gallery. Pale uses the existing Pale photographs. Seceda uses the existing Seceda/Marmolada hero and suitable Marmolada photographs already referenced by the site. No new route claims or final route figures are introduced.

## Responsive behavior

- Desktop: three equal columns.
- Tablet: three columns remain when readable; otherwise switch to a horizontal snap layout.
- Mobile: one route at a time with visible swipe guidance and horizontal snapping, matching the interaction pattern of the previous comparison page.
- Gallery arrows remain tappable and all text stays within its column.

## Navigation and compatibility

Detailed route pages continue linking back to `index.html`, which now opens the three-route overview. `comparison.html` remains directly accessible and receives a back link to the new index. The implementation remains standalone HTML/CSS/JS for GitHub Pages.

## Verification

- Confirm the overview map loads all three route groups and eighteen primary daily tracks.
- Verify route buttons select, dim, fit, and restore the combined view.
- Confirm all four navigation targets load.
- Verify three route summaries and three galleries render on desktop and mobile.
- Check carousel arrows, automatic rotation, keyboard controls, and swipe behavior.
- Check for missing images, console errors, and horizontal overflow.
