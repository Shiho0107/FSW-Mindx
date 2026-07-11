import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useFetch from "../../hooks/useFetch";
import eventApi from "../../api/eventApi";
import teacherApi from "../../api/teacherApi";
import { getTeacherName } from "../../utils/format";
import CalendarGrid from "../../components/calendar/CalendarGrid";
import ScheduleList from "../../components/calendar/ScheduleList";
import { buildCalendar, buildEventDayMap, toDateStr, MONTHS, pad } from "../../utils/dateUtils";
import { Calendar } from "lucide-react";
import "./MyCalendar.css";

const MyCalendar = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const today = new Date();
  const [year, setYear]       = useState(today.getFullYear());
  const [month, setMonth]     = useState(today.getMonth());
  const [selected, setSelected] = useState(today.getDate());

  const { data: allEvents, loading, error } = useFetch(eventApi.getAll, []);
  const { data: teachers } = useFetch(teacherApi.getAll, []);
  const teacherList = teachers ?? [];

  /** Filter events to only those belonging to this user */
  const myEvents = useMemo(() => {
    if (!allEvents || !user?.linkedProfileId) return [];
    if (role === "student") {
      return allEvents.filter(
        (e) => Array.isArray(e.attendees) && e.attendees.includes(user.linkedProfileId)
      );
    }
    if (role === "teacher") {
      return allEvents.filter((e) => e.teacherId === user.linkedProfileId);
    }
    return [];
  }, [allEvents, user, role]);

  const myEventsThisWeek = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - dayOfWeek));
    endOfWeek.setHours(23, 59, 59, 999);

    return myEvents.filter((evt) => {
      if (!evt.date) return false;
      const evtDate = new Date(`${evt.date}T00:00:00`);
      return evtDate >= startOfWeek && evtDate <= endOfWeek;
    });
  }, [myEvents]);

  const selectedDateStr = toDateStr(year, month, selected);
  const dayEvents       = myEvents.filter((e) => e.date === selectedDateStr);

  const eventDays = useMemo(
    () => buildEventDayMap(myEvents, year, month),
    [myEvents, year, month]
  );

  const cells     = buildCalendar(year, month);
  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); setSelected(1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); setSelected(1); };

  if (loading) return <div className="stateBox"><div className="spinner" /></div>;
  if (error)   return <div className="stateBox errorMsg">Failed to load classes.</div>;

  const roleLabel = role === "teacher" ? "My Classes" : "My Calendar";

  return (
    <div className="myCalendarPage">
      <div className="pageHeader">
        <h1 className="pageTitle">{roleLabel}</h1>
        <span className="roleBadge">{user?.name}</span>
      </div>

      {myEvents.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: "center", color: "#A098AE", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Calendar size={48} style={{ marginBottom: 12, color: "var(--color-primary)" }} />
          <p>
            {role === "teacher"
              ? "No classes assigned to you yet."
              : "You have not been assigned to any classes yet."}
          </p>
          <p style={{ fontSize: 12, marginTop: 8 }}>
            Ask your admin to assign you to a class schedule.
          </p>
        </div>
      ) : (
        <div className="contentGrid">
          <CalendarGrid
            cells={cells}
            selected={selected}
            year={year}
            month={month}
            eventDays={eventDays}
            onSelect={setSelected}
            onPrev={prevMonth}
            onNext={nextMonth}
          />

          {/* Day detail sidebar */}
          <div className="card sideCol">
            <h3 className="cardTitle">{MONTHS[month]} {pad(selected)}, {year}</h3>
            <p style={{ fontSize: 13, color: "#A098AE", marginBottom: 12 }}>
              {dayEvents.length} class(es) scheduled
            </p>

            <ScheduleList 
              events={dayEvents} 
              teachers={teacherList} 
              role={role} 
              onEdit={(evt) => navigate(`/events/${evt._id}/edit`)}
            />

            {/* Weekly classes list */}
            <div style={{ marginTop: 16, borderTop: "1px solid #f0f0f0", paddingTop: 12 }}>
              <p style={{ fontSize: 12, color: "#A098AE", fontWeight: 600, marginBottom: 6 }}>
                MY CLASSES THIS WEEK
              </p>
              {myEventsThisWeek
                .slice()
                .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? "") || (a.startTime ?? "").localeCompare(b.startTime ?? ""))
                .map((evt, idx) => (
                  <div
                    key={evt._id || idx}
                    style={{ fontSize: 12, color: "#303972", marginBottom: 6, display: "flex", justifyContent: "space-between", gap: 8 }}
                  >
                    <span>
                      {evt.title}
                      {role === "student" && evt.teacherId && (
                        <span style={{ color: "#A098AE" }}>
                          {" "}· {getTeacherName(evt.teacherId, teacherList) ?? "Teacher"}
                        </span>
                      )}
                    </span>
                    <span style={{ color: "#A098AE", flexShrink: 0 }}>{evt.date}</span>
                  </div>
                ))}
              {myEventsThisWeek.length === 0 && (
                <p style={{ fontSize: 11, color: "#A098AE" }}>No classes scheduled for this week.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCalendar;
