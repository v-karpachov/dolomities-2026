# Three-route index design

## Goal

Replace the current comparison page at `index.html` with a Ukrainian-language overview of the three current route options:

1. Dolomiti di Brenta
2. Pale di San Martino
3. Seceda → Marmolada → Costabella

Preserve the old Brenta versus Alta Via 2 comparison as `comparison.html`.

## Page structure

- A compact opening section introduces the three route choices without a large marketing hero.
- The main comparison area uses three equal columns on desktop and a single stacked column on mobile.
- Each route column contains its name, working route parameters, a short description, and a clear link to its detailed page.
- A gallery section follows the summaries. Each route has an independent single-image carousel with previous/next controls and automatic rotation every three seconds.
- A subdued footer link opens the preserved comparison page.

## Route links

- Dolomiti di Brenta → `brenta.html`
- Pale di San Martino → `pale-bivacco.html`
- Seceda → Marmolada → Costabella → `seceda-marmolada-costabella.html`
- Previous comparison → `comparison.html`

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

- Confirm all four navigation targets load.
- Verify three route summaries and three galleries render on desktop and mobile.
- Check carousel arrows, automatic rotation, keyboard controls, and swipe behavior.
- Check for missing images, console errors, and horizontal overflow.
