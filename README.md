NeatCal
===

A neat calendar with the full year on a single page.

Based on the very awesome [Neatnik's Calendar](https://github.com/neatnik/calendar) project.

This is a JavaScript port with added parameters (see below) and designed to be "dependency free" with all files local.

Here's a [live demo](https://abetusk.github.io/neatcal).

Screenshots
---

![default](img/neatcal_default.png)

![aligned](img/neatcal_align.png)

Parameters
---

| URL Parameter | Description | Example |
|---|---|---|
| `year` | Change year (defaul to current year) | [...?year=2030](https://abetusk.github.io/neatcal?year=2030) |
| `start_month` | Start at month other than January. 0 indexed (`0`=Jan, `1`=Feb, ...).  | [...?start_month=7](https://abetusk.github.io/neatcal?start_month=7) |
| `n_month` | Change number of months to something other than 12 (default `12`).  | [...?n_month=6](https://abetusk.github.io/neatcal?n_month=6) |
| `layout` | Changes the layout of the calendar. `default` or `aligned-weekdays`.  | [...?layout=aligned-weekdays](https://abetusk.github.io/neatcal?layout=aligned-weekdays) |
| `start_day` | Start at day other than Monday. 0 indexed (`0`=Sun, `1`=Mon, ...). Only valid with `aligned-weekdays` layout  | [...?layout=aligned-weekdays&start_day=0](https://abetusk.github.io/neatcal?layout=aligned-weekdays&start_day=0) |
| `highlight_color` | Change the weekend highlight color (default `eee`) | [...?highlight_color=fee](https://abetusk.github.io/neatcal?highlight_color=fee) |
| `weekday_code` | Comma separated list of weekday codes to use (default `Su,M,T,W,R,F,Sa`). Elements can be blank if no weekday code is wanted. | [...?weekday_code=S,M,T,W,T,F,S](https://abetusk.github.io/neatcal?weekday_code=S,M,T,W,T,F,S) |
| `month_code` | Comma separated list of month codes to use (default `Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec`). Elements can be blank if no month code is wanted. | [...?month_code=J,F,M,A,M,J,J,A,S,O,N,D](https://abetusk.github.io/neatcal?month_code=J,F,M,A,M,J,J,A,S,O,N,D) |
| `help` | Show help screen  | [...?help](https://abetusk.github.io/neatcal?help) |

Presets
---

The above parameter list is versatile enough to many options for display. Below is an abreviated list of presets that might be useful to people.

| Preset | Description |
|---|---|
| [Color and aligned](https://abetusk.github.io/neatcal?layout=aligned-weekdays&highlight_color=fee) | Calendar with aligned days and red highlighted weekends |
| [Academic calendar](https://abetusk.github.io/neatcal?start_month=7) | An "academic calendar" that starts on Sept and runs through to August of the following year |
| Half Page [left](https://abetusk.github.io/neatcal?n_month=6) and [right](https://abetusk.github.io/neatcal?start_month=6&n_month=6) calendars | Two half page (6 months) calendars |
| [Non-highlighted calendar](https://abetusk.github.io/neatcal?highlight_color=fff) | Calendar without the weekend highlighting |
| [Chinese month and day](https://abetusk.github.io/neatcal/?month_code=1%E6%9C%88,2%E6%9C%88,3%E6%9C%88,4%E6%9C%88,5%E6%9C%88,6%E6%9C%88,7%E6%9C%88,8%E6%9C%88,9%E6%9C%88,10%E6%9C%88,11%E6%9C%88,12%E6%9C%88&weekday_code=%E6%97%A5,%E4%B8%80,%E4%BA%8C,%E4%B8%89,%E5%9B%9B,%E4%BA%94,%E5%85%AD) | Calendar with (simplified) Chinese month and day abbreviations (thanks to [myway42](https://github.com/myway42/calendar)) |
| [Two year calendar](https://abetusk.github.io/neatcal?n_month=24&layout=aligned-weekdays&start_day=0) | Two year single page calendar |

License
---

MIT
