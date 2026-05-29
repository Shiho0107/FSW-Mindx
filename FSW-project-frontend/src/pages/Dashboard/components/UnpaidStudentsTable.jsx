import { initials, formatCurrency } from "../../../utils/format";

const UnpaidStudentsTable = ({ students }) => (
  <div className="card">
    <div className="cardHeader">
      <h2 className="cardTitle">Unpaid Student Intuition</h2>
    </div>
    <table className="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>ID</th>
          <th>Class</th>
          <th>Amount</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {students.length === 0 ? (
          <tr>
            <td colSpan={5} style={{ textAlign: "center", color: "#A098AE", padding: "24px" }}>
              No unpaid students found.
            </td>
          </tr>
        ) : (
          students.map((student) => (
            <tr key={student._id}>
              <td>
                <div className="studentCell">
                  <div className="miniAvatar">
                    {initials(`${student.firstName} ${student.lastName}`)}
                  </div>
                  <span>{student.firstName} {student.lastName}</span>
                </div>
              </td>
              <td style={{ color: "#A098AE", fontSize: 13 }}>
                #{student._id?.slice(-9).toUpperCase() || "—"}
              </td>
              <td>{student.grade || "—"}</td>
              <td className="amount">
                {student.tuitionFee != null ? formatCurrency(student.tuitionFee) : "—"}
              </td>
              <td>
                <button
                  style={{
                    background: "none", border: "none",
                    fontSize: 18, cursor: "pointer", color: "#A098AE",
                  }}
                  title="More options"
                >
                  ···
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default UnpaidStudentsTable;
