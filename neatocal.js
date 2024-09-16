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
  "_data": {
    "2024-03-21" : "The quick brown fox jumps over the lazy yellow dog",
    "2024-01-30" : "Sphynx of black quartz, hear my vow",
    "2024-06-01" : "Thule Worm-God of the Lords",
    "2024-08-11" : "Swarms Matriarch",
    "2024-10-20" :  "Higher Dimension Being"
  },

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

  // year to start
  //
  //   default this year
  //
  "year": new Date().getFullYear(),

  // Text to use for displaying weekdays
  //
  "weekday_code" : [ "Su", "M", "T", "W", "R", "F", "Sa"  ],

  // text to sue for month header
  //
  "month_code": [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],

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
  "highlight_color": '#eee'

};

// simple HTML convenience functions
//
var H = {
  "text": function(txt) { return document.createTextNode(txt); },
  "div": function() { return document.createElement("div"); },
  "tr": function() { return document.createElement("tr"); },
  "th": function(v) {
    let th = document.createElement("th");
    if (typeof v !== "undefined") { th.innerHTML = v; }
    return th;
  },
  "td": function() { return document.createElement("td"); },
  "span": function(v,_class) {
    let s = document.createElement("span");
    if (typeof v !== "undefined") { s.innerHTML = v; }
    if (typeof _class !== "undefined") { s.classList.add(_class); }
    return s;
  }
};

