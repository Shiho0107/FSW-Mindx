import { DAYS, MONTHS } from "../../utils/dateUtils";
import "./CalendarGrid.css";

/**
 * CalendarGrid — reusable monthly calendar grid.
 *
 * Props:
 *   cells       - array from buildCalendar()
 *   selected    - currently selected day number
 *   year        - current year
 *   month       - current month (0-indexed)
 *   eventDays   - { [day]: count } map
 *   onSelect    - fn(day) called when a current-month day is clicked
 *   onPrev      - fn() navigate to previous month
 *   onNext      - fn() navigate to next month
 *   title       - optional heading override (defaults to "Month Year")
 *   headerAction- optional React node (e.g. "New Class" button)
 */
const CalendarGrid = ({
  cells,
  selected,
  year,
  month,
  eventDays = {},
  onSelect,
  onPrev,
  onNext,
  title,
  headerAction,
}) => {
  return (
    <div className="card calendarCol">
      <div className="cardHeader">
        <h2 className="cardTitle">{title ?? `${MONTHS[month]} ${year}`}</h2>
        <div className="calendarControls">
          <button className="calNavBtn" onClick={onPrev}>‹</button>
          <span className="calMonthLabel">{MONTHS[month]} {year}</span>
          <button className="calNavBtn" onClick={onNext}>›</button>
          {headerAction}
        </div>
      </div>

      <div className="calendarGrid">
        {DAYS.map((d) => (
          <div key={d} className="calHeader">{d}</div>
        ))}
        {cells.map((cell, idx) => {
          const isSelected = cell.cur && cell.day === selected;
          const count      = cell.cur ? (eventDays[cell.day] || 0) : 0;
          return (
            <div
              key={idx}
              className={`calCell${!cell.cur ? " inactive" : ""}${isSelected ? " selected" : ""}`}
              onClick={() => cell.cur && onSelect(cell.day)}
              style={{ cursor: cell.cur ? "pointer" : "default" }}
            >
              <span className="calDate">{cell.day}</span>
              {count > 0 && (
                <div className="calEventIndicators">
                  <span className="dot purple" />
                  {count > 1 && (
                    <span style={{ fontSize: 9, color: "#4D44B5", fontWeight: 700 }}>
                      +{count - 1}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
