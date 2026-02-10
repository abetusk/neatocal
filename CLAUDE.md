# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NeatoCal is a dependency-free, single-page yearly calendar written in vanilla JavaScript. It's a fork of [abetusk/neatocal](https://github.com/abetusk/neatocal) (itself a port of [Neatnik's Calendar](https://www.neatnik.net/calendar/)) with extensive UI revisions including a settings panel, CSS grid layout, horizontal/vertical orientation, and toggle-based controls.

## Running Locally

No build step. Open `neatocal.html` directly in a browser, or serve with any static file server:

```
python3 -m http.server 8000
# then visit http://localhost:8000
```

A local server is required when using the `data` parameter (JSON fetch needs HTTP, not `file://`).

## Branches

- `main` - Upstream fork baseline
- `ui-revisions` - Active development branch with all UI changes (current working branch)

## Architecture

**No build tools, no package manager, no frameworks.** The entire app is three files:

- `neatocal.js` (~2330 lines) - All application logic in a single vanilla JS file
- `neatocal.html` - Minimal HTML shell with a CSS grid skeleton and settings panel markup; calls `neatocal_init()` on load
- `css/neatocal.css` - All styles including print media queries, horizontal orientation, settings panel, toggle switches, and pill controls

### File Structure

```
neatocal.html          # HTML shell (title: "Shaunzo Calendar")
neatocal.js            # All JS logic
css/
  neatocal.css         # All styles
  fonts.css            # Font-face declarations (Oswald, Source Code Pro)
  *.ttf                # Bundled fonts (no CDN dependency)
example/               # JSON data files and example .ics
favicon/               # Favicon assets
img/                   # README screenshots
```

### Initialization Flow

`neatocal_init()` (line ~1521) is the entry point:
1. Parses all URL parameters via `URLSearchParams`
2. Optionally fetches a JSON data file (`loadXHR` -> `neatocal_parse_data` -> `neatocal_override_param`)
3. Data file params override URL params
4. Calls `neatocal_render()` which dispatches to the selected layout
5. Sets up settings panel (`neatocal_setup_settings()`)
6. Sets up ICS drag-and-drop (`neatocal_setup_ics_drop()`)

### Three Layout Renderers

`neatocal_render()` (line ~1858) dispatches based on `NEATOCAL_PARAM.layout`:
- `neatocal_default()` - Standard compact layout, one row per day-of-month
- `neatocal_aligned_weekdays()` - Days aligned by weekday column, supports `start_day`
- `neatocal_hallon_almanackan()` - Swedish almanac-style layout with week numbers

Each renderer supports both vertical and horizontal orientation via separate loop branches. Cell population logic is extracted into helper functions to avoid duplication:
- `neatocal_default_populate_cell()`
- `neatocal_hallon_populate_cell()`
- `neatocal_aligned_populate_cell()`

### Orientation System

The `orientation` parameter (`vertical` | `horizontal`) controls axis layout:
- **Vertical (default):** months as columns, days as rows. Loop order: outer=days, inner=months.
- **Horizontal:** months as rows, days as columns. Loop order: outer=months, inner=days.

`neatocal_render()` toggles `.horizontal` CSS classes on the grid, headers, and body elements. The `--n-months` and `--n-days` CSS custom properties control grid column/row counts. For aligned-weekdays horizontal, empty trailing columns are dynamically pruned.

### Global State

`NEATOCAL_PARAM` (top of `neatocal.js`, line ~27) is the single global config object. All URL parameters, data file overrides, and styling options live here.

### Settings Panel

A slide-out panel (right side) driven by a declarative `SETTINGS_CONFIG` array (line ~1965). Settings groups: Calendar, Display, Moon Phase, Colors.

Control types:
- `number` - numeric input
- `text` - text input with optional placeholder
- `select` - dropdown
- `color` - color picker
- `checkbox` - rendered as toggle switches (not native checkboxes)
- `pill` - segmented button group (used for orientation)
- `weekend_days` - multi-toggle for days of week

Key behaviors:
- `settings_apply()` updates `NEATOCAL_PARAM`, re-renders the calendar, and syncs the URL via `history.replaceState`
- `settings_update_visibility()` handles conditional row visibility (`showWhen` in config) and auto-hides section headers when all rows in a group are hidden
- `SETTINGS_DEFAULTS` (line ~1945) defines default values for URL sync diffing

### Key Subsystems

- **Moon phases** (`calculateLunarAge`, `getMoonPhase`, `renderMoonPhase`) - Astronomical calculation with CSS SVG, Unicode symbol, or text name rendering
- **ICS import** (`ics_parse_events`, `ics_import_text`, `ics_handle_files`) - Drag-and-drop `.ics` file parsing with multi-day event expansion, color palette assignment, and interactive legend
- **Data file** (`neatocal_parse_data`, `neatocal_override_param`) - JSON file loading for cell text, cell coloring (`color_cell`), and parameter overrides
- **Styling** (`ele_styles`, per-element style functions) - Granular CSS overrides via `{element}_{property}` URL params (e.g., `weekend_font_size`)
- **Post-processing** (`neatocal_post_process`) - Applies cell data text, color_cell highlighting, `.today` class, and today-highlight color after render

### CSS Organization

The stylesheet uses nested CSS (`&` selectors) in several places. Key sections:
- Print media queries (hide UI controls, strip today background)
- CSS custom properties: `--text`, `--text-subtle`, `--n-months`, `--n-days`
- `.horizontal` variants for grid, headers, and cells
- `.today` class for today's date highlighting
- Settings panel uses CSS grid with `subgrid` for label/control alignment
- Toggle switches (`.settings-toggle`, `.settings-toggle-track`)
- Pill buttons (`.settings-pill-group`, `.settings-pill`)
- Conditional visibility via `.hidden` class on rows and section headers

### Fonts

Source Code Pro is the primary font (monospace). Oswald is bundled but not currently used in the main stylesheet. All fonts are local (`css/` directory) - no external CDN dependency.

## Configuration

All configuration is via URL query parameters. Key parameters:

| Parameter | Values | Default |
|-----------|--------|---------|
| `year` | number | current year |
| `start_month` | 0-11 | 0 (January) |
| `n_month` | 1-24 | 12 |
| `layout` | `default`, `aligned-weekdays`, `hallon-almanackan` | `default` |
| `orientation` | `vertical`, `horizontal` | `vertical` |
| `start_day` | 0-6 (aligned-weekdays only) | 0 (Sunday) |
| `show_moon_phase` | `true`/`false` | `false` |
| `show_week_numbers` | `true`/`false` | `false` |
| `highlight_color` | hex color | `#f7f7f7` |
| `today_highlight_color` | hex color | `#d3c7ff` |
| `weekend_days` | comma-separated 0-6 | `0,6` |

Parameters can also be set in a JSON data file (which overrides URL params). Example data files are in `example/`.

## Development Notes

- The calendar DOM is fully cleared and rebuilt on every render - no incremental updates
- The `H` helper object (line ~213) creates `<div>` elements for cells, date spans, day spans, etc.
- `fmt_date(y, m, d)` produces `YYYY-MM-DD` strings used as element IDs (`ui_YYYY-MM-DD`)
- Weekend highlighting is per-cell via inline `style.background`, not CSS classes
- The settings panel is built once at init and survives re-renders

## License

MIT (Neatnik LLC, 2022)
