import { getTeacherName } from "../../utils/format";
import { Clock, Users, UserRound, Edit, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

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
  const { user } = useAuth();
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
                <div className="timeRow" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#A098AE" }}>
                  <Clock size={12} />
                  <span>{evt.startTime} – {evt.endTime}</span>
                </div>
                {/* Teacher sees student count */}
                {role === "teacher" && evt.attendees?.length > 0 && (
                  <p style={{ fontSize: 11, color: "#A098AE", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                    <Users size={12} />
                    <span>{evt.attendees.length} student(s) enrolled</span>
                  </p>
                )}
                {evt.teacherId && (role === "student" || role === "admin") && (
                  <p style={{ fontSize: 11, color: "#A098AE", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                    <UserRound size={12} />
                    <span>{teacherName ?? "Teacher"}</span>
                  </p>
                )}
                {role === "admin" && evt.attendees?.length > 0 && (
                  <p style={{ fontSize: 11, color: "#A098AE", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                    <Users size={12} />
                    <span>{evt.attendees.length} student(s)</span>
                  </p>
                )}
                {role === "student" && user?.linkedProfileId && (() => {
                  const now = new Date();
                  const classEndStr = `${evt.date}T${evt.endTime || "23:59"}`;
                  const isPast = new Date(classEndStr) < now;
                  if (!isPast) return null;
                  
                  const isAbsent = Array.isArray(evt.absentees) && evt.absentees.includes(user.linkedProfileId);
                  return (
                    <div style={{ marginTop: 8 }}>
                      <span style={{
                        background: isAbsent ? "#ffebee" : "#e8f5e9",
                        color: isAbsent ? "#c62828" : "#2e7d32",
                        padding: "3px 8px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: "700"
                      }}>
                        {isAbsent ? "ABSENT" : "PRESENT"}
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Admin and Teacher edit/delete actions */}
              {(role === "admin" || role === "teacher") && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {onEdit && (
                    <button
                      onClick={() => onEdit(evt)}
                      style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 4 }}
                      title={role === "teacher" ? "Mark Attendance" : "Edit"}
                    >
                      <Edit size={14} style={{ color: "var(--color-primary)" }} />
                    </button>
                  )}
                  {role === "admin" && onDelete && (
                    <button
                      onClick={() => onDelete(evt)}
                      style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 4 }}
                      title="Delete"
                    >
                      <Trash2 size={14} style={{ color: "var(--color-danger)" }} />
                    </button>
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
