# Rosengarten route URL

## Goal

Remove the obsolete `costabella` segment from the current Rosengarten route
page URL without breaking previously shared links.

## Design

- Make `rosengarten-sassolungo-marmolada.html` the canonical detail page.
- Update the route link on `index.html` to the new filename.
- Keep `sassolungo-marmolada-costabella.html` as a lightweight redirect to the
  canonical page, preserving query parameters and fragments when JavaScript is
  available and providing a normal fallback link.
- Keep the archived `seceda-marmolada-costabella.html` route unchanged because
  Costabella is still part of that historical itinerary.

## Verification

- The index links only to the canonical Rosengarten filename.
- The canonical page contains the current six-day route and a canonical URL.
- The legacy filename redirects to the canonical page.
- Existing page and route verification scripts continue to pass.
