import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useFetch from "../../hooks/useFetch";
import eventApi from "../../api/eventApi";
import teacherApi from "../../api/teacherApi";
import { getTeacherName } from "../../utils/format";
import Button from "../../components/common/Button";
import CalendarGrid from "../../components/calendar/CalendarGrid";
import ScheduleList from "../../components/calendar/ScheduleList";
import { buildCalendar, buildEventDayMap, toDateStr, MONTHS, pad } from "../../utils/dateUtils";
import "./Events.css";

const Events = () => {
  const navigate = useNavigate();
  const today    = new Date();
  const [year, setYear]       = useState(today.getFullYear());
  const [month, setMonth]     = useState(today.getMonth());
  const [selected, setSelected] = useState(today.getDate());
  const [localData, setLocalData] = useState([]);

  const onFetchSuccess = (d) => setLocalData(d);
  const { data: fetched, loading, error } = useFetch(eventApi.getAll, [], onFetchSuccess);
  const { data: teachers } = useFetch(teacherApi.getAll, []);
  const allEvents = localData.length ? localData : (fetched ?? []);
  const teacherList = teachers ?? [];

  const selectedDateStr = toDateStr(year, month, selected);
  const dayEvents       = allEvents.filter((e) => e.date === selectedDateStr);

  const eventDays = useMemo(
    () => buildEventDayMap(allEvents, year, month),
    [allEvents, year, month]
  );

  const cells    = buildCalendar(year, month);
  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); setSelected(1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); setSelected(1); };

  const handleDelete = async (evt) => {
    if (!window.confirm("Delete this class/event?")) return;
    try {
      await eventApi.remove(evt._id);
      setLocalData((prev) => prev.filter((e) => e._id !== evt._id));
      toast.success("Class/Event deleted.");
    } catch (err) {
      toast.error("Failed to delete: " + err.message);
    }
  };

  if (loading && !localData.length) return <div className="stateBox"><div className="spinner" /></div>;
  if (error) return <div className="stateBox errorMsg">Failed to load class schedule.</div>;

  return (
    <div className="eventsPage contentGrid">
      <CalendarGrid
        cells={cells}
        selected={selected}
        year={year}
        month={month}
        eventDays={eventDays}
        onSelect={setSelected}
        onPrev={prevMonth}
        onNext={nextMonth}
        title="Class Schedule"
        headerAction={
          <Link to="/events/add">
            <Button variant="primary" leftIcon="➕">New Class</Button>
          </Link>
        }
      />

      {/* Day detail sidebar */}
      <div className="card sideCol">
        <h3 className="cardTitle">{MONTHS[month]} {pad(selected)}, {year}</h3>
        <p style={{ color: "#A098AE", fontSize: 13, marginBottom: 12 }}>
          {dayEvents.length} class(es) scheduled
        </p>

        <ScheduleList
          events={dayEvents}
          teachers={teacherList}
          role="admin"
          onEdit={(evt) => navigate(`/events/${evt._id}/edit`)}
          onDelete={handleDelete}
        />

        {allEvents.length > 0 && (
          <div style={{ marginTop: 16, borderTop: "1px solid #f0f0f0", paddingTop: 12 }}>
            <p style={{ fontSize: 12, color: "#A098AE", fontWeight: 600 }}>UPCOMING</p>
            {allEvents.slice(0, 3).map((evt, idx) => (
              <div key={evt._id || idx} style={{ fontSize: 12, color: "#303972", marginTop: 6 }}>
                📅 {evt.date} — {evt.title}
                {evt.teacherId && (
                  <span style={{ color: "#A098AE" }}>
                    {" "}· {getTeacherName(evt.teacherId, teacherList) ?? "Teacher"}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
