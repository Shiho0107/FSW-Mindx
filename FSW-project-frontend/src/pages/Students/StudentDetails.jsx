import { useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import studentApi from "../../api/studentApi";
import paymentApi from "../../api/paymentApi";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import "./StudentDetails.css";

const StudentDetails = () => {
  const { id } = useParams();

  const { data: student, loading: studentLoading, error: studentError } = useFetch(
    () => studentApi.getById(id),
    [id]
  );

  const { data: payments, loading: paymentLoading } = useFetch(
    () => paymentApi.getByStudent(id),
    [id]
  );

  if (studentLoading) return <div className="stateBox"><div className="spinner" /></div>;
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
                  <span className="icon">🎓</span>
                  <div>
                    <span className="label">Grade:</span>
                    <span className="value">
                      {student?.grade ? <span className={`gradeBadge grade-${student.grade.replace(' ', '-')}`}>{student.grade}</span> : "Not assigned"}
                    </span>
                  </div>
                </div>
                <div className="detailItem">
                  <span className="icon">📅</span>
                  <div>
                    <span className="label">Date of Birth:</span>
                    <span className="value">{student?.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric"}) : "Not provided"}</span>
                  </div>
                </div>
                <div className="detailItem">
                  <span className="icon">📞</span>
                  <div>
                    <span className="label">Phone:</span>
                    <span className="value">{student?.phone || "Not provided"}</span>
                  </div>
                </div>
                <div className="detailItem">
                  <span className="icon">✉️</span>
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
                  <span className="icon">👨‍👩‍👦</span>
                  <div>
                    <span className="label">Parent Name:</span>
                    <span className="value">
                      {(`${student?.parent?.firstName || ""} ${student?.parent?.lastName || ""}`).trim() || student?.parentName || "Not provided"}
                    </span>
                  </div>
                </div>
                <div className="detailItem">
                  <span className="icon">📞</span>
                  <div>
                    <span className="label">Phone:</span>
                    <span className="value">{student?.parent?.phone || "Not provided"}</span>
                  </div>
                </div>
                <div className="detailItem">
                  <span className="icon">✉️</span>
                  <div>
                    <span className="label">Email:</span>
                    <span className="value">{student?.parent?.email || "Not provided"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment History Table */}
          <div className="paymentCard card">
            <h3 className="cardTitle">Payment History</h3>
            {paymentLoading ? (
              <p>Loading payments...</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments?.map((payment) => (
                    <tr key={payment._id}>
                      <td style={{ color: "#A098AE" }}>#{payment._id.slice(-9).toUpperCase()}</td>
                      <td>{new Date(payment.date).toLocaleString()}</td>
                      <td className="amount">${(payment.amount || 0).toLocaleString()}</td>
                      <td><Badge label={payment.status} /></td>
                    </tr>
                  ))}
                  {!payments?.length && (
                    <tr><td colSpan="4">No payment history found.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Schedule Sidebar Column */}
        <div className="sideCol">
          <div className="scheduleCard card">
            <h3 className="cardTitle">Schedule Details</h3>
            <p className="scheduleDate">Thursday, 10th April, 2021</p>

            <div className="scheduleList">
              {/* Hardcoded for now based on UI reference */}
              <div className="scheduleItem border-purple">
                <h4>Basic Algorithm</h4>
                <p>Algorithm</p>
                <div className="timeRow">
                  <span>📅 March 20, 2021</span>
                  <span>⏰ 09:00 - 10:00 AM</span>
                </div>
              </div>
              <div className="scheduleItem border-orange">
                <h4>Basic Art</h4>
                <p>Art</p>
                <div className="timeRow">
                  <span>📅 March 20, 2021</span>
                  <span>⏰ 09:00 - 10:00 AM</span>
                </div>
              </div>
              <div className="scheduleItem border-yellow">
                <h4>HTML & CSS Class</h4>
                <p>Programming</p>
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

export default StudentDetails;