function neatocal_default() {
  let year      = NEATOCAL_PARAM.year;
  let start_mo  = NEATOCAL_PARAM.start_month;
  let n_mo      = NEATOCAL_PARAM.n_month;

  let ui_tr_mo = document.getElementById("ui_tr_month_name");
  ui_tr_mo.innerHTML = "";
  for (let i_mo = start_mo; i_mo < (start_mo+n_mo); i_mo++) {
    ui_tr_mo.appendChild( H.th( NEATOCAL_PARAM.month_code[ i_mo%12 ] ) );
  }

  let tbody = document.getElementById("ui_tbody");
  for (let idx=0; idx<31; idx++) {

    let tr = H.tr();
    if ((typeof NEATOCAL_PARAM.cell_height !== "undefined") &&
        (NEATOCAL_PARAM.cell_height != null) &&
        (NEATOCAL_PARAM.cell_height != "")) {
      tr.style.height = NEATOCAL_PARAM.cell_height;
    }


    let cur_year = year;
    for (let i_mo = start_mo; i_mo < (start_mo+n_mo); i_mo++) {
      
      //if (i_mo >= 12) { cur_year = parseInt(year)+1; }
      cur_year = parseInt(year) + Math.floor(i_mo/12);

      let cur_mo = i_mo%12;

      let nday_in_mo = new Date(cur_year,cur_mo+1,0).getDate();

      let td = H.td();
      td.style.width = (100/n_mo).toString() + "%";

      if (idx < nday_in_mo) {

        let dt = new Date(cur_year, cur_mo, idx+1);

        let d = NEATOCAL_PARAM.weekday_code[ dt.getDay() ];

        //if (d[0] == "S") { td.classList.add("weekend"); }
        if ((dt.getDay() == 0) ||
            (dt.getDay() == 6)) {
          td.classList.add("weekend");
        }


        let span_date = H.span((idx+1).toString(), "date");
        let span_day = H.span(d, "day");

        td.appendChild( span_date );
        td.appendChild( span_day );


        //EXPERIMENT
        //

        let yyyy_mm_dd = fmt_date(cur_year, cur_mo, idx+1);

        if (yyyy_mm_dd in NEATOCAL_PARAM.data) {
          let txt = H.div();
          txt.innerHTML = NEATOCAL_PARAM.data[yyyy_mm_dd];
          txt.style.textAlign = "center";
          txt.style.fontWeight = "300";
          //txt.style.height = '30px';
          td.appendChild(txt);
        }

        //
        //EXPERIMENT


      }
      tr.appendChild(td);

    }

    tbody.appendChild(tr);

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

function neatocal_aligned_weekdays() {
  let year      = parseInt(NEATOCAL_PARAM.year);
  let start_mo  = parseInt(NEATOCAL_PARAM.start_month);
  let n_mo      = parseInt(NEATOCAL_PARAM.n_month);

  let ui_tr_mo = document.getElementById("ui_tr_month_name");
  ui_tr_mo.innerHTML = "";
  for (let i_mo = start_mo; i_mo < (start_mo+n_mo); i_mo++) {
    ui_tr_mo.appendChild( H.th( NEATOCAL_PARAM.month_code[ i_mo%12 ] ) );
  }

  // start_day, when to start the first day in the month.
  // day_in_mo_start is the number of days past the start_day
  //   the month starts, so we know how much to skip over when
  //   displaying the aligned cells.
  //
  let max_start = -1;
  let start_day = NEATOCAL_PARAM.start_day;
  let day_in_mo_start = [];
  for (let i=0; i<n_mo; i++) { day_in_mo_start.push(0); }
  for (let i_mo = start_mo; i_mo < (start_mo+n_mo); i_mo++) {
    let cur_year = parseInt(year) + Math.floor(i_mo/12);
    let cur_mo = i_mo%12;
    let s = new Date(cur_year, cur_mo, 1).getDay();
    day_in_mo_start[i_mo - start_mo] = s;

    if (day_in_mo_start[i_mo - start_mo] > max_start) {
      max_start = day_in_mo_start[i_mo - start_mo];
    }
  }

  let tbody = document.getElementById("ui_tbody");
  for (let idx=0; idx<42; idx++) {

    let tr = H.tr();
    if ((typeof NEATOCAL_PARAM.cell_height !== "undefined") &&
        (NEATOCAL_PARAM.cell_height != null) &&
        (NEATOCAL_PARAM.cell_height != "")) {
      tr.style.height = NEATOCAL_PARAM.cell_height;
    }

    let cur_year = year;
    for (let i_mo = start_mo; i_mo < (start_mo+n_mo); i_mo++) {

      cur_year = parseInt(year) + Math.floor(i_mo/12);

      // cur_mo is the month in the current year
      // nday_in_mo is the number of days in the month under consideration
      // day_idx is the day of the month this cell would fall in,
      //  which can be out of bounds (less than 0 or greater than the number of
      //  days in the month)
      //
      let cur_mo = i_mo%12;
      let nday_in_mo = new Date(cur_year,cur_mo+1,0).getDate();
      let day_idx = idx - ((day_in_mo_start[i_mo - start_mo] - start_day + 7)%7);

      let td = H.td();
      td.style.width = (100/n_mo).toString() + "%";

      // if our day falls within bounds, we decorate the td with the appropriate
      // values
      //
      if ((day_idx >= 0) &&
          (day_idx < nday_in_mo)) {

        let dt = new Date(cur_year, cur_mo, day_idx+1);

        let wd_code = NEATOCAL_PARAM.weekday_code[ dt.getDay() ];

        // If it's a weekend (Su,Sa), add the 'weekend' class to allow for highlighting
        //
        if ((dt.getDay() == 0) ||
            (dt.getDay() == 6)) {
          td.classList.add("weekend");
        }


        // date - day in month
        // day  - name of weekday (e.g. Su,M,T,W,R,F,Sa)
        //
        let span_date = H.span((day_idx+1).toString(), "date");
        let span_day = H.span(wd_code, "day");

        td.appendChild( span_date );
        td.appendChild( span_day );

        //EXPERIMENT
        //

        let yyyy_mm_dd = fmt_date(cur_year, cur_mo, idx+1);

        if (yyyy_mm_dd in NEATOCAL_PARAM.data) {
          let txt = H.div();
          txt.innerHTML = NEATOCAL_PARAM.data[yyyy_mm_dd];
          txt.style.textAlign = "center";
          txt.style.fontWeight = "300";
          td.appendChild(txt);
        }

        //
        //EXPERIMENT



      }
      tr.appendChild(td);

    }

    tbody.appendChild(tr);
  }

}

function neatocal_post_process() {
  let highlight_color = NEATOCAL_PARAM.highlight_color;
  let x = document.getElementsByClassName("weekend");
  for (let i = 0; i < x.length; i++) {
    x[i].style.background = highlight_color;
  }
}

function neatocal_grab_data(fn) {


}

function _load(url, _cb, _errcb) {
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
    "year", "start_month", "n_month", "layout",
    "start_day", "highlight_color", "weekday_code", "month_code",
    "cell_height", "help"
  ];

  for (let idx = 0; idx < admissible_param.length; idx++) {
    let key = admissible_param[idx];

    if (key in data) {
      param[key] = data[key];
    }
  }

  return param;
}

function neatocal_parse_data(raw) {

  if (raw.type == "loadend") {

    if ((raw.target.readyState == 4) &&
        (raw.target.status == 200)) {

      try {
        let json_data = JSON.parse(raw.target.response);
        NEATOCAL_PARAM.data = json_data;

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

function neatocal_init() {
  let sp = new URLSearchParams(window.location.search);

  // peel off parameters from URL
  //

  let help_param = sp.get("help");
  let year_param = sp.get("year");
  let layout_param = sp.get("layout");
  let start_month_param = sp.get("start_month");
  let n_month_param = sp.get("n_month");
  let start_day_param = sp.get("start_day");
  let highlight_color_param = sp.get("highlight_color");
  let cell_height_param = sp.get("cell_height");
  let weekday_code_param = sp.get("weekday_code");
  let month_code_param = sp.get("month_code");

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
    if      (_l == "default")         { layout = "default"; }
    else if (_l == "aligned-weekdays") { layout = "aligned-weekdays"; }
  }
  NEATOCAL_PARAM.layout = layout;

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

  let cell_height = NEATOCAL_PARAM.cell_height;
  if ((cell_height_param != null) &&
      (typeof cell_height_param !== "undefined")) {
    cell_height = cell_height_param;
  }
  NEATOCAL_PARAM.cell_height = cell_height;

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

  // if we have a data file, short circuit to wait till load.
  // neatocal_parse_data will call neatocal_render to render the
  // calendar.
  //
  if (NEATOCAL_PARAM.data_fn) {
    _load( NEATOCAL_PARAM.data_fn, neatocal_parse_data, neatocal_parse_data_error );
    return;
  }

  // no data file, just render
  //
  neatocal_render();
}

function neatocal_render() {

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

    ui_year.appendChild( span );
  }

  //---

  if (layout == "aligned-weekdays") {
    neatocal_aligned_weekdays();
  }
  else {
    neatocal_default();
  }

  neatocal_post_process();
}

