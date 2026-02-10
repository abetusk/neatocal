/*

MIT License

Copyright (c) 2022 Neatnik LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

var NEATOCAL_PARAM = {

  // experiments with filling in data in cells
  //
  "data_fn": "",

  "data": { },
  "ics_import_count": 0,
  "ics_imports": [],
  "ics": false,

  "firefox_hack": true,

  "color_cell": [],

  // Putting data in cells can alter the cell/row height,
  // so we allow a user parameter to fiddle with cell height.
  // The parameter here is directly applied to the `tr` style,
  // so values of "1.5em" or "30px" will work.
  //
  "cell_height": "",

  // show info/help screen
  //
  "help" : false,

  // for aligned-weekdays, which day to start (0 indexed)
  //
  //   Monday (1) default
  //
  "start_day": 1,

  // calendar format
  //
  //   default
  //   aligned-weekdays
  //
  "format": "default",

  // orientation
  //
  //   vertical (default) - months as columns, days as rows
  //   horizontal - months as rows, days as columns
  //
  "orientation": "vertical",

  // year to start
  //
  //   default this year
  //
  "year": new Date().getFullYear(),

  // Text to use for displaying weekdays
  //
  "weekday_code" : [ "Su", "M", "T", "W", "R", "F", "Sa"  ],

  // Weekday representation https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#weekday
  //
  //   long
  //   short
  //   narrow
  //
  "weekday_format": "short",

  // text to sue for month header
  //
  "month_code": [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],

  // Month representation https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#month
  //
  //   numeric
  //   2-digit
  //   long
  //   short
  //   narrow
  //
  "month_format": "short",

  // weekend days (0=Sun, 1=Mon, ..., 5=Fri, 6=Sat)
  // Default Sunday Monday.
  //
  "weekend_days": [ 0, 6 ],

  //
  "language" : "",

  // start month (0 indexed)
  //
  //   Janurary (0) default
  //
  "start_month" : 0,

  // number of months to go out to
  //
  "n_month" : 12,

  // weekend highlight color
  //
  "highlight_color": '#eee',

  // today's date highlight color
  //
  "today_highlight_color": '',

  // Moon phase display options
  //
  "show_moon_phase": false,
  "moon_phase_style": "css",  // "css", "symbol", "name"
  "moon_phase_position": "below",  // "below", "inline"
  "moon_phase_display": "changes",  // "all", "changes"
  //
  // show week numbers
  //
  "show_week_numbers": false,

  "font_family": '',

  // fiddly parameters
  //
  "year_font_size": undefined,
  "year_font_weight": undefined,
  "year_foreground_color": undefined,
  "year_background_color": undefined,

  "month_font_size": undefined,
  "month_font_weight": undefined,
  "month_foreground_color": undefined,
  "month_background_color": undefined,

  "weekday_font_size": undefined,
  "weekday_font_weight": undefined,
  "weekday_foreground_color": undefined,
  "weekday_background_color": undefined,

  "weekend_font_size": undefined,
  "weekend_font_weight": undefined,
  "weekend_foreground_color": undefined,
  "weekend_background_color": undefined,

  "week_font_size": undefined,
  "week_font_weight": undefined,
  "week_foreground_color": undefined,
  "week_background_color": undefined,

  "date_font_size": undefined,
  "date_font_weight": undefined,
  "date_foreground_color": undefined,
  "date_background_color": undefined,

  "weekend_date_font_size": undefined,
  "weekend_date_font_weight": undefined,
  "weekend_date_foreground_color": undefined,
  "weekend_date_background_color": undefined

};

var ICS_PALETTE = [
  { "bg": "#cfe8ff", "fg": "#000000" },
  { "bg": "#1e4f8a", "fg": "#ffffff" },
  { "bg": "#ffd6d6", "fg": "#000000" },
  { "bg": "#8a1f2b", "fg": "#ffffff" },
  { "bg": "#d8f5d0", "fg": "#000000" },
  { "bg": "#1f6b3d", "fg": "#ffffff" },
  { "bg": "#fff2b3", "fg": "#000000" },
  { "bg": "#8a6b10", "fg": "#ffffff" }
];

// use __base to allow additional events from ics files to be
// consolidated with any supplied via data param on page load
function data_clone_base(data) {
  let clone = JSON.parse(JSON.stringify(data || {}));
  if (clone && typeof clone === "object") {
    delete clone.__base;
  }
  return clone;
}

function data_set_base(data) {
  let base = data_clone_base(data);
  let current = data_clone_base(base);
  current.__base = base;
  NEATOCAL_PARAM.data = current;
}

// simple HTML convenience functions
//
var H = {
  "text": function(txt) { return document.createTextNode(txt); },
  "div": function() { return document.createElement("div"); },
  "cell": function() {
    let d = document.createElement("div");
    d.classList.add("cal-cell");
    return d;
  },
  "header": function(v) {
    let d = document.createElement("div");
    d.classList.add("cal-header");
    if (typeof v !== "undefined") { d.innerHTML = v; }
    return d;
  },
  "span": function(v,_class) {
    let s = document.createElement("span");
    if (typeof v !== "undefined") { s.innerHTML = v; }
    if (typeof _class !== "undefined") { s.classList.add(_class); }
    return s;
  }
};

// Probably overkill but have parameters to fiddle with the weekend text, weekday text,
// date (day in month) text, month text, week number (if specified) and dates that fall
// on the weekend (day in month that are also weekends).
// Logic is in each of the render functions but the idea is that date stylings happens
// first then weekend_date stylings are applied.
//
// ele is the HTML element that class stylings are being applied.
// _type is one of "weekend", "weekday", "date", "month", "week", "weekend_date"
//
// _type is checked for validity from the `valid_types` array.
// If not found, returns.
//
// If found, each of the parameter variables is enumerated by tacking on the suffix
// in the `sfx_param` array and testing to see if specified in the NEATOCAL_PARAM list.
// If found, the class stylings are applied to the HTML element using the `class_key`
// value specified.
//
function ele_styles(ele, _type) {
  let valid_type = ["weekend", "weekday", "date", "month", "week", "weekend_date", "year"];
  let sfx_param = [ "_font_size", "_font_weight", "_foreground_color", "_background_color"];
  let class_key = ["fontSize", "fontWeight", "color", "background"];

  let _t = "";
  for (let i=0; i<valid_type.length; i++) {
    if (valid_type[i] == _type) { _t = valid_type[i];  break; }
  }
  if (_t == "") { return; }

  for (let i=0; i<sfx_param.length; i++) {
    let _param = _t + sfx_param[i];
    if ((_param in NEATOCAL_PARAM) &&
        (typeof NEATOCAL_PARAM[_param] !== "undefined")) {
      ele.style[class_key[i]] = NEATOCAL_PARAM[_param];
    }
  }

}

// for convenience, functions wrap the above meta function
//
function weekend_styles(weekend_ele) { ele_styles(weekend_ele, "weekend"); }
function weekday_styles(weekday_ele) { ele_styles(weekday_ele, "weekday"); }
function week_styles(week_ele) { ele_styles(week_ele, "week"); }
function date_styles(date_ele) { ele_styles(date_ele, "date"); }
function weekend_date_styles(weekend_date_ele) { ele_styles(weekend_date_ele, "weekend_date"); }
function month_styles(month_ele) { ele_styles(month_ele, "month"); }
function year_styles(year_ele) { ele_styles(year_ele, "year"); }

function render_cell_data(td, yyyy_mm_dd) {
  if (!(yyyy_mm_dd in NEATOCAL_PARAM.data)) { return; }

  let val = NEATOCAL_PARAM.data[yyyy_mm_dd];

  if (typeof val === "string") {
    let txt = H.div();
    txt.innerHTML = val;
    txt.style.textAlign = "center";
    txt.style.fontWeight = "300";
    td.appendChild(txt);
    return;
  }

  if (!Array.isArray(val)) { return; }

  for (let i = 0; i < val.length; i++) {
    let item = val[i];

    // for simple data, just render text
    //
    if (typeof item === "string") {
      let txt = H.div();
      txt.innerHTML = item;
      txt.style.textAlign = "center";
      txt.style.fontWeight = "300";
      td.appendChild(txt);
      continue;
    }

    // for more complex date information,
    // from iCal, say, decorate with extra
    // markup
    //
    let line = H.div();
    line.classList.add("event");
    line.textContent = item.title || "";

    if (item.color) {
      line.style.background = item.color;
    }
    if (item.text_color) {
      line.style.color = item.text_color;
    }
    if (item.span) {
      line.classList.add("event-span");
      if (item.span.start) { line.classList.add("event-span-start"); }
      if (item.span.end) { line.classList.add("event-span-end"); }
    }

    td.appendChild(line);
  }
}

function add_event_to_date(yyyy_mm_dd, event) {
  if (!(yyyy_mm_dd in NEATOCAL_PARAM.data)) {
    NEATOCAL_PARAM.data[yyyy_mm_dd] = [];
  } else if (!Array.isArray(NEATOCAL_PARAM.data[yyyy_mm_dd])) {
    NEATOCAL_PARAM.data[yyyy_mm_dd] = [NEATOCAL_PARAM.data[yyyy_mm_dd]];
  }
  NEATOCAL_PARAM.data[yyyy_mm_dd].push(event);
}

function get_view_range() {
  let start = new Date(NEATOCAL_PARAM.year, NEATOCAL_PARAM.start_month, 1);
  let end = new Date(NEATOCAL_PARAM.year, NEATOCAL_PARAM.start_month + NEATOCAL_PARAM.n_month, 1);
  return { start: start, end: end };
}


// Moon phase calculation functions
// Reference: Known new moon on Jan 6, 2000, 18:14 UTC (Julian Day 2451550.26)
//
function calculateLunarAge(year, month, day) {

  // Calculate days since reference new moon (Jan 6, 2000)
  //
  let refDate = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
  let targetDate = new Date(Date.UTC(year, month, day, 0, 0, 0));

  let daysSince = (targetDate - refDate) / (1000 * 60 * 60 * 24);

  // Lunar synodic period (new moon to new moon)
  //
  let lunarCycle = 29.53058867;

  // Calculate lunar age (days since last new moon)
  //
  let lunarAge = daysSince % lunarCycle;
  if (lunarAge < 0) { lunarAge += lunarCycle; }

  return lunarAge;
}

function getMoonPhase(lunarAge) {

  // Returns phase index 0-7
  // 0: New Moon, 1: Waxing Crescent, 2: First Quarter, 3: Waxing Gibbous
  // 4: Full Moon, 5: Waning Gibbous, 6: Last Quarter, 7: Waning Crescent
  //
  let phase = Math.round((lunarAge / 29.53058867) * 8) % 8;

  return phase;
}

function getMoonIllumination(lunarAge) {
  // Returns illumination percentage 0-100
  let cycle = 29.53058867;
  let percent = ((1 - Math.cos((lunarAge / cycle) * 2 * Math.PI)) / 2) * 100;
  return Math.round(percent);
}

function getMoonPhaseName(phase) {
  const names = [
    "New", "Wax Cres", "First Qtr", "Wax Gibb",
    "Full", "Wan Gibb", "Last Qtr", "Wan Cres"
  ];
  return names[phase];
}

function getMoonPhaseSymbol(phase) {
  const symbols = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];
  return symbols[phase];
}

// Counter for unique mask IDs
//
var MOON_PHASE_COUNTER = 0;

function createMoonPhaseCSS(phase, lunarAge) {

  // Create an inline SVG moon phase visualization with unique mask IDs
  //
  let span = H.span("", "moon-phase");
  let uid = ++MOON_PHASE_COUNTER;

  // SVG moon phase definitions using masks for curved terminators
  //
  const svgs = [

    // 0: New Moon
    //
    "<svg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'><circle cx='32' cy='32' r='30' fill='#404040'/></svg>",

    // 1: Waxing Crescent
    //
    `<svg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'><defs><mask id='m1-${uid}'><circle cx='32' cy='32' r='30' fill='white'/><circle cx='22' cy='32' r='30' fill='black'/></mask></defs><circle cx='32' cy='32' r='30' fill='#404040'/><circle cx='32' cy='32' r='30' fill='#d0d0d0' mask='url(#m1-${uid})'/></svg>`,

    // 2: First Quarter
    //
    `<svg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'><defs><mask id='m2-${uid}'><rect x='32' y='0' width='32' height='64' fill='white'/></mask></defs><circle cx='32' cy='32' r='30' fill='#404040'/><circle cx='32' cy='32' r='30' fill='#d0d0d0' mask='url(#m2-${uid})'/></svg>`,

    // 3: Waxing Gibbous
    //
    `<svg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'><defs><mask id='m3-${uid}'><circle cx='32' cy='32' r='30' fill='white'/><circle cx='42' cy='32' r='30' fill='black'/></mask></defs><circle cx='32' cy='32' r='30' fill='#d0d0d0'/><circle cx='32' cy='32' r='30' fill='#404040' mask='url(#m3-${uid})'/></svg>`,

    // 4: Full Moon
    //
    "<svg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'><circle cx='32' cy='32' r='30' fill='#d0d0d0'/></svg>",

    // 5: Waning Gibbous
    //
    `<svg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'><defs><mask id='m5-${uid}'><circle cx='32' cy='32' r='30' fill='white'/><circle cx='22' cy='32' r='30' fill='black'/></mask></defs><circle cx='32' cy='32' r='30' fill='#d0d0d0'/><circle cx='32' cy='32' r='30' fill='#404040' mask='url(#m5-${uid})'/></svg>`,

    // 6: Last Quarter (Third Quarter)
    //
    `<svg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'><defs><mask id='m6-${uid}'><rect x='0' y='0' width='32' height='64' fill='white'/></mask></defs><circle cx='32' cy='32' r='30' fill='#404040'/><circle cx='32' cy='32' r='30' fill='#d0d0d0' mask='url(#m6-${uid})'/></svg>`,

    // 7: Waning Crescent
    //
    `<svg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'><defs><mask id='m7-${uid}'><circle cx='32' cy='32' r='30' fill='white'/><circle cx='42' cy='32' r='30' fill='black'/></mask></defs><circle cx='32' cy='32' r='30' fill='#404040'/><circle cx='32' cy='32' r='30' fill='#d0d0d0' mask='url(#m7-${uid})'/></svg>`
  ];

  span.innerHTML = svgs[phase];
  return span;
}

function renderMoonPhase(td, year, month, day) {
  if (!NEATOCAL_PARAM.show_moon_phase) { return; }

  let lunarAge = calculateLunarAge(year, month, day);
  let phase = getMoonPhase(lunarAge);

  // If only showing phase changes, check if phase is different from previous day
  //
  if (NEATOCAL_PARAM.moon_phase_display === "changes") {

    // Calculate previous day
    //
    let prevDate = new Date(year, month, day - 1);
    let prevLunarAge = calculateLunarAge(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate());
    let prevPhase = getMoonPhase(prevLunarAge);

    // Skip if phase hasn't changed
    //
    if (phase === prevPhase) { return; }
  }

  let moonElement;

  if (NEATOCAL_PARAM.moon_phase_style === "symbol") {
    moonElement = H.span(getMoonPhaseSymbol(phase), "moon-symbol");
  }

  else if (NEATOCAL_PARAM.moon_phase_style === "name") {
    moonElement = H.span(getMoonPhaseName(phase), "moon-name");
  }

  else {

    // Default to CSS
    //
    moonElement = createMoonPhaseCSS(phase, lunarAge);
  }

  if (NEATOCAL_PARAM.moon_phase_position === "inline") {

    // Add inline after a space
    //
    moonElement.classList.add("moon-inline");
    td.appendChild(H.text(" "));
    td.appendChild(moonElement);
  }

  else {

    // Add below in its own container
    //
    let moonContainer = H.div();
    moonContainer.classList.add("moon-container");
    moonContainer.appendChild(moonElement);
    td.appendChild(moonContainer);
  }

}

function localized_day(locale, day_idx) {
  let iday = 17 + day_idx;
  let s = '1995-12-' + iday.toString() + 'T12:00:01Z';
  let d = new Date(s);
  return d.toLocaleDateString(locale, {"weekday":NEATOCAL_PARAM.weekday_format});
}

function localized_month(locale, mo_idx) {
  let imo = 1 + mo_idx;
  let imo_str = ((imo < 10) ? ("0" + imo.toString()) : imo.toString());
  let s = '1995-' + imo_str + '-18T12:00:01Z';
  let d = new Date(s);
  return d.toLocaleDateString(locale, {"month":NEATOCAL_PARAM.month_format});
}

function neatocal_hallon_populate_cell(cell, cur_year, cur_mo, idx, i_mo, day_parity, orientation) {
  let nday_in_mo = new Date(cur_year, cur_mo+1, 0).getDate();

  if ((typeof NEATOCAL_PARAM.cell_height !== "undefined") &&
      (NEATOCAL_PARAM.cell_height != null) &&
      (NEATOCAL_PARAM.cell_height != "")) {
    cell.style.height = NEATOCAL_PARAM.cell_height;
  }

  if (idx < nday_in_mo) {
    let dt = new Date(cur_year, cur_mo, idx+1);
    let d = NEATOCAL_PARAM.weekday_code[ dt.getDay() ];

    if (day_parity[i_mo][idx]) {
      cell.classList.add("weekend");
    }

    // In vertical mode, border-bottom separates week groups.
    // In horizontal mode, border-right is handled by CSS, so
    // we use the same logic but on border-right.
    if (orientation === "horizontal") {
      if ((dt.getDay() != 0) || (idx == (nday_in_mo-1))) {
        cell.style.borderRight = '0';
      }
    } else {
      if ((dt.getDay() != 0) || (idx == (nday_in_mo-1))) {
        cell.style.borderBottom = '0';
      }
    }

    let span_date = H.span((idx+1).toString(), "date");
    let span_day = H.span(d, "day");

    date_styles(span_date);

    if (NEATOCAL_PARAM.weekend_days.includes(dt.getDay())) {
      span_date.style.color = "rgb(230,37,7)";
      span_day.style.color = "rgb(230,37,7)";
      weekend_styles(span_day);
      weekend_date_styles(span_date);
    } else {
      weekday_styles(span_day);
    }

    cell.appendChild( span_date );
    cell.appendChild( span_day );

    if ((dt.getDay() == 1) && NEATOCAL_PARAM.show_week_numbers) {
      let span_week_no = H.span(getISOWeekNumber(dt), "date");
      span_week_no.style.float = "right";
      span_week_no.style.color = "rgb(230,37,7)";
      week_styles(span_week_no);
      cell.appendChild(span_week_no);
    }

    let yyyy_mm_dd = fmt_date(cur_year, cur_mo+1, idx+1);
    render_cell_data(cell, yyyy_mm_dd);
    renderMoonPhase(cell, cur_year, cur_mo, idx+1);
  }
}

function neatocal_hallon_almanackan() {
  let year      = NEATOCAL_PARAM.year;
  let start_mo  = NEATOCAL_PARAM.start_month;
  let n_mo      = NEATOCAL_PARAM.n_month;
  let orientation = NEATOCAL_PARAM.orientation || "vertical";

  let ui_month_headers = document.getElementById("ui_month_headers");
  ui_month_headers.innerHTML = "";
  for (let i_mo = start_mo; i_mo < (start_mo+n_mo); i_mo++) {
    let hdr = H.header( NEATOCAL_PARAM.month_code[ i_mo%12 ] );
    month_styles(hdr);
    ui_month_headers.appendChild( hdr );
  }

  // Precompute the parity of week the day falls on.
  //
  let week_parity = 0;
  let day_parity = {};
  for (let i_mo = start_mo; i_mo < (start_mo+n_mo); i_mo++) {
    let cur_year = parseInt(year) + Math.floor(i_mo/12);
    let cur_mo = i_mo%12;
    let nday_in_mo = new Date(cur_year,cur_mo+1,0).getDate();

    if (!(i_mo in day_parity)) {
      day_parity[i_mo] = {};
    }

    for (let day_idx=0; day_idx < 31; day_idx++) {
      if (day_idx >= nday_in_mo) { break; }
      day_parity[i_mo][day_idx] = week_parity;
      let dt = new Date(cur_year, cur_mo, day_idx+1);
      if (dt.getDay() == 0) {
        week_parity = 1-week_parity;
      }
    }
  }

  let grid_body = document.getElementById("ui_grid_body");

  if (orientation === "horizontal") {
    // Horizontal: outer=months (rows), inner=days (columns)
    for (let i_mo = start_mo; i_mo < (start_mo+n_mo); i_mo++) {
      let cur_year = parseInt(year) + Math.floor(i_mo/12);
      let cur_mo = i_mo%12;

      for (let idx=0; idx<31; idx++) {
        let cell = H.cell();
        cell.id = "ui_" + fmt_date(cur_year, cur_mo+1, idx+1);
        neatocal_hallon_populate_cell(cell, cur_year, cur_mo, idx, i_mo, day_parity, orientation);
        grid_body.appendChild(cell);
      }
    }
  } else {
    // Vertical: outer=days (rows), inner=months (columns)
    for (let idx=0; idx<31; idx++) {
      for (let i_mo = start_mo; i_mo < (start_mo+n_mo); i_mo++) {
        let cur_year = parseInt(year) + Math.floor(i_mo/12);
        let cur_mo = i_mo%12;

        let cell = H.cell();
        cell.id = "ui_" + fmt_date(cur_year, cur_mo+1, idx+1);
        neatocal_hallon_populate_cell(cell, cur_year, cur_mo, idx, i_mo, day_parity, orientation);
        grid_body.appendChild(cell);
      }
    }
  }

}

function neatocal_default_populate_cell(cell, cur_year, cur_mo, idx) {
  let nday_in_mo = new Date(cur_year, cur_mo + 1, 0).getDate();

  if ((typeof NEATOCAL_PARAM.cell_height !== "undefined") &&
      (NEATOCAL_PARAM.cell_height != null) &&
      (NEATOCAL_PARAM.cell_height != "")) {
    cell.style.height = NEATOCAL_PARAM.cell_height;
  }

  if (idx < nday_in_mo) {
    let dt = new Date(cur_year, cur_mo, idx + 1);
    let d = NEATOCAL_PARAM.weekday_code[dt.getDay()];

    if (NEATOCAL_PARAM.weekend_days.includes(dt.getDay())) {
      cell.classList.add("weekend");
    }

    let span_date = H.span((idx + 1).toString(), "date");
    let span_day = H.span(d, "day");

    date_styles(span_date);

    if ((dt.getDay() == 0) || (dt.getDay() == 6)) {
      weekend_styles(span_day);
      weekend_date_styles(span_date);
    } else {
      weekday_styles(span_day);
    }

    cell.appendChild(span_date);
    cell.appendChild(span_day);

    if ((dt.getDay() == 1) && NEATOCAL_PARAM.show_week_numbers) {
      let span_week_no = H.span(getISOWeekNumber(dt), "date");
      span_week_no.style.float = "right";
      span_week_no.style.color = "rgb(230,37,7)";
      week_styles(span_week_no);
      cell.appendChild(span_week_no);
    }

    let yyyy_mm_dd = fmt_date(cur_year, cur_mo + 1, idx + 1);
    render_cell_data(cell, yyyy_mm_dd);
    renderMoonPhase(cell, cur_year, cur_mo, idx + 1);
  }
}

function neatocal_default() {
  let year      = NEATOCAL_PARAM.year;
  let start_mo  = NEATOCAL_PARAM.start_month;
  let n_mo      = NEATOCAL_PARAM.n_month;
  let orientation = NEATOCAL_PARAM.orientation || "vertical";

  let ui_month_headers = document.getElementById("ui_month_headers");
  ui_month_headers.innerHTML = "";
  for (let i_mo = start_mo; i_mo < (start_mo+n_mo); i_mo++) {
    let hdr = H.header( NEATOCAL_PARAM.month_code[ i_mo%12 ] );
    month_styles(hdr);
    ui_month_headers.appendChild( hdr );
  }

  let grid_body = document.getElementById("ui_grid_body");

  if (orientation === "horizontal") {
    // Horizontal: outer=months (rows), inner=days (columns)
    for (let i_mo = start_mo; i_mo < (start_mo+n_mo); i_mo++) {
      let cur_year = parseInt(year) + Math.floor(i_mo/12);
      let cur_mo = i_mo%12;

      for (let idx=0; idx<31; idx++) {
        let cell = H.cell();
        cell.id = "ui_" + fmt_date(cur_year, cur_mo+1, idx+1);
        neatocal_default_populate_cell(cell, cur_year, cur_mo, idx);
        grid_body.appendChild(cell);
      }
    }
  } else {
    // Vertical: outer=days (rows), inner=months (columns)
    for (let idx=0; idx<31; idx++) {
      for (let i_mo = start_mo; i_mo < (start_mo+n_mo); i_mo++) {
        let cur_year = parseInt(year) + Math.floor(i_mo/12);
        let cur_mo = i_mo%12;

        let cell = H.cell();
        cell.id = "ui_" + fmt_date(cur_year, cur_mo+1, idx+1);
        neatocal_default_populate_cell(cell, cur_year, cur_mo, idx);
        grid_body.appendChild(cell);
      }
    }
  }

}

function fmt_date(y,m,d) {
  let res = y.toString() + "-";
  if (m<10) {
    res += "0";
  }
  res += m.toString() + "-";
  if (d < 10) {
    res += "0";
  }
  res += d.toString();
  return res;
}

function getISOWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

  // Set to nearest Thursday: current date + 4 - current day number (Mon=1, Sun=7)
  //

  // Convert Sunday from 0 to 7
  //
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);

  // Get first day of year
  //
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

  // Calculate full weeks from year start to nearest Thursday
  //
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function neatocal_aligned_populate_cell(cell, cur_year, cur_mo, day_idx) {
  let nday_in_mo = new Date(cur_year, cur_mo+1, 0).getDate();

  if ((typeof NEATOCAL_PARAM.cell_height !== "undefined") &&
      (NEATOCAL_PARAM.cell_height != null) &&
      (NEATOCAL_PARAM.cell_height != "")) {
    cell.style.height = NEATOCAL_PARAM.cell_height;
  }

  if ((day_idx >= 0) && (day_idx < nday_in_mo)) {
    let dt = new Date(cur_year, cur_mo, day_idx+1);
    let wd_code = NEATOCAL_PARAM.weekday_code[ dt.getDay() ];

    if (NEATOCAL_PARAM.weekend_days.includes(dt.getDay())) {
      cell.classList.add("weekend");
    }

    let span_date = H.span((day_idx+1).toString(), "date");
    let span_day = H.span(wd_code, "day");

    date_styles(span_date);

    if ((dt.getDay() == 0) || (dt.getDay() == 6)) {
      weekend_styles(span_day);
      weekend_date_styles(span_date);
    } else {
      weekday_styles(span_day);
    }

    cell.appendChild( span_date );
    cell.appendChild( span_day );

    if ((dt.getDay() == 1) && NEATOCAL_PARAM.show_week_numbers) {
      let span_week_no = H.span(getISOWeekNumber(dt), "date");
      span_week_no.style.float = "right";
      span_week_no.style.color = "rgb(230,37,7)";
      week_styles(span_week_no);
      cell.appendChild(span_week_no);
    }

    let yyyy_mm_dd = fmt_date(cur_year, cur_mo+1, day_idx+1);
    render_cell_data(cell, yyyy_mm_dd);
    renderMoonPhase(cell, cur_year, cur_mo, day_idx+1);

    return true; // cell has content
  }

  return false; // cell is empty
}

function neatocal_aligned_weekdays() {
  let year      = parseInt(NEATOCAL_PARAM.year);
  let start_mo  = parseInt(NEATOCAL_PARAM.start_month);
  let n_mo      = parseInt(NEATOCAL_PARAM.n_month);
  let orientation = NEATOCAL_PARAM.orientation || "vertical";

  let ui_month_headers = document.getElementById("ui_month_headers");
  ui_month_headers.innerHTML = "";
  for (let i_mo = start_mo; i_mo < (start_mo+n_mo); i_mo++) {
    let hdr = H.header( NEATOCAL_PARAM.month_code[ i_mo%12 ] );
    month_styles(hdr);
    ui_month_headers.appendChild( hdr );
  }

  // Precompute day-of-week offset for each month
  //
  let start_day = NEATOCAL_PARAM.start_day;
  let day_in_mo_start = [];
  for (let i=0; i<n_mo; i++) { day_in_mo_start.push(0); }
  for (let i_mo = start_mo; i_mo < (start_mo+n_mo); i_mo++) {
    let cur_year = parseInt(year) + Math.floor(i_mo/12);
    let cur_mo = i_mo%12;
    let s = new Date(cur_year, cur_mo, 1).getDay();
    day_in_mo_start[i_mo - start_mo] = s;
  }

  let grid_body = document.getElementById("ui_grid_body");

  if (orientation === "horizontal") {
    // Horizontal: outer=months (rows), inner=week-slots (columns)
    // First, determine which columns (0-41) have content in any month
    let col_has_content = [];
    for (let idx = 0; idx < 42; idx++) {
      let has = false;
      for (let i_mo = start_mo; i_mo < (start_mo+n_mo); i_mo++) {
        let cur_year = parseInt(year) + Math.floor(i_mo/12);
        let cur_mo = i_mo%12;
        let nday_in_mo = new Date(cur_year,cur_mo+1,0).getDate();
        let day_idx = idx - ((day_in_mo_start[i_mo - start_mo] - start_day + 7)%7);
        if (day_idx >= 0 && day_idx < nday_in_mo) { has = true; break; }
      }
      col_has_content.push(has);
    }

    // Count active columns for --n-days
    let active_cols = 0;
    for (let idx = 0; idx < 42; idx++) {
      if (col_has_content[idx]) active_cols++;
    }
    grid_body.style.setProperty('--n-days', active_cols);

    for (let i_mo = start_mo; i_mo < (start_mo+n_mo); i_mo++) {
      let cur_year = parseInt(year) + Math.floor(i_mo/12);
      let cur_mo = i_mo%12;

      for (let idx = 0; idx < 42; idx++) {
        if (!col_has_content[idx]) continue;

        let day_idx = idx - ((day_in_mo_start[i_mo - start_mo] - start_day + 7)%7);
        let cell = H.cell();
        cell.id = "ui_" + fmt_date(cur_year, cur_mo+1, day_idx+1);
        neatocal_aligned_populate_cell(cell, cur_year, cur_mo, day_idx);
        grid_body.appendChild(cell);
      }
    }
  } else {
    // Vertical: outer=week-slots (rows), inner=months (columns)
    for (let idx=0; idx<42; idx++) {
      let row_cells = [];
      let row_has_content = false;

      for (let i_mo = start_mo; i_mo < (start_mo+n_mo); i_mo++) {
        let cur_year = parseInt(year) + Math.floor(i_mo/12);
        let cur_mo = i_mo%12;
        let day_idx = idx - ((day_in_mo_start[i_mo - start_mo] - start_day + 7)%7);

        let cell = H.cell();
        cell.id = "ui_" + fmt_date(cur_year, cur_mo+1, day_idx+1);
        let has_content = neatocal_aligned_populate_cell(cell, cur_year, cur_mo, day_idx);
        if (has_content) row_has_content = true;
        row_cells.push(cell);
      }

      if (row_has_content) {
        for (let c = 0; c < row_cells.length; c++) {
          grid_body.appendChild(row_cells[c]);
        }
      }
    }
  }

}

function neatocal_post_process() {
  let highlight_color = NEATOCAL_PARAM.highlight_color;
  let x = document.getElementsByClassName("weekend");
  for (let i = 0; i < x.length; i++) {
    x[i].style.background = highlight_color;
  }

  // Mark and highlight today's date
  let today = new Date();
  let today_str = fmt_date(today.getFullYear(), today.getMonth() + 1, today.getDate());
  let today_ele = document.getElementById("ui_" + today_str);
  if (today_ele) {
    today_ele.classList.add("today");
    if (NEATOCAL_PARAM.today_highlight_color) {
      today_ele.style.background = NEATOCAL_PARAM.today_highlight_color;
    }
  }

  if ("color_cell" in NEATOCAL_PARAM) {
    let color_cell = NEATOCAL_PARAM.color_cell;

    for (let i=0; i < color_cell.length; i++) {
      let ele = document.getElementById("ui_" + color_cell[i].date);
      if ((typeof ele === "undefined") || (ele == null)) { continue; }
      ele.style.background = color_cell[i].color;
    }
  }

  if (NEATOCAL_PARAM.firefox_hack) {

    if ((typeof navigator !== "undefined") &&
        (typeof navigator.userAgent !== "undefined") &&
        (navigator.userAgent.search( /^Mozilla/ ) == 0) &&
        (typeof screen !== "undefined") &&
        (screen.width < 768) ) {

      let ui_month_headers = document.getElementById("ui_month_headers");
      if (NEATOCAL_PARAM.cell_height) {
        ui_month_headers.style.height = NEATOCAL_PARAM.cell_height;
      }
    }
  }

}

function loadXHR(url, _cb, _errcb) {
  let xhr = new XMLHttpRequest();

  if (typeof _errcb !== "undefined") {
    xhr.addEventListener("error", _errcb);
  }

  xhr.addEventListener("loadend", _cb);
  xhr.open("GET", url);
  xhr.send();
  return xhr;
}

function neatocal_parse_data_error(raw) {
  console.log("error:", raw);
}

function neatocal_override_param(param, data) {

  let admissible_param = [
    "help",

    "year",
    "layout",
    "orientation",

    "start_day",
    "start_month",
    "n_month",

    "weekday_code",
    "weekday_format",
    "month_code",
    "month_format",

    "weekend_days",

    "language",

    "show_moon_phase",
    "moon_phase_style",
    "moon_phase_position",
    "moon_phase_display",

    "show_week_numbers",

    "font_family",

    "cell_height",
    "highlight_color",
    "today_highlight_color",

    "year_font_size",
    "year_font_weight",
    "year_foreground_color",
    "year_background_color",

    "month_font_size",
    "month_font_weight",
    "month_foreground_color",
    "month_background_color",

    "weekday_font_size",
    "weekday_font_weight",
    "weekday_foreground_color",
    "weekday_background_color",

    "weekend_font_size",
    "weekend_font_weight",
    "weekend_foreground_color",
    "weekend_background_color",

    "week_font_size",
    "week_font_weight",
    "week_foreground_color",
    "week_background_color",

    "date_font_size",
    "date_font_weight",
    "date_foreground_color",
    "date_background_color",

    "weekend_date_font_size",
    "weekend_date_font_weight",
    "weekend_date_foreground_color",
    "weekend_date_background_color"

  ];

  for (let idx = 0; idx < admissible_param.length; idx++) {
    let key = admissible_param[idx];

    if (key in data) {
      param[key] = data[key];
    }
  }

  if ("color_cell" in data) {
    param.color_cell = data.color_cell;
  }

  return param;
}

function neatocal_parse_data(raw) {

  if (raw.type == "loadend") {

    if ((raw.target.readyState == 4) &&
        (raw.target.status == 200)) {

      try {
        let json_data = JSON.parse(raw.target.response);
        data_set_base(json_data);

        if (typeof NEATOCAL_PARAM.data.param !== "undefined") {
          neatocal_override_param(NEATOCAL_PARAM, NEATOCAL_PARAM.data.param);
        }
      }
      catch (e) {
        console.log("error parsing data file:", e);
      }

      neatocal_render();

    }

    // default to render
    //
    if ((raw.target.readyState == 4) &&
        (raw.target.status == 404)) {
      neatocal_render();
    }

  }

}

function ics_unfold_lines(raw) {
  let lines = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  let out = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if ((line.startsWith(" ") || line.startsWith("\t")) && out.length > 0) {
      out[out.length - 1] += line.slice(1);
    } else {
      out.push(line);
    }
  }

  return out;
}

function ics_parse_datetime(value, params) {
  let is_all_day = false;
  let is_utc = false;

  if (params && params.indexOf("VALUE=DATE") >= 0) {
    is_all_day = true;
  }

  let match_date = value.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (match_date) {
    is_all_day = true;
    return {
      date: new Date(parseInt(match_date[1]), parseInt(match_date[2]) - 1, parseInt(match_date[3])),
      all_day: true
    };
  }

  let match_dt = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/);
  if (!match_dt) {
    return null;
  }

  if (match_dt[7] === "Z") {
    is_utc = true;
  }

  let year = parseInt(match_dt[1]);
  let month = parseInt(match_dt[2]) - 1;
  let day = parseInt(match_dt[3]);
  let hour = parseInt(match_dt[4]);
  let minute = parseInt(match_dt[5]);
  let second = match_dt[6] ? parseInt(match_dt[6]) : 0;

  let date = is_utc
    ? new Date(Date.UTC(year, month, day, hour, minute, second))
    : new Date(year, month, day, hour, minute, second);

  return { date: date, all_day: is_all_day };
}

function ics_parse_events(raw) {
  let lines = ics_unfold_lines(raw);
  let events = [];
  let current = null;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    if (line === "BEGIN:VEVENT") {
      current = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (current) { events.push(current); }
      current = null;
      continue;
    }
    if (!current) { continue; }

    let idx = line.indexOf(":");
    if (idx < 0) { continue; }

    let name_params = line.slice(0, idx);
    let value = line.slice(idx + 1);

    let parts = name_params.split(";");
    let name = parts[0];
    let params = parts.slice(1).join(";");

    if (name === "SUMMARY") {
      current.summary = value;
    } else if (name === "DTSTART") {
      current.dtstart = { value: value, params: params };
    } else if (name === "DTEND") {
      current.dtend = { value: value, params: params };
    } else if (name === "RRULE") {
      current.rrule = value;
    } else if (name === "DURATION") {
      current.duration = value;
    }
  }

  return events;
}

function ics_color_for_index(idx) {
  return ICS_PALETTE[idx % ICS_PALETTE.length].bg;
}

function ics_text_color_for_index(idx) {
  return ICS_PALETTE[idx % ICS_PALETTE.length].fg;
}

function ics_expand_event(event, color, text_color, source_id, view_start, view_end) {
  if (!event.dtstart) { return; }

  let start_parsed = ics_parse_datetime(event.dtstart.value, event.dtstart.params);
  if (!start_parsed) { return; }

  let end_parsed = null;
  if (event.dtend) {
    end_parsed = ics_parse_datetime(event.dtend.value, event.dtend.params);
  }

  let start_date = start_parsed.date;
  let end_date = end_parsed ? end_parsed.date : new Date(start_date.getTime());
  let all_day = start_parsed.all_day || (end_parsed && end_parsed.all_day);

  if (!end_parsed) {
    if (all_day) {
      end_date = new Date(start_date.getTime() + 86400000);
    }
  }

  let start_day = new Date(start_date.getFullYear(), start_date.getMonth(), start_date.getDate());
  let end_day = new Date(end_date.getFullYear(), end_date.getMonth(), end_date.getDate());

  if (all_day ||
      (end_date.getHours() === 0 && end_date.getMinutes() === 0 && end_date.getSeconds() === 0)) {
    end_day = new Date(end_day.getTime() - 86400000);
  }

  let view_start_day = new Date(view_start.getFullYear(), view_start.getMonth(), view_start.getDate());
  let view_end_last = new Date(view_end.getTime() - 86400000);

  let cur = new Date(start_day.getTime());
  while (cur <= end_day) {
    if (cur >= view_start && cur < view_end) {
      let date_id = fmt_date(cur.getFullYear(), cur.getMonth() + 1, cur.getDate());
      let is_start = (cur.getTime() === start_day.getTime()) ||
        (cur.getTime() === view_start_day.getTime() && start_day < view_start_day);
      let is_end = (cur.getTime() === end_day.getTime()) ||
        (cur.getTime() === view_end_last.getTime() && end_day > view_end_last);

      add_event_to_date(date_id, {
        title: event.summary || "(no title)",
        color: color,
        text_color: text_color,
        source_id: source_id,
        span: {
          start: is_start,
          end: is_end
        }
      });
    }
    cur.setDate(cur.getDate() + 1);
  }
}

function ics_import_text(raw, color, text_color, source_id) {
  let events = ics_parse_events(raw);
  let view = get_view_range();

  for (let i = 0; i < events.length; i++) {
    if (events[i].rrule) {
      continue;
    }
    ics_expand_event(events[i], color, text_color, source_id, view.start, view.end);
  }
}

function ics_reset_data() {
  if (NEATOCAL_PARAM.data && NEATOCAL_PARAM.data.__base) {
    data_set_base(NEATOCAL_PARAM.data.__base);
  } else {
    data_set_base({});
  }
}

function ics_update_style(source_id, color, text_color) {
  for (let i = 0; i < NEATOCAL_PARAM.ics_imports.length; i++) {
    if (NEATOCAL_PARAM.ics_imports[i].id === source_id) {
      NEATOCAL_PARAM.ics_imports[i].color = color;
      NEATOCAL_PARAM.ics_imports[i].text_color = text_color;
      break;
    }
  }

  let keys = Object.keys(NEATOCAL_PARAM.data);
  for (let k = 0; k < keys.length; k++) {
    let val = NEATOCAL_PARAM.data[keys[k]];
    if (!Array.isArray(val)) { continue; }
    for (let i = 0; i < val.length; i++) {
      if (val[i] && val[i].source_id === source_id) {
        val[i].color = color;
        val[i].text_color = text_color;
      }
    }
  }

  render_ics_legend();
  neatocal_render();
}

function ics_handle_files(file_list) {
  let files = Array.from(file_list).filter(f => f.name.toLowerCase().endsWith(".ics"));
  if (files.length === 0) { return; }

  let reads = files.map((file, idx) => {
    return new Promise((resolve) => {
      let reader = new FileReader();
      reader.onload = function() {
        resolve({ text: reader.result, idx: idx });
      };
      reader.readAsText(file);
    });
  });

  Promise.all(reads).then((results) => {
    for (let i = 0; i < results.length; i++) {
      let import_id = NEATOCAL_PARAM.ics_import_count + results[i].idx;
      let color = ics_color_for_index(import_id);
      let text_color = ics_text_color_for_index(import_id);
      let file = files[results[i].idx];
      let label = file ? file.name.replace(/\.ics$/i, "") : ("Calendar " + (import_id + 1).toString());

      NEATOCAL_PARAM.ics_imports.push({
        id: import_id,
        name: label,
        color: color,
        text_color: text_color
      });

      ics_import_text(results[i].text, color, text_color, import_id);
    }
    NEATOCAL_PARAM.ics_import_count += results.length;
    render_ics_legend();
    neatocal_render();
  });
}

function render_ics_legend() {
  let legend = document.getElementById("ics_legend");
  if (!legend) { return; }

  legend.innerHTML = "";
  if (NEATOCAL_PARAM.ics_imports.length === 0) { return; }

  for (let i = 0; i < NEATOCAL_PARAM.ics_imports.length; i++) {
    let item = NEATOCAL_PARAM.ics_imports[i];

    let row = H.div();
    row.classList.add("ics-legend-row");

    let swatch = H.span();
    swatch.classList.add("ics-legend-swatch");
    swatch.style.background = item.color;
    if (item.text_color) {
      swatch.style.borderColor = item.text_color;
    }
    swatch.dataset.id = item.id.toString();

    swatch.addEventListener("click", function(e) {
      e.stopPropagation();
      let id = parseInt(e.target.dataset.id, 10);
      if (isNaN(id)) { return; }

      let palette = H.div();
      palette.classList.add("ics-legend-palette");

      for (let p = 0; p < ICS_PALETTE.length; p++) {
        let opt = H.span();
        opt.classList.add("ics-legend-palette-item");
        opt.style.background = ICS_PALETTE[p].bg;
        opt.style.color = ICS_PALETTE[p].fg;
        opt.dataset.id = id.toString();
        opt.dataset.bg = ICS_PALETTE[p].bg;
        opt.dataset.fg = ICS_PALETTE[p].fg;
        opt.addEventListener("click", function(ev) {
          ev.stopPropagation();
          let _id = parseInt(ev.target.dataset.id, 10);
          if (isNaN(_id)) { return; }
          ics_update_style(_id, ev.target.dataset.bg, ev.target.dataset.fg);
        });
        palette.appendChild(opt);
      }

      palette.addEventListener("click", function(ev) {
        ev.stopPropagation();
      });

      function close_palette() {
        window.removeEventListener("click", close_palette);
        render_ics_legend();
      }

      window.addEventListener("click", close_palette);
      swatch.replaceWith(palette);
    });

    let name = H.span();
    name.classList.add("ics-legend-name");
    name.textContent = item.name;
    name.dataset.idx = i.toString();

    name.addEventListener("click", function(e) {
      let idx = parseInt(e.target.dataset.idx, 10);
      if (isNaN(idx)) { return; }

      let input = document.createElement("input");
      input.type = "text";
      input.value = NEATOCAL_PARAM.ics_imports[idx].name;
      input.classList.add("ics-legend-input");

      function commit() {
        let val = input.value.trim();
        if (val) {
          NEATOCAL_PARAM.ics_imports[idx].name = val;
        }
        render_ics_legend();
      }

      input.addEventListener("blur", commit);
      input.addEventListener("keydown", function(ev) {
        if (ev.key === "Enter") { commit(); }
        if (ev.key === "Escape") { render_ics_legend(); }
      });

      name.replaceWith(input);
      input.focus();
      input.select();
    });

    row.appendChild(swatch);
    row.appendChild(name);
    legend.appendChild(row);
  }
}
function neatocal_setup_ics_drop() {
  let overlay = document.getElementById("ics_drop_overlay");
  let input = document.getElementById("ics_file_input");

  if (!overlay || !input) { return; }

  let drag_counter = 0;

  function show() {
    overlay.classList.add("visible");
  }

  function hide() {
    overlay.classList.remove("visible");
  }

  window.addEventListener("dragenter", function(e) {
    e.preventDefault();
    drag_counter += 1;
    show();
  });

  window.addEventListener("dragover", function(e) {
    e.preventDefault();
  });

  window.addEventListener("dragleave", function(e) {
    e.preventDefault();
    drag_counter -= 1;
    if (drag_counter <= 0) {
      drag_counter = 0;
      hide();
    }
  });

  window.addEventListener("drop", function(e) {
    e.preventDefault();
    drag_counter = 0;
    hide();
    if (e.dataTransfer && e.dataTransfer.files) {
      ics_handle_files(e.dataTransfer.files);
    }
  });

  overlay.addEventListener("click", function() {
    input.click();
  });

  input.addEventListener("change", function() {
    if (input.files) {
      ics_handle_files(input.files);
      input.value = "";

      hide();
    }
  });

  if (NEATOCAL_PARAM.ics) {
    show();
  }
}

function neatocal_init() {
  let sp = new URLSearchParams(window.location.search);

  // peel off parameters from URL
  //

  let help_param = sp.get("help");
  let year_param = sp.get("year");
  let layout_param = sp.get("layout");
  let orientation_param = sp.get("orientation");
  let start_month_param = sp.get("start_month");
  let n_month_param = sp.get("n_month");
  let start_day_param = sp.get("start_day");
  let highlight_color_param = sp.get("highlight_color");
  let today_highlight_color_param = sp.get("today_highlight_color");
  let cell_height_param = sp.get("cell_height");
  let weekday_code_param = sp.get("weekday_code");
  let weekday_format_param = sp.get("weekday_format");
  let month_code_param = sp.get("month_code");
  let month_format_param = sp.get("month_format");
  let language_param = sp.get("language");
  let show_week_numbers_param = sp.get("show_week_numbers");
  let font_family_param = sp.get("font_family");
  let ics_param = sp.get("ics");

  let weekend_days_param = sp.get("weekend_days");

  // Moon phase parameters
  //
  let show_moon_phase_param = sp.get("show_moon_phase");
  let moon_phase_style_param = sp.get("moon_phase_style");
  let moon_phase_position_param = sp.get("moon_phase_position");
  let moon_phase_display_param = sp.get("moon_phase_display");

  // fiddly stylings
  //
  let _ele_pfx = [ "year", "month", "weekday", "weekend", "week", "date", "weekend_date" ];
  let _ele_sfx = [ "font_size", "font_weight", "foreground_color", "background_color" ];
  for (let i_p=0; i_p<_ele_pfx.length; i_p++) {
    for (let i_s=0; i_s<_ele_sfx.length; i_s++) {
      let _ele_name = _ele_pfx[i_p] + "_" + _ele_sfx[i_s];
      let _ele_param = sp.get(_ele_name);

      if ((_ele_param != null) &&
          (typeof _ele_param !== "undefined")) {
        NEATOCAL_PARAM[_ele_name] = _ele_param;
      }

    }
  }

  // JSON data file
  //
  let datafn_param = sp.get("data");

  //---

  let data_fn = "";
  if ((datafn_param != null) &&
      (typeof datafn_param !== "undefined")) {
    data_fn = datafn_param;
  }
  NEATOCAL_PARAM.data_fn = data_fn;

  //---

  if ((help_param != null) &&
      (typeof help_param !== "undefined")) {
    let ui_info = document.getElementById("ui_info");
    ui_info.style.display = '';
  }

  //---

  let year = new Date().getFullYear();
  if ((year_param != null) &&
      (typeof year_param !== "undefined")) {
    year = year_param;
  }
  NEATOCAL_PARAM.year = year;

  //---

  let layout = NEATOCAL_PARAM.layout;
  if ((layout_param != null) &&
      (typeof layout_param !== "undefined")) {
    _l = sp.get("layout");
    if      (_l == "default")           { layout = "default"; }
    else if (_l == "aligned-weekdays")  { layout = "aligned-weekdays"; }
    else if (_l == "hallon-almanackan") {
      layout = "hallon-almanackan";
      NEATOCAL_PARAM.show_week_numbers = true;
      NEATOCAL_PARAM.weekend_days = [0];
    }
  }
  NEATOCAL_PARAM.layout = layout;

  //---

  if ((orientation_param != null) &&
      (typeof orientation_param !== "undefined")) {
    if (orientation_param === "horizontal" || orientation_param === "vertical") {
      NEATOCAL_PARAM.orientation = orientation_param;
    }
  }

  //---

  let start_month = NEATOCAL_PARAM.start_month;
  if ((start_month_param != null) &&
      (typeof start_month_param !== "undefined")) {
    start_month = parseInt(start_month_param);
    if (isNaN(start_month)) {
      start_month = 0;
    }
  }
  NEATOCAL_PARAM.start_month = start_month;

  //---

  let n_month = NEATOCAL_PARAM.n_month;
  if ((n_month_param != null) &&
      (typeof n_month_param !== "undefined")) {
    n_month = parseInt(n_month_param);
    if (isNaN(n_month)) {
      n_month = 0;
    }
  }
  NEATOCAL_PARAM.n_month = n_month;

  //---

  let start_day = NEATOCAL_PARAM.start_day;
  if ((start_day_param != null) &&
      (typeof start_day_param !== "undefined")) {
    start_day = parseInt(start_day_param);
    if (isNaN(start_day)) {
      start_day = 0;
    }
  }
  NEATOCAL_PARAM.start_day = start_day;

  //---

  let highlight_color = NEATOCAL_PARAM.highlight_color;
  if ((highlight_color_param != null) &&
      (typeof highlight_color_param !== "undefined")) {
    highlight_color = highlight_color_param;
    if (highlight_color.match( /^[\da-fA-F]+/ )) {
      highlight_color = "#" + highlight_color;
    }
  }
  NEATOCAL_PARAM.highlight_color = highlight_color;

  //---

  let today_highlight_color = NEATOCAL_PARAM.today_highlight_color;
  if ((today_highlight_color_param != null) &&
      (typeof today_highlight_color_param !== "undefined")) {
    today_highlight_color = today_highlight_color_param;
    if (today_highlight_color.match( /^[\da-fA-F]+/ )) {
      today_highlight_color = "#" + today_highlight_color;
    }
  }
  NEATOCAL_PARAM.today_highlight_color = today_highlight_color;

  //---

  let cell_height = NEATOCAL_PARAM.cell_height;
  if ((cell_height_param != null) &&
      (typeof cell_height_param !== "undefined")) {
    cell_height = cell_height_param;
  }
  NEATOCAL_PARAM.cell_height = cell_height;

  //---

  if (new Set(["long", "short", "narrow"]).has(weekday_format_param)) {
    NEATOCAL_PARAM.weekday_format = weekday_format_param;
  }

  //---

  if (new Set(["numeric", "2-digit", "long", "short", "narrow"]).has(month_format_param)) {
    NEATOCAL_PARAM.month_format = month_format_param;
  }

  //---

  // language fills out the month/day codes and happens
  // before so it can be overriden by month day code
  // specification.
  //
  if ((language_param != null) &&
      (typeof language_param !== "undefined")) {

    for (let day_idx=0; day_idx<7; day_idx++) {
      NEATOCAL_PARAM.weekday_code[day_idx] = localized_day(language_param, day_idx);
    }

    for (let mo_idx=0; mo_idx<12; mo_idx++) {
      NEATOCAL_PARAM.month_code[mo_idx] = localized_month(language_param, mo_idx);
    }
  }

  //---

  let weekday_code = NEATOCAL_PARAM.weekday_code;
  if ((weekday_code_param != null) &&
      (typeof weekday_code_param !== "undefined")) {

    weekday_code = weekday_code_param.split(",");

    // padd out with blank
    //
    for (let i=weekday_code.length; i<7; i++) {
      weekday_code.push("");
    }

  }
  NEATOCAL_PARAM.weekday_code = weekday_code;

  //---

  let month_code = NEATOCAL_PARAM.month_code;
  if ((month_code_param != null) &&
      (typeof month_code_param !== "undefined")) {

    month_code = month_code_param.split(",");

    // padd out with blank
    //
    for (let i=month_code.length; i<7; i++) {
      month_code.push("");
    }

  }
  NEATOCAL_PARAM.month_code = month_code;

  //---

  // thanks to https://github.com/fawaz-alesayi/neatocal
  //
  if ((weekend_days_param != null) &&
      (typeof weekend_days_param !== "undefined")) {
    let days = weekend_days_param.split(",").map(d => parseInt(d.trim()));
    NEATOCAL_PARAM.weekend_days = days.filter(d => !isNaN(d) && d >= 0 && d <= 6);
  }

  // hallon-almanackan defaults to showing week numbers.
  // If the showing week numbers is specified, use user specified value,
  // whether true or false, otherwise, leave it alone.
  //
  if ((show_week_numbers_param != null) &&
      (typeof show_week_numbers_param !== "undefined")) {
    NEATOCAL_PARAM.show_week_numbers = (show_week_numbers_param === "true");
  }

  if (font_family_param != null) {
    NEATOCAL_PARAM.font_family = font_family_param;
  }

  if ((ics_param != null) &&
      (typeof ics_param !== "undefined")) {
    NEATOCAL_PARAM.ics = !(ics_param === "false" || ics_param === "0");
  }

  neatocal_setup_ics_drop();

  //---

  // Moon phase parameters
  //
  let show_moon_phase = NEATOCAL_PARAM.show_moon_phase;
  if ((show_moon_phase_param != null) &&
      (typeof show_moon_phase_param !== "undefined")) {
    show_moon_phase = (show_moon_phase_param === "true" || show_moon_phase_param === "1");
  }
  NEATOCAL_PARAM.show_moon_phase = show_moon_phase;

  //---

  let moon_phase_style = NEATOCAL_PARAM.moon_phase_style;
  if ((moon_phase_style_param != null) &&
      (typeof moon_phase_style_param !== "undefined")) {
    if (moon_phase_style_param === "css" ||
        moon_phase_style_param === "symbol" ||
        moon_phase_style_param === "name") {
      moon_phase_style = moon_phase_style_param;
    }
  }
  NEATOCAL_PARAM.moon_phase_style = moon_phase_style;

  //---

  let moon_phase_position = NEATOCAL_PARAM.moon_phase_position;
  if ((moon_phase_position_param != null) &&
      (typeof moon_phase_position_param !== "undefined")) {
    if (moon_phase_position_param === "below" ||
        moon_phase_position_param === "inline") {
      moon_phase_position = moon_phase_position_param;
    }
  }
  NEATOCAL_PARAM.moon_phase_position = moon_phase_position;

  //---

  let moon_phase_display = NEATOCAL_PARAM.moon_phase_display;
  if ((moon_phase_display_param != null) &&
      (typeof moon_phase_display_param !== "undefined")) {
    if (moon_phase_display_param === "all" ||
        moon_phase_display_param === "changes") {
      moon_phase_display = moon_phase_display_param;
    }
  }
  NEATOCAL_PARAM.moon_phase_display = moon_phase_display;

  //---

  neatocal_setup_settings();

  // if we have a data file, short circuit to wait till load.
  // neatocal_parse_data will call neatocal_render to render the
  // calendar.
  //
  if (NEATOCAL_PARAM.data_fn) {
    loadXHR( NEATOCAL_PARAM.data_fn, neatocal_parse_data, neatocal_parse_data_error );
    return;
  }

  // no data file, just render
  //
  if (!NEATOCAL_PARAM.data || !NEATOCAL_PARAM.data.__base) {
    data_set_base({});
  }
  neatocal_render();
}

function neatocal_render() {
  document.documentElement.style.fontFamily = NEATOCAL_PARAM.font_family;

  let cur_start_month = NEATOCAL_PARAM.start_month;
  let month_remain = NEATOCAL_PARAM.n_month;
  let s_year = parseInt(NEATOCAL_PARAM.year);
  let e_year = parseInt(NEATOCAL_PARAM.year) + Math.floor((cur_start_month + month_remain-1)/12)

  let layout = NEATOCAL_PARAM.layout;

  let year_fraction_tot = 0;
  let year_fraction = [];
  for ( let y = s_year; y <= e_year; y++ ) {
    let del_mo = (((cur_start_month + month_remain) > 12) ? (12-cur_start_month) : (month_remain));
    year_fraction.push( del_mo );
    cur_start_month = 0;
    month_remain -= del_mo;

    year_fraction_tot += del_mo;
  }

  for (let i=0; i < year_fraction.length; i++) {
    year_fraction[i] /= year_fraction_tot;
  }

  // if we only have one year, put it in the center
  // otherwise find the proportion of other years
  //   and adjust the year header appropriately

  let ui_year = document.getElementById("ui_year");
  ui_year.innerHTML = "";

  for ( let y = s_year, idx = 0; y <= e_year; y++, idx++) {
    let span = H.span();
    span.innerHTML = y.toString();
    span.style["display"] = "inline-block";
    span.style["width"] = (100*year_fraction[idx]).toString() + "%";
    span.style["justify-content"] = "center";
    span.style["text-align"] = "center";
    span.style["margin"] = "0 0 .5em 0";

    year_styles(span);

    ui_year.appendChild( span );
  }

  //---
  let n_mo = NEATOCAL_PARAM.n_month;
  let orientation = NEATOCAL_PARAM.orientation || "vertical";
  let is_horizontal = (orientation === "horizontal");

  let grid_el = document.getElementById("ui_grid");
  let headers_el = document.getElementById("ui_month_headers");
  let ui_grid_body = document.getElementById("ui_grid_body");
  ui_grid_body.innerHTML = "";

  grid_el.classList.toggle("horizontal", is_horizontal);
  headers_el.classList.toggle("horizontal", is_horizontal);
  ui_grid_body.classList.toggle("horizontal", is_horizontal);

  ui_grid_body.style.setProperty('--n-months', n_mo);
  headers_el.style.setProperty('--n-months', n_mo);

  if (is_horizontal) {
    let n_days = (layout === "aligned-weekdays") ? 42 : 31;
    ui_grid_body.style.setProperty('--n-days', n_days);
  } else {
    ui_grid_body.style.removeProperty('--n-days');
  }

  if (layout == "aligned-weekdays") {
    neatocal_aligned_weekdays();
  }
  else if (layout == "hallon-almanackan") {
    neatocal_hallon_almanackan();
  }
  else {
    neatocal_default();
  }

  neatocal_post_process();
}

// =========================================================================
// Settings Panel
// =========================================================================

var SETTINGS_DEFAULTS = {
  "year": new Date().getFullYear(),
  "start_month": 0,
  "n_month": 12,
  "layout": "default",
  "orientation": "vertical",
  "start_day": 1,
  "language": "",
  "font_family": "",
  "cell_height": "",
  "show_week_numbers": false,
  "show_moon_phase": false,
  "moon_phase_style": "css",
  "moon_phase_position": "below",
  "moon_phase_display": "changes",
  "highlight_color": "#eeeeee",
  "today_highlight_color": "",
  "weekend_days": [0, 6]
};

var SETTINGS_CONFIG = [
  { key: "year", type: "number", label: "Year", group: "Calendar" },
  { key: "start_month", type: "select", label: "Start Month", group: "Calendar",
    options: [
      {v:0,t:"January"},{v:1,t:"February"},{v:2,t:"March"},{v:3,t:"April"},
      {v:4,t:"May"},{v:5,t:"June"},{v:6,t:"July"},{v:7,t:"August"},
      {v:8,t:"September"},{v:9,t:"October"},{v:10,t:"November"},{v:11,t:"December"}
    ]},
  { key: "n_month", type: "number", label: "Months", group: "Calendar", min: 1, max: 24 },
  { key: "layout", type: "select", label: "Layout", group: "Calendar",
    options: [
      {v:"default",t:"Default"},{v:"aligned-weekdays",t:"Aligned Weekdays"},{v:"hallon-almanackan",t:"Hallon Almanackan"}
    ]},
  { key: "orientation", type: "pill", label: "Orientation", group: "Calendar",
    options: [{v:"vertical",t:"Vertical"},{v:"horizontal",t:"Horizontal"}] },
  { key: "start_day", type: "select", label: "Start Day", group: "Calendar",
    options: [
      {v:0,t:"Sunday"},{v:1,t:"Monday"},{v:2,t:"Tuesday"},{v:3,t:"Wednesday"},
      {v:4,t:"Thursday"},{v:5,t:"Friday"},{v:6,t:"Saturday"}
    ],
    showWhen: { key: "layout", value: "aligned-weekdays" }
  },

  { key: "language", type: "text", label: "Language", group: "Display", placeholder: "e.g. en, ko-KR, de-DE" },
  { key: "font_family", type: "text", label: "Font", group: "Display", placeholder: "e.g. sans-serif" },
  { key: "cell_height", type: "text", label: "Cell Height", group: "Display", placeholder: "e.g. 2em" },
  { key: "show_week_numbers", type: "checkbox", label: "Week Numbers", group: "Display" },
  { key: "show_moon_phase", type: "checkbox", label: "Moon Phases", group: "Display" },

  { key: "moon_phase_style", type: "select", label: "Style", group: "Moon Phase",
    options: [{v:"css",t:"CSS (SVG)"},{v:"symbol",t:"Symbol"},{v:"name",t:"Name"}],
    showWhen: { key: "show_moon_phase", value: true }
  },
  { key: "moon_phase_position", type: "select", label: "Position", group: "Moon Phase",
    options: [{v:"below",t:"Below"},{v:"inline",t:"Inline"}],
    showWhen: { key: "show_moon_phase", value: true }
  },
  { key: "moon_phase_display", type: "select", label: "Show", group: "Moon Phase",
    options: [{v:"changes",t:"Phase Changes"},{v:"all",t:"Every Day"}],
    showWhen: { key: "show_moon_phase", value: true }
  },

  { key: "highlight_color", type: "color", label: "Weekend Color", group: "Colors" },
  { key: "today_highlight_color", type: "color", label: "Today Color", group: "Colors" },
  { key: "weekend_days", type: "weekend_days", label: "Weekend Days", group: "Colors" }
];

function settings_normalize_color(c) {
  if (!c || c === '') return '#ffffff';
  c = c.replace(/^#/, '');
  if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
  if (/^[\da-fA-F]{6}$/.test(c)) return '#' + c;
  return c;
}

function settings_color_to_param(hex6) {
  // strip # for URL param, shorten if possible
  let c = hex6.replace(/^#/, '');
  if (c[0]===c[1] && c[2]===c[3] && c[4]===c[5]) {
    c = c[0]+c[2]+c[4];
  }
  return c;
}

function settings_sync_url() {
  let sp = new URLSearchParams();

  for (let i = 0; i < SETTINGS_CONFIG.length; i++) {
    let cfg = SETTINGS_CONFIG[i];
    let k = cfg.key;
    let val = NEATOCAL_PARAM[k];
    let def = SETTINGS_DEFAULTS[k];

    if (k === "weekend_days") {
      let sorted_val = val.slice().sort().join(",");
      let sorted_def = def.slice().sort().join(",");
      if (sorted_val !== sorted_def) {
        sp.set(k, val.join(","));
      }
      continue;
    }

    if (k === "highlight_color" || k === "today_highlight_color") {
      let norm_val = settings_normalize_color(val);
      let norm_def = settings_normalize_color(def);
      if (norm_val !== norm_def) {
        sp.set(k, settings_color_to_param(norm_val));
      }
      continue;
    }

    if (typeof def === "boolean") {
      if (val !== def) sp.set(k, val.toString());
    } else if (typeof def === "number") {
      if (parseInt(val) !== def) sp.set(k, val.toString());
    } else {
      if (val !== def) sp.set(k, val.toString());
    }
  }

  let qs = sp.toString();
  let url = window.location.pathname + (qs ? '?' + qs : '');
  history.replaceState(null, '', url);
}

function settings_update_visibility() {
  for (let i = 0; i < SETTINGS_CONFIG.length; i++) {
    let cfg = SETTINGS_CONFIG[i];
    if (!cfg.showWhen) continue;
    let row = document.getElementById("settings_row_" + cfg.key);
    if (!row) continue;
    let cond_val = NEATOCAL_PARAM[cfg.showWhen.key];
    if (cond_val === cfg.showWhen.value) {
      row.classList.remove("hidden");
    } else {
      row.classList.add("hidden");
    }
  }
}

function settings_apply(key, value) {
  NEATOCAL_PARAM[key] = value;

  // Special: language changes regenerate weekday/month codes
  if (key === "language") {
    if (value && value.length > 0) {
      for (let i = 0; i < 7; i++) {
        NEATOCAL_PARAM.weekday_code[i] = localized_day(value, i);
      }
      for (let i = 0; i < 12; i++) {
        NEATOCAL_PARAM.month_code[i] = localized_month(value, i);
      }
    } else {
      NEATOCAL_PARAM.weekday_code = ["Su","M","T","W","R","F","Sa"];
      NEATOCAL_PARAM.month_code = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    }
  }

  // Special: hallon-almanackan forces some settings
  if (key === "layout" && value === "hallon-almanackan") {
    NEATOCAL_PARAM.show_week_numbers = true;
    NEATOCAL_PARAM.weekend_days = [0];
    let wn_input = document.getElementById("settings_input_show_week_numbers");
    if (wn_input) wn_input.checked = true;
    // Update weekend_days checkboxes
    let wd_container = document.getElementById("settings_wd_container");
    if (wd_container) {
      let cbs = wd_container.querySelectorAll('input[type="checkbox"]');
      for (let j = 0; j < cbs.length; j++) {
        cbs[j].checked = (parseInt(cbs[j].value) === 0);
      }
    }
  }

  settings_update_visibility();
  neatocal_render();
  settings_sync_url();
}

function neatocal_setup_settings() {
  let panel = document.getElementById("settings_panel");
  let fab = document.getElementById("settings_fab");
  let close_btn = document.getElementById("settings_close");
  let body = document.getElementById("settings_panel_body");

  // FAB toggle
  fab.addEventListener("click", function() {
    panel.classList.toggle("open");
  });
  close_btn.addEventListener("click", function() {
    panel.classList.remove("open");
  });

  // Build form
  let current_group = "";
  for (let i = 0; i < SETTINGS_CONFIG.length; i++) {
    let cfg = SETTINGS_CONFIG[i];

    // Section header
    if (cfg.group !== current_group) {
      current_group = cfg.group;
      let sec = document.createElement("div");
      sec.classList.add("settings-section");
      let title = document.createElement("div");
      title.classList.add("settings-section-title");
      title.textContent = current_group;
      sec.appendChild(title);
      body.appendChild(sec);
    }

    let row = document.createElement("div");
    row.classList.add("settings-row");
    row.id = "settings_row_" + cfg.key;

    let label = document.createElement("label");
    label.classList.add("settings-label");
    label.textContent = cfg.label;
    label.setAttribute("for", "settings_input_" + cfg.key);
    row.appendChild(label);

    if (cfg.type === "weekend_days") {
      // Special: multi-checkbox for days of week
      let container = document.createElement("div");
      container.classList.add("settings-checkboxes");
      container.id = "settings_wd_container";
      let day_names = ["Su","Mo","Tu","We","Th","Fr","Sa"];
      for (let d = 0; d < 7; d++) {
        let lbl = document.createElement("label");
        lbl.classList.add("settings-checkbox-label");
        let cb = document.createElement("input");
        cb.type = "checkbox";
        cb.value = d;
        cb.checked = NEATOCAL_PARAM.weekend_days.includes(d);
        cb.addEventListener("change", function() {
          let checked = container.querySelectorAll('input:checked');
          let days = [];
          for (let c = 0; c < checked.length; c++) {
            days.push(parseInt(checked[c].value));
          }
          settings_apply("weekend_days", days);
        });
        lbl.appendChild(cb);
        lbl.appendChild(document.createTextNode(day_names[d]));
        container.appendChild(lbl);
      }
      row.appendChild(container);

    } else if (cfg.type === "checkbox") {
      let input = document.createElement("input");
      input.type = "checkbox";
      input.id = "settings_input_" + cfg.key;
      input.classList.add("settings-input");
      input.checked = !!NEATOCAL_PARAM[cfg.key];
      input.addEventListener("change", function() {
        settings_apply(cfg.key, input.checked);
      });
      row.appendChild(input);

    } else if (cfg.type === "pill") {
      let group = document.createElement("div");
      group.classList.add("settings-pill-group");
      group.id = "settings_input_" + cfg.key;
      for (let o = 0; o < cfg.options.length; o++) {
        let btn = document.createElement("button");
        btn.type = "button";
        btn.classList.add("settings-pill");
        btn.textContent = cfg.options[o].t;
        btn.dataset.value = cfg.options[o].v;
        if (String(NEATOCAL_PARAM[cfg.key]) === String(cfg.options[o].v)) {
          btn.classList.add("active");
        }
        btn.addEventListener("click", function() {
          let siblings = group.querySelectorAll(".settings-pill");
          for (let s = 0; s < siblings.length; s++) {
            siblings[s].classList.remove("active");
          }
          btn.classList.add("active");
          settings_apply(cfg.key, btn.dataset.value);
        });
        group.appendChild(btn);
      }
      row.appendChild(group);

    } else if (cfg.type === "select") {
      let sel = document.createElement("select");
      sel.id = "settings_input_" + cfg.key;
      sel.classList.add("settings-input");
      for (let o = 0; o < cfg.options.length; o++) {
        let opt = document.createElement("option");
        opt.value = cfg.options[o].v;
        opt.textContent = cfg.options[o].t;
        sel.appendChild(opt);
      }
      sel.value = NEATOCAL_PARAM[cfg.key];
      sel.addEventListener("change", function() {
        let v = sel.value;
        // coerce numeric selects
        if (cfg.key === "start_month" || cfg.key === "start_day") {
          v = parseInt(v);
        }
        settings_apply(cfg.key, v);
      });
      row.appendChild(sel);

    } else if (cfg.type === "color") {
      let input = document.createElement("input");
      input.type = "color";
      input.id = "settings_input_" + cfg.key;
      input.classList.add("settings-input");
      input.value = settings_normalize_color(NEATOCAL_PARAM[cfg.key]);
      input.addEventListener("input", function() {
        settings_apply(cfg.key, input.value);
      });
      row.appendChild(input);

    } else if (cfg.type === "number") {
      let input = document.createElement("input");
      input.type = "number";
      input.id = "settings_input_" + cfg.key;
      input.classList.add("settings-input");
      input.value = NEATOCAL_PARAM[cfg.key];
      if (cfg.min !== undefined) input.min = cfg.min;
      if (cfg.max !== undefined) input.max = cfg.max;
      input.addEventListener("change", function() {
        let v = parseInt(input.value);
        if (!isNaN(v)) settings_apply(cfg.key, v);
      });
      row.appendChild(input);

    } else {
      // text input
      let input = document.createElement("input");
      input.type = "text";
      input.id = "settings_input_" + cfg.key;
      input.classList.add("settings-input");
      input.value = NEATOCAL_PARAM[cfg.key] || "";
      if (cfg.placeholder) input.placeholder = cfg.placeholder;
      input.addEventListener("change", function() {
        settings_apply(cfg.key, input.value);
      });
      row.appendChild(input);
    }

    // Conditional visibility
    if (cfg.showWhen) {
      let cond_val = NEATOCAL_PARAM[cfg.showWhen.key];
      if (cond_val !== cfg.showWhen.value) {
        row.classList.add("hidden");
      }
    }

    body.appendChild(row);
  }
}
