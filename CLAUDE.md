# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NeatoCal is a dependency-free, single-page yearly calendar written in vanilla JavaScript. It's a port of [Neatnik's Calendar](https://www.neatnik.net/calendar/) with extensive URL-parameter-driven customization. Live demo: https://abetusk.github.io/neatocal

## Running Locally

No build step. Open `neatocal.html` (or the `index.html` symlink) directly in a browser, or serve with any static file server:

```
python3 -m http.server 8000
# then visit http://localhost:8000
```

A local server is required when using the `data` parameter (JSON fetch needs HTTP, not `file://`).

## Architecture

**No build tools, no package manager, no frameworks.** The entire app is three files:

- `neatocal.js` (~1900 lines) - All application logic in a single vanilla JS file
- `neatocal.html` - Minimal HTML shell with a CSS grid skeleton; calls `neatocal_init()` on load
- `css/neatocal.css` - All styles including print media queries, moon phases, and ICS event styling

### Initialization Flow

`neatocal_init()` (line ~1507) is the entry point:
1. Parses all URL parameters via `URLSearchParams`
2. Optionally fetches a JSON data file (`loadXHR` → `neatocal_parse_data` → `neatocal_override_param`)
3. Data file params override URL params
4. Calls `neatocal_render()` which dispatches to the selected layout

### Three Layout Renderers

`neatocal_render()` dispatches based on `NEATOCAL_PARAM.layout`:
- `neatocal_default()` - Standard compact layout, one row per day-of-month
- `neatocal_aligned_weekdays()` - Days aligned by weekday column, supports `start_day`
- `neatocal_hallon_almanackan()` - Swedish almanac-style layout with week numbers

Each renderer writes cells directly to `ui_grid_body` (a CSS grid container) via DOM manipulation using a minimal helper object `H` (creates `<div>` elements). Month headers go into `ui_month_headers`. The `--n-months` CSS custom property controls the grid column count.

### Global State

`NEATOCAL_PARAM` (top of `neatocal.js`) is the single global config object. All URL parameters, data file overrides, and styling options live here.

### Key Subsystems

- **Moon phases** (`calculateLunarAge`, `getMoonPhase`, `renderMoonPhase`) - Astronomical calculation with CSS SVG, Unicode symbol, or text name rendering
- **ICS import** (`ics_parse_events`, `ics_import_text`, `ics_handle_files`) - Drag-and-drop `.ics` file parsing with multi-day event expansion, color palette assignment, and interactive legend
- **Data file** (`neatocal_parse_data`, `neatocal_override_param`) - JSON file loading for cell text, cell coloring (`color_cell`), and parameter overrides
- **Styling** (`ele_styles`, per-element style functions) - Granular CSS overrides via `{element}_{property}` URL params (e.g., `weekend_font_size`)
- **Post-processing** (`neatocal_post_process`) - Applies cell data text, color_cell highlighting, and today-highlight after render

### Fonts

Oswald font is bundled locally (`css/Oswald.css` + `.ttf` files) - no external CDN dependency.

## Configuration

All configuration is via URL query parameters. See README.md for the full parameter table. Parameters can also be set in a JSON data file (which overrides URL params). Example data files are in `example/`.

## License

MIT (Neatnik LLC, 2022)
