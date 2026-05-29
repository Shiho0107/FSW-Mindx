import { useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import teacherApi from "../../api/teacherApi";
import Button from "../../components/common/Button";
import "./TeacherDetails.css"; // Reuse similar structure to student

const TeacherDetails = () => {
  const { id } = useParams();

  const { data: teacher, loading, error } = useFetch(
    () => teacherApi.getById(id),
    [id]
  );

  if (loading) return <div className="stateBox"><div className="spinner" /></div>;
  if (error || !teacher) return <div className="stateBox errorMsg">Failed to load teacher.</div>;

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
                  <span className="icon">📍</span>
                  <div>
                    <span className="label">Location:</span>
                    <span className="value">{teacher.address}</span>
                  </div>
                </div>
                <div className="detailItem">
                  <span className="icon">📞</span>
                  <div>
                    <span className="label">Phone:</span>
                    <span className="value">{teacher.phone}</span>
                  </div>
                </div>
                <div className="detailItem">
                  <span className="icon">✉️</span>
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
            <p className="scheduleDate">Thursday, 10th April, 2021</p>
            <div className="scheduleList">
              <div className="scheduleItem border-purple">
                <h4>World History</h4>
                <p>Class VII-B</p>
                <div className="timeRow">
                  <span>📅 March 20, 2021</span>
                  <span>⏰ 09:00 - 10:00 AM</span>
                </div>
              </div>
              <div className="scheduleItem border-orange">
                <h4>Ancient History</h4>
                <p>Class VII-A</p>
                <div className="timeRow">
                  <span>📅 March 20, 2021</span>
                  <span>⏰ 09:00 - 10:00 AM</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" style={{ width: "100%", marginTop: "16px", color: "var(--color-primary)", background: "#F5F5FC" }}>
              View More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetails;
