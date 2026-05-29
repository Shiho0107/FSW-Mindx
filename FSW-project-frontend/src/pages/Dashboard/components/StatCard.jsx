const StatCard = ({ label, value, icon, color }) => (
  <div className="statCard">
    <div className={`statIcon ${color}`}>{icon}</div>
    <div>
      <p className="statValue">{value}</p>
      <p className="statLabel">{label}</p>
    </div>
  </div>
);

export default StatCard;
