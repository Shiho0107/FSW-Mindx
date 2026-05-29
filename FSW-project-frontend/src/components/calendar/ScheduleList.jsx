import { getTeacherName } from "../../utils/format";

/**
 * ScheduleList — displays a list of events/classes for a selected day.
 *
 * Props:
 *   events    - array of event objects to display
 *   teachers  - teacher profiles used to resolve teacherId → name
 *   role      - "admin" | "teacher" | "student" — controls what metadata to show
 *   onEdit    - fn(event) — called when edit button clicked (admin only)
 *   onDelete  - fn(event) — called when delete button clicked (admin only)
 */
const COLOR_CYCLE = ["purple", "orange", "yellow", "blue"];

const ScheduleList = ({ events = [], teachers = [], role = "admin", onEdit, onDelete }) => {
  if (events.length === 0) {
    return <p style={{ color: "#A098AE", fontSize: 13 }}>No classes on this day.</p>;
  }

  return (
    <div className="scheduleList">
      {events.map((evt, idx) => {
        const color = evt.color || COLOR_CYCLE[idx % COLOR_CYCLE.length];
        const teacherName = getTeacherName(evt.teacherId, teachers);
        return (
          <div key={evt._id || idx} className={`scheduleItem border-${color}`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h4>{evt.title}</h4>
                {evt.className && (
                  <p style={{ fontSize: 12, color: "#A098AE" }}>Class: {evt.className}</p>
                )}
                {evt.category && <p>{evt.category}</p>}
                <div className="timeRow">
                  <span>⏰ {evt.startTime} – {evt.endTime}</span>
                </div>
                {/* Teacher sees student count */}
                {role === "teacher" && evt.attendees?.length > 0 && (
                  <p style={{ fontSize: 11, color: "#A098AE", marginTop: 4 }}>
                    👥 {evt.attendees.length} student(s) enrolled
                  </p>
                )}
                {evt.teacherId && (role === "student" || role === "admin") && (
                  <p style={{ fontSize: 11, color: "#A098AE", marginTop: 4 }}>
                    👩‍🏫 {teacherName ?? "Teacher"}
                  </p>
                )}
                {role === "admin" && evt.attendees?.length > 0 && (
                  <p style={{ fontSize: 11, color: "#A098AE", marginTop: 4 }}>
                    👥 {evt.attendees.length} student(s)
                  </p>
                )}
              </div>

              {/* Admin edit/delete actions */}
              {role === "admin" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {onEdit && (
                    <button
                      onClick={() => onEdit(evt)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}
                      title="Edit"
                    >✏️</button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(evt)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "var(--color-danger)" }}
                      title="Delete"
                    >🗑️</button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScheduleList;
