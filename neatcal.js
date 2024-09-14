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

var NEATCAL_PARAM = {

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

  // weekend highlight color
  //
  "highlight_color": '#eee'

};

// simple HTML convenience functions
//
var H = {
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

function neatcal_default() {
  let year      = NEATCAL_PARAM.year;
  let start_mo  = NEATCAL_PARAM.start_month;

  let ui_tr_mo = document.getElementById("ui_tr_month_name");
  ui_tr_mo.innerHTML = "";
  for (let i_mo = start_mo; i_mo < (start_mo+12); i_mo++) {
    ui_tr_mo.appendChild( H.th( NEATCAL_PARAM.month_code[ i_mo%12 ] ) );
  }

  let tbody = document.getElementById("ui_tbody");
  for (let idx=0; idx<31; idx++) {

    let tr = H.tr();

    let cur_year = year;
    for (let i_mo = start_mo; i_mo < (start_mo+12); i_mo++) {
      
      if (i_mo >= 12) { cur_year = parseInt(year)+1; }
      let cur_mo = i_mo%12;

      let nday_in_mo = new Date(cur_year,cur_mo+1,0).getDate();

      let td = H.td();

      if (idx < nday_in_mo) {

        let dt = new Date(cur_year, cur_mo, idx+1);

        let d = NEATCAL_PARAM.weekday_code[ dt.getDay() ];

        //if (d[0] == "S") { td.classList.add("weekend"); }
        if ((dt.getDay() == 0) ||
            (dt.getDay() == 6)) {
          td.classList.add("weekend");
        }


        let span_date = H.span((idx+1).toString(), "date");
        let span_day = H.span(d, "day");

        td.appendChild( span_date );
        td.appendChild( span_day );


      }
      tr.appendChild(td);

    }

    tbody.appendChild(tr);

  }

}

function neatcal_aligned_weekdays() {
  let year      = NEATCAL_PARAM.year;
  let start_mo  = NEATCAL_PARAM.start_month;

  let ui_tr_mo = document.getElementById("ui_tr_month_name");
  ui_tr_mo.innerHTML = "";
  for (let i_mo = start_mo; i_mo < (start_mo+12); i_mo++) {
    ui_tr_mo.appendChild( H.th( NEATCAL_PARAM.month_code[ i_mo%12 ] ) );
  }

  // monday start day
  //
  let start_day = NEATCAL_PARAM.start_day;
  let day_in_mo_start = [];
  for (let i=0; i<12; i++) { day_in_mo_start.push(0); }

  for (let i_mo = start_mo; i_mo < (start_mo+12); i_mo++) {
    let cur_year = year;
    if (i_mo >= 12) { cur_year = parseInt(year)+1; }
    let cur_mo = i_mo%12;

    let s = new Date(cur_year, cur_mo, 1).getDay();
    day_in_mo_start[cur_mo] = s;
  }

  let tbody = document.getElementById("ui_tbody");

  for (let idx=0; idx<42; idx++) {

    let tr = H.tr();

    let cur_year = year;
    for (let i_mo = start_mo; i_mo < (start_mo+12); i_mo++) {

      if (i_mo >= 12) { cur_year = parseInt(year)+1; }
      let cur_mo = i_mo%12;

      let nday_in_mo = new Date(cur_year,cur_mo+1,0).getDate();

      let td = H.td();

      let day_idx = idx - ((day_in_mo_start[cur_mo] - start_day + 7)%7);

      if ((day_idx >= 0) &&
          (day_idx < nday_in_mo)) {

        let dt = new Date(cur_year, cur_mo, day_idx+1);

        let d = NEATCAL_PARAM.weekday_code[ dt.getDay() ];

        //if (d[0] == "S") { td.classList.add("weekend"); }
        if ((dt.getDay() == 0) ||
            (dt.getDay() == 6)) {
          td.classList.add("weekend");
        }


        let span_date = H.span((day_idx+1).toString(), "date");
        let span_day = H.span(d, "day");

        td.appendChild( span_date );
        td.appendChild( span_day );


      }
      tr.appendChild(td);

    }

    tbody.appendChild(tr);

  }

}

function neatcal_post_process() {
  let highlight_color = NEATCAL_PARAM.highlight_color;
  let x = document.getElementsByClassName("weekend");
  for (let i = 0; i < x.length; i++) {
    x[i].style.background = highlight_color;
  }
}

function neatcal_init() {
  console.log( window.location.search );
  let sp = new URLSearchParams(window.location.search);

  // peel off parameters from URL
  //

  let year_param = sp.get("year");
  let layout_param = sp.get("layout");
  let start_month_param = sp.get("start_month");
  let start_day_param = sp.get("start_day");
  let highlight_color_param = sp.get("highlight_color");
  let weekday_code_param = sp.get("weekday_code");
  let month_code_param = sp.get("month_code");

  //---

  let year = new Date().getFullYear();
  if ((year_param != null) &&
      (typeof year_param !== "undefined")) {
    year = year_param;
  }
  NEATCAL_PARAM.year = year;

  //---

  let layout = NEATCAL_PARAM.layout;
  if ((layout_param != null) &&
      (typeof layout_param !== "undefined")) {
    _l = sp.get("layout");
    if      (_l == "default")         { layout = "default"; }
    else if (_l == "aligned-weekdays") { layout = "aligned-weekdays"; }
  }
  NEATCAL_PARAM.layout = layout;

  //---

  let start_month = NEATCAL_PARAM.start_month;
  if ((start_month_param != null) &&
      (typeof start_month_param !== "undefined")) {
    start_month = parseInt(start_month_param);
    if (isNaN(start_month)) {
      start_month = 0;
    }
  }
  NEATCAL_PARAM.start_month = start_month;

  //---

  let start_day = NEATCAL_PARAM.start_day;
  if ((start_day_param != null) &&
      (typeof start_day_param !== "undefined")) {
    start_day = parseInt(start_day_param);
    if (isNaN(start_day)) {
      start_day = 0;
    }
  }
  NEATCAL_PARAM.start_day = start_day;

  //---

  let highlight_color = NEATCAL_PARAM.highlight_color;
  if ((highlight_color_param != null) &&
      (typeof highlight_color_param !== "undefined")) {
    highlight_color = highlight_color_param;
    if (highlight_color.match( /^[\da-fA-F]+/ )) {
      highlight_color = "#" + highlight_color;
    }
  }
  NEATCAL_PARAM.highlight_color = highlight_color;

  //---

  let weekday_code = NEATCAL_PARAM.weekday_code;
  if ((weekday_code_param != null) &&
      (typeof weekday_code_param !== "undefined")) {

    weekday_code = weekday_code_param.split(",");

    // padd out with blank
    //
    for (let i=weekday_code.length; i<7; i++) {
      weekday_code.push("");
    }

  }
  NEATCAL_PARAM.weekday_code = weekday_code;

  //---

  let month_code = NEATCAL_PARAM.month_code;
  if ((month_code_param != null) &&
      (typeof month_code_param !== "undefined")) {

    month_code = month_code_param.split(",");

    // padd out with blank
    //
    for (let i=month_code.length; i<7; i++) {
      month_code.push("");
    }

  }
  NEATCAL_PARAM.month_code = month_code;

  //---

  // if we only have one year, put it in the center
  // otherwise find the proportion of other years
  //   and adjust the year header appropriately

  let ui_year = document.getElementById("ui_year");

  if (start_month == 0) {

    let span = H.span();
    span.innerHTML = year;
    span.style["display"] = "inline-block";
    span.style["width"] = "100%";
    span.style["justify-content"] = "center";
    span.style["text-align"] = "center";
    span.style["margin"] = "0 0 .5em 0";

    ui_year.innerHTML = "";
    ui_year.appendChild( span );
  }

  else {
    let left_year_pct = (12 - start_month) / 12;
    let right_year_pct = (start_month) / 12;

    let lspan = H.span();
    lspan.innerHTML = year;
    lspan.style["display"] = "inline-block";
    lspan.style["width"] = (100*left_year_pct).toString() + "%";
    lspan.style["justify-content"] = "center";
    lspan.style["text-align"] = "center";
    lspan.style["margin"] = "0 0 .5em 0";

    let rspan = H.span();
    rspan.innerHTML = (parseInt(year)+1).toString();
    rspan.style["display"] = "inline-block";
    rspan.style["width"] = (100*right_year_pct).toString() + "%";
    rspan.style["justify-content"] = "center";
    rspan.style["text-align"] = "center";
    rspan.style["margin"] = "0 0 .5em 0";

    ui_year.innerHTML = "";
    ui_year.appendChild( lspan );
    ui_year.appendChild( rspan );

  }

  //---

  if (layout == "aligned-weekdays") {
    neatcal_aligned_weekdays();
  }
  else {
    neatcal_default();
  }


  neatcal_post_process();
}

