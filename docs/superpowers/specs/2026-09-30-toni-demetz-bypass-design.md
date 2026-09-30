# Toni-Demetz Bypass Design

## Goal

Add a complete non-ferrata alternative for day 2 while correcting the primary Mesules line on the map.

## Route Variants

The primary route remains `Langkofelhütte → Comici → Passo Sella → Ferrata Mesules → Rifugio Boè`. Its route geometry must use the first Passo Sella crossing in the official Val Gardena loop GPX and continue up the west wall of Piz Selva before crossing the Sella plateau.

The alternative route is `Langkofelhütte → Toni-Demetz-Hütte → Passo Sella → Val Lasties → l'Antersass → Rifugio Boè`. It avoids Mesules and the equipped 647A shortcut by forcing the ordinary 647 line over l'Antersass.

## Interface

Day 2 uses the same two-button route selector already used for the day 5 variants on the Pale page. The selector changes the map, elevation profile, and GPX download together. Mesules remains selected by default.

The day heading stays general enough to cover both variants. Separate parameter rows and short descriptions make the physical and technical differences explicit.

## Route Data

Keep the existing primary filenames `langkofel-day-2.geojson` and `langkofel-day-2.gpx`. Add `langkofel-day-2-bypass.geojson` and `langkofel-day-2-bypass.gpx` for the Toni-Demetz alternative.

The route builder must select the outbound part of the official Mesules GPX for the ferrata variant and the return/Val Lasties part for the bypass. Generated statistics remain planning estimates and are copied into the page only after generation.

## Verification

Automated checks must prove that the primary geometry passes through a representative point on the Mesules west wall, that the bypass includes Toni-Demetz and l'Antersass, and that both variants end at Rifugio Boè. The existing six-day continuity and maximum-segment checks remain in place.
