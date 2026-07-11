import { useParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import useFetch from "../../hooks/useFetch";
import teacherApi from "../../api/teacherApi";
import eventApi from "../../api/eventApi";
import Button from "../../components/common/Button";
import { MapPin, Phone, Mail, Calendar, Clock } from "lucide-react";
import "./TeacherDetails.css"; // Reuse similar structure to student

const TeacherDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: teacher, loading: teacherLoading, error: teacherError } = useFetch(
    () => teacherApi.getById(id),
    [id]
  );

  const { data: allEvents, loading: eventsLoading } = useFetch(eventApi.getAll, []);

  const teacherEvents = useMemo(() => {
    if (!allEvents) return [];
    return allEvents.filter(e => e.teacherId === id);
  }, [allEvents, id]);

  const { todayClasses, upcomingClasses } = useMemo(() => {
    const todayDate = new Date();
    const yyyy = todayDate.getFullYear();
    const mm = String(todayDate.getMonth() + 1).padStart(2, "0");
    const dd = String(todayDate.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const todayList = [];
    const upcomingList = [];

    teacherEvents.forEach(evt => {
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
      return (a.startTime || "").localeCompare(b.startTime || "");
    });

    return { todayClasses: todayList, upcomingClasses: upcomingList };
  }, [teacherEvents]);

  const formattedToday = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }, []);

  if (teacherLoading || eventsLoading) return <div className="stateBox"><div className="spinner" /></div>;
  if (teacherError || !teacher) return <div className="stateBox errorMsg">Failed to load teacher.</div>;

  return (
    <div className="teacherDetailsPage">
      <h1 className="pageTitle">Teacher Details</h1>

      <div className="contentGrid">
        <div className="mainCol">
          <div className="profileCard">
            <div className="profileBanner">
              <div className="profileAvatar">
                {teacher.firstName?.[0]}{teacher.lastName?.[0]}
              </div>
            </div>
            <div className="profileInfoBlock">
              <h2 className="profileName">{teacher.firstName} {teacher.lastName}</h2>
              <p className="profileRole">{teacher.subject} Teacher</p>
              
              <div className="detailList">
                <div className="detailItem">
                  <span className="icon" style={{ display: 'flex', alignItems: 'center' }}><MapPin size={18} style={{ color: "var(--color-primary)" }} /></span>
                  <div>
                    <span className="label">Location:</span>
                    <span className="value">{teacher.address}</span>
                  </div>
                </div>
                <div className="detailItem">
                  <span className="icon" style={{ display: 'flex', alignItems: 'center' }}><Phone size={18} style={{ color: "var(--color-primary)" }} /></span>
                  <div>
                    <span className="label">Phone:</span>
                    <span className="value">{teacher.phone}</span>
                  </div>
                </div>
                <div className="detailItem">
                  <span className="icon" style={{ display: 'flex', alignItems: 'center' }}><Mail size={18} style={{ color: "var(--color-primary)" }} /></span>
                  <div>
                    <span className="label">Email:</span>
                    <span className="value">{teacher.email}</span>
                  </div>
                </div>
              </div>

              {/* Specific to teacher */}
              <div className="aboutSection">
                <h3>About</h3>
                <p>{teacher.about || "No description provided."}</p>
              </div>

              <div className="aboutSection">
                <h3>Education</h3>
                <ul>
                  {teacher.education?.map((edu, idx) => (
                    <li key={idx}>
                      <strong>{edu.degree}</strong>, {edu.university} ({edu.startDate} - {edu.endDate})
                    </li>
                  ))}
                </ul>
              </div>

              <div className="aboutSection">
                <h3>Expertise</h3>
                <p>{teacher.expertise?.join(", ")}</p>
              </div>
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

export default TeacherDetails;
