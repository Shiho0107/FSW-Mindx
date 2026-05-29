import useFetch from "../../hooks/useFetch";
import financeApi from "../../api/financeApi";
import statApi from "../../api/statApi";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import "./Finance.css";

const STAT_CARDS = [
  { key: "totalStudents", label: "Total Students",  color: "purple", trend: "+10%", trendColor: "success" },
  { key: "totalTeachers", label: "Total Teachers",  color: "orange", trend: "-0.5%", trendColor: "danger" },
  { key: "schoolBalance", label: "School Balance",  color: "deepBlue", prefix: "$", trend: "+23%", trendColor: "success" }
];

const Finance = () => {
  const { data: stats, loading: statsLoading } = useFetch(statApi.getStats, []);
  
  // Expenses API isn't built alongside payments fully, so mock or assume the envelope structure unwrapping provides it.
  const { data: expenses, loading: expensesLoading } = useFetch(financeApi.getExpenses, []);

  if (statsLoading || expensesLoading) return <div className="stateBox"><div className="spinner" /></div>;

  return (
    <div className="financePage">
      <div className="pageHeader">
        <h1 className="pageTitle">Finance</h1>
        <Button variant="primary">Download Report</Button>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="statGrid financeGrid">
        {STAT_CARDS.map(({ key, label, color, prefix, trend, trendColor }) => (
          <div className="statCard" key={key}>
            <div className="statInfoBlock">
              <span className="statLabel">{label}</span>
              <p className="statValue">
                {prefix}{stats?.[key]?.toLocaleString() || "—"}
              </p>
              <div className={`statTrend trend--${trendColor}`}>
                {trend} than last month
              </div>
            </div>
            <div className={`statIcon ${color}`}>📊</div>
          </div>
        ))}
      </div>

      <div className="contentGrid">
        <div className="card fullSpan">
          <div className="cardHeader">
            <h2 className="cardTitle">Balance Analytics</h2>
            <select className="dateFilter"><option>Month</option></select>
          </div>
          <div className="chartPlaceholder">
            {/* Chart placeholder: integrate Recharts or Chart.js here typically */}
            <div className="dummyChartBars">
              <div className="bar groupA" style={{ height: "40%" }}></div>
              <div className="bar groupB" style={{ height: "60%" }}></div>
              <div className="bar groupA" style={{ height: "70%" }}></div>
              <div className="bar groupB" style={{ height: "50%" }}></div>
              <div className="bar groupA" style={{ height: "90%" }}></div>
              <div className="bar groupB" style={{ height: "80%" }}></div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="cardTitle">Unpaid Student Intuition</h2>
          <p className="cardSubtext">Matches Dashboard Table implementation.</p>
        </div>

        <div className="card">
          <div className="cardHeader">
            <h2 className="cardTitle">School Expense</h2>
          </div>
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
              {expenses?.slice(0, 5).map(exp => (
                <tr key={exp._id}>
                  <td style={{ color: "#A098AE" }}>#{exp._id.slice(-9).toUpperCase()}</td>
                  <td>{new Date(exp.date).toLocaleDateString()}</td>
                  <td className="amount">${exp.amount?.toLocaleString()}</td>
                  <td><Badge label={exp.status} /></td>
                </tr>
              ))}
              {!expenses?.length && <tr><td colSpan="4" style={{textAlign: "center"}}>No expenses recorded.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Finance;
