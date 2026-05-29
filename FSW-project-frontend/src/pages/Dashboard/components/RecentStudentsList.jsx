import { initials } from "../../../utils/format";

const RecentStudentsList = ({ students, totalStudents }) => (
  <div className="card">
    <div className="recentHeader">
      <h2 className="cardTitle">Recent Students</h2>
      <p className="recentSubtitle">
        You have {totalStudents} students
      </p>
    </div>
    <ul className="recentList">
      {students.map((student) => (
        <li key={student._id} className="recentItem">
          <div className="miniAvatar">
            {initials(`${student.firstName} ${student.lastName}`)}
          </div>
          <div className="recentInfo">
            <p className="recentName">{student.firstName} {student.lastName}</p>
            <p className="recentClass">Class {student.grade || "—"}</p>
          </div>
          <button className="mailBtn" title="Send email">✉️</button>
        </li>
      ))}
    </ul>
  </div>
);

export default RecentStudentsList;
