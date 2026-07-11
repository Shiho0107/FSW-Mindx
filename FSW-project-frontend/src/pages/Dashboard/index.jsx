import { useState, useEffect, useMemo } from "react";
import statApi from "../../api/statApi";
import studentApi from "../../api/studentApi";
import teacherApi from "../../api/teacherApi";
import eventApi from "../../api/eventApi";
import StatCard from "./components/StatCard";
import { GraduationCap, Users, Calendar, AlertTriangle } from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import "./Dashboard.css";

/**
 * Dashboard — fetches all counts in parallel via Promise.allSettled.
 * Each card falls back gracefully if its individual API fails.
 * Stats card order: Students → Teachers → Events → Foods.
 */

const Dashboard = () => {
  const [stats,    setStats]    = useState(null);
  const [students, setStudents] = useState([]);
  const [events,   setEvents]   = useState([]);
  const [counts,   setCounts]   = useState({});  // { teachers, events, foods }
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);

      // Fetch all concurrently — individual failures do not abort the rest
      const [statsRes, studentsRes, teachersRes, eventsRes] =
        await Promise.allSettled([
          statApi.getStats(),
          studentApi.getAll(),
          teacherApi.getAll(),
          eventApi.getAll(),
        ]);

      if (cancelled) return;

      if (statsRes.status === "fulfilled")   setStats(statsRes.value);
      if (studentsRes.status === "fulfilled") setStudents(Array.isArray(studentsRes.value) ? studentsRes.value : []);

      // Collect direct counts — these override statApi values which may be stale
      const directCounts = {};
      if (teachersRes.status === "fulfilled" && Array.isArray(teachersRes.value))
        directCounts.teachers = teachersRes.value.length;
      if (eventsRes.status === "fulfilled" && Array.isArray(eventsRes.value)) {
        setEvents(eventsRes.value);
        directCounts.events = eventsRes.value.length;
      }

      setCounts(directCounts);
      setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, []);

  // ── Derived values ───────────────────────────────────────────────────────────
  const statCardValues = useMemo(() => ({
    totalStudents: counts.students ?? stats?.totalStudents ?? students.length ?? null,
    totalTeachers: counts.teachers ?? stats?.totalTeachers ?? null,
    totalEvents:   counts.events   ?? stats?.totalEvents   ?? null,
  }), [stats, students, counts]);

  const absentReports = useMemo(() => {
    const reports = [];
    events.forEach(evt => {
      if (Array.isArray(evt.absentees) && evt.absentees.length > 0) {
        evt.absentees.forEach(studentId => {
          const student = students.find(s => s._id === studentId);
          reports.push({
            id: `${evt._id}_${studentId}`,
            studentId: studentId,
            studentName: student ? `${student.firstName} ${student.lastName}` : "Unknown Student",
            classTitle: evt.title || "Untitled Class",
            className: evt.className || "N/A",
            date: evt.date || "N/A"
          });
        });
      }
    });
    // Sort by date descending
    return reports.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [events, students]);

  const STAT_CARDS = [
    { key: "totalStudents", label: "Students",  icon: <GraduationCap size={24} />, color: "purple"   },
    { key: "totalTeachers", label: "Teachers",  icon: <Users size={24} />,         color: "orange"   },
    { key: "totalEvents",   label: "Classes",   icon: <Calendar size={24} />,      color: "yellow"   },
  ];

  if (loading) return <LoadingSpinner message="Loading dashboard…" />;

  if (error) {
    return (
      <div className="stateBox">
        <AlertTriangle size={48} color="var(--color-danger)" style={{ marginBottom: 12 }} />
        <p className="errorMsg">Failed to load data</p>
        <p style={{ fontSize: 12, color: "#A098AE" }}>{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="pageHeader">
        <h1 className="pageTitle">Dashboard</h1>
      </div>

      {/* Summary stat cards */}
      <div className="statGrid">
        {STAT_CARDS.map(({ key, label, icon, color }) => {
          const val = statCardValues[key];
          return (
            <StatCard
              key={key}
              label={label}
              icon={icon}
              color={color}
              value={val != null ? val.toLocaleString() : "—"}
            />
          );
        })}
      </div>

      {/* Absentee Report Table */}
      <div className="card" style={{ marginTop: "24px" }}>
        <h2 className="cardTitle" style={{ marginBottom: "16px", color: "#303972" }}>Student Absence Report</h2>
        <p style={{ color: "#A098AE", fontSize: "13px", marginBottom: "16px" }}>
          List of students marked absent in classes, ordered by date.
        </p>
        <div className="tableWrapper" style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #f0f0f0", borderRadius: "8px" }}>
          <table className="table dataTable" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5ff", position: "sticky", top: 0, zIndex: 1 }}>
                <th style={{ padding: "12px", borderBottom: "1.5px solid #e0e0e0" }}>Student ID</th>
                <th style={{ padding: "12px", borderBottom: "1.5px solid #e0e0e0" }}>Student Name</th>
                <th style={{ padding: "12px", borderBottom: "1.5px solid #e0e0e0" }}>Class/Event</th>
                <th style={{ padding: "12px", borderBottom: "1.5px solid #e0e0e0" }}>Classroom</th>
                <th style={{ padding: "12px", borderBottom: "1.5px solid #e0e0e0" }}>Date</th>
                <th style={{ padding: "12px", borderBottom: "1.5px solid #e0e0e0", textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {absentReports.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "24px", color: "#A098AE" }}>
                    No student absences recorded yet.
                  </td>
                </tr>
              ) : (
                absentReports.map(rep => (
                  <tr key={rep.id}>
                    <td style={{ padding: "12px", fontFamily: "monospace", fontSize: "12px", color: "#A098AE" }}>
                      #{rep.studentId?.slice(-8).toUpperCase()}
                    </td>
                    <td className="boldText" style={{ padding: "12px" }}>{rep.studentName}</td>
                    <td style={{ padding: "12px" }}>{rep.classTitle}</td>
                    <td style={{ padding: "12px", color: "#A098AE" }}>{rep.className}</td>
                    <td style={{ padding: "12px", fontWeight: "600" }}>{rep.date}</td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <span style={{
                        background: "#ffebee",
                        color: "#c62828",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: "700"
                      }}>
                        ABSENT
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
