/**
 * dateUtils — calendar helpers shared by Events and MyCalendar pages.
 */

export const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

/** Zero-pad a number to 2 digits */
export const pad = (n) => String(n).padStart(2, "0");

/**
 * Build a flat array of calendar cells for the given year+month.
 * Each cell: { day: number, cur: boolean }
 * `cur: false` = day belongs to prev/next month (filler cells).
 */
export const buildCalendar = (year, month) => {
  const firstDay     = new Date(year, month, 1).getDay();
  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const daysInPrev   = new Date(year, month, 0).getDate();
  const cells        = [];

  // Trailing days of previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrev - i, cur: false });
  }
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, cur: true });
  }
  // Leading days of next month to complete last row
  const rem = 7 - (cells.length % 7 || 7);
  for (let d = 1; d <= (rem === 7 ? 0 : rem); d++) {
    cells.push({ day: d, cur: false });
  }
  return cells;
};

/**
 * Return a Map of { day → count } for events in the given year+month.
 * @param {Array} events - event objects with a `date` field (YYYY-MM-DD)
 */
export const buildEventDayMap = (events, year, month) => {
  const map = {};
  events.forEach((e) => {
    if (!e.date) return;
    const [ey, em, ed] = e.date.split("-").map(Number);
    if (ey === year && em === month + 1) {
      map[ed] = (map[ed] || 0) + 1;
    }
  });
  return map;
};

/** Format a date string YYYY-MM-DD from year/month/day numbers */
export const toDateStr = (year, month, day) =>
  `${year}-${pad(month + 1)}-${pad(day)}`;
