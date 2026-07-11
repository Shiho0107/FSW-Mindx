import { useParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import useFetch from "../../hooks/useFetch";
import studentApi from "../../api/studentApi";
import eventApi from "../../api/eventApi";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { GraduationCap, Calendar, Clock, Phone, Mail, Users } from "lucide-react";
import "./StudentDetails.css";

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: student, loading: studentLoading, error: studentError } = useFetch(
    () => studentApi.getById(id),
    [id]
  );

  const { data: allEvents, loading: eventsLoading } = useFetch(eventApi.getAll, []);

  const studentEvents = useMemo(() => {
    if (!allEvents) return [];
    return allEvents.filter(e => Array.isArray(e.attendees) && e.attendees.includes(id));
  }, [allEvents, id]);

  const { pastClasses, absencesCount, attendanceRate } = useMemo(() => {
    const now = new Date();
    const past = studentEvents.filter(evt => {
      if (!evt.date) return false;
      const classEndStr = `${evt.date}T${evt.endTime || "23:59"}`;
      const classEndTime = new Date(classEndStr);
      return classEndTime < now;
    });

    const absences = past.filter(e => Array.isArray(e.absentees) && e.absentees.includes(id)).length;
    const rate = past.length > 0 ? Math.round(((past.length - absences) / past.length) * 100) : 100;

    // Sort past classes by date descending
    past.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

    return { pastClasses: past, absencesCount: absences, attendanceRate: rate };
  }, [studentEvents, id]);

  const { todayClasses, upcomingClasses } = useMemo(() => {
    const todayDate = new Date();
    const yyyy = todayDate.getFullYear();
    const mm = String(todayDate.getMonth() + 1).padStart(2, "0");
    const dd = String(todayDate.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const todayList = [];
    const upcomingList = [];

    studentEvents.forEach(evt => {
      if (evt.date === todayStr) {
        todayList.push(evt);
      } else if (evt.date > todayStr) {
        upcomingList.push(evt);
      }
    });

    todayList.sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
    upcomingList.sort((a, b) => {
      const dateCmp = (a.date || "").localeCompare(b.date || "");
      if (dateCmp !== 0) return dateCmp;
      return (a.startTime || "").localeCompare(a.startTime || "");
    });

    return { todayClasses: todayList, upcomingClasses: upcomingList };
  }, [studentEvents]);

  const formattedToday = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }, []);

  if (studentLoading || eventsLoading) return <div className="stateBox"><div className="spinner" /></div>;
  if (studentError || !student) return <div className="stateBox errorMsg">Failed to load student.</div>;

  return (
    <div className="studentDetailsPage">
      <h1 className="pageTitle">Student Details</h1>

      <div className="contentGrid">
        {/* Main Profile Column */}
        <div className="mainCol">
          <div className="profileCard">
            <div className="profileBanner">
              <div className="profileAvatar">
                {student?.photo ? (
                  <img src={student.photo} alt={`${student?.firstName} ${student?.lastName}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  `${student?.firstName?.[0] || ""}${student?.lastName?.[0] || ""}`
                )}
              </div>
            </div>
            <div className="profileInfoBlock">
              <h2 className="profileName">{student?.firstName || "Unknown"} {student?.lastName || ""}</h2>
              <p className="profileRole">Student</p>
              
              <div className="detailList">
                <div className="detailItem">
                  <span className="icon" style={{ display: 'flex', alignItems: 'center' }}><GraduationCap size={18} style={{ color: "var(--color-primary)" }} /></span>
                  <div>
                    <span className="label">Grade:</span>
                    <span className="value">
                      {student?.grade ? <span className={`gradeBadge grade-${student.grade.replace(' ', '-')}`}>{student.grade}</span> : "Not assigned"}
                    </span>
                  </div>
                </div>
                <div className="detailItem">
                  <span className="icon" style={{ display: 'flex', alignItems: 'center' }}><Calendar size={18} style={{ color: "var(--color-primary)" }} /></span>
                  <div>
                    <span className="label">Date of Birth:</span>
                    <span className="value">{student?.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric"}) : "Not provided"}</span>
                  </div>
                </div>
                <div className="detailItem">
                  <span className="icon" style={{ display: 'flex', alignItems: 'center' }}><Phone size={18} style={{ color: "var(--color-primary)" }} /></span>
                  <div>
                    <span className="label">Phone:</span>
                    <span className="value">{student?.phone || "Not provided"}</span>
                  </div>
                </div>
                <div className="detailItem">
                  <span className="icon" style={{ display: 'flex', alignItems: 'center' }}><Mail size={18} style={{ color: "var(--color-primary)" }} /></span>
                  <div>
                    <span className="label">Email:</span>
                    <span className="value">{student?.email || "Not provided"}</span>
                  </div>
                </div>
              </div>

              <hr style={{ margin: "24px 0", border: 'none', borderTop: '1px solid var(--color-surface)' }} />

              <h3 style={{ fontSize: "18px", color: "var(--color-dark)", marginBottom: "16px" }}>Parent Details</h3>
              <div className="detailList">
                <div className="detailItem">
                  <span className="icon" style={{ display: 'flex', alignItems: 'center' }}><Users size={18} style={{ color: "var(--color-primary)" }} /></span>
                  <div>
                    <span className="label">Parent Name:</span>
                    <span className="value">
                      {(`${student?.parent?.firstName || ""} ${student?.parent?.lastName || ""}`).trim() || student?.parentName || "Not provided"}
                    </span>
                  </div>
                </div>
                <div className="detailItem">
                  <span className="icon" style={{ display: 'flex', alignItems: 'center' }}><Phone size={18} style={{ color: "var(--color-primary)" }} /></span>
                  <div>
                    <span className="label">Phone:</span>
                    <span className="value">{student?.parent?.phone || "Not provided"}</span>
                  </div>
                </div>
                <div className="detailItem">
                  <span className="icon" style={{ display: 'flex', alignItems: 'center' }}><Mail size={18} style={{ color: "var(--color-primary)" }} /></span>
                  <div>
                    <span className="label">Email:</span>
                    <span className="value">{student?.parent?.email || "Not provided"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance History Table */}
          <div className="paymentCard card">
            <h3 className="cardTitle">Attendance History</h3>
            
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', margin: '16px 0 24px' }}>
              <div style={{ padding: '16px', background: 'var(--color-surface, #F5F5FC)', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-muted, #A098AE)' }}>Total Classes</span>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-dark, #303972)', margin: '4px 0 0' }}>{pastClasses.length}</p>
              </div>
              <div style={{ padding: '16px', background: 'var(--color-surface, #F5F5FC)', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-muted, #A098AE)' }}>Absences</span>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#c62828', margin: '4px 0 0' }}>{absencesCount}</p>
              </div>
              <div style={{ padding: '16px', background: 'var(--color-surface, #F5F5FC)', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-muted, #A098AE)' }}>Attendance Rate</span>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: attendanceRate >= 80 ? '#2e7d32' : '#d84315', margin: '4px 0 0' }}>{attendanceRate}%</p>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="tableWrapper" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Class Name</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pastClasses.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: '#A098AE' }}>
                        No past attendance records found.
                      </td>
                    </tr>
                  ) : (
                    pastClasses.map((cls) => {
                      const isAbsent = Array.isArray(cls.absentees) && cls.absentees.includes(id);
                      return (
                        <tr key={cls._id}>
                          <td className="boldText">{cls.title}</td>
                          <td>{cls.date}</td>
                          <td style={{ color: "#A098AE" }}>{cls.startTime} - {cls.endTime}</td>
                          <td>
                            <span style={{
                              background: isAbsent ? "#ffebee" : "#e8f5e9",
                              color: isAbsent ? "#c62828" : "#2e7d32",
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "11px",
                              fontWeight: "700"
                            }}>
                              {isAbsent ? "ABSENT" : "PRESENT"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Schedule Sidebar Column */}
        <div className="sideCol">
          <div className="scheduleCard card">
            <h3 className="cardTitle">Schedule Details</h3>
            <p className="scheduleDate">{formattedToday}</p>
            
            <div className="scheduleList" style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ fontSize: "12px", color: "var(--color-primary)", fontWeight: "700", margin: "4px 0" }}>
                TODAY'S CLASSES ({todayClasses.length})
              </p>
              {todayClasses.length > 0 ? (
                todayClasses.map((evt, idx) => (
                  <div key={evt._id || idx} className={`scheduleItem border-${evt.color || "purple"}`}>
                    <h4>{evt.title}</h4>
                    {evt.className && <p>Class: {evt.className}</p>}
                    <div className="timeRow" style={{ display: "flex", gap: 12, fontSize: 12, color: "#A098AE" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12} /> {evt.date}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} /> {evt.startTime} - {evt.endTime}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: "#A098AE", fontSize: "12px", paddingLeft: "4px" }}>No classes scheduled for today.</p>
              )}

              <p style={{ fontSize: "12px", color: "var(--color-primary)", fontWeight: "700", margin: "12px 0 4px", borderTop: "1px solid #f0f0f0", paddingTop: "12px" }}>
                UPCOMING CLASSES ({upcomingClasses.length})
              </p>
              {upcomingClasses.length > 0 ? (
                upcomingClasses.slice(0, 5).map((evt, idx) => (
                  <div key={evt._id || idx} className={`scheduleItem border-${evt.color || "purple"}`}>
                    <h4>{evt.title}</h4>
                    {evt.className && <p>Class: {evt.className}</p>}
                    <div className="timeRow" style={{ display: "flex", gap: 12, fontSize: 12, color: "#A098AE" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12} /> {evt.date}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} /> {evt.startTime} - {evt.endTime}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: "#A098AE", fontSize: "12px", paddingLeft: "4px" }}>No upcoming classes.</p>
              )}
            </div>
            
            <Button 
              variant="ghost" 
              style={{ width: "100%", marginTop: "16px", color: "var(--color-primary)", background: "#F5F5FC" }}
              onClick={() => navigate("/events")}
            >
              View Class Calendar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
