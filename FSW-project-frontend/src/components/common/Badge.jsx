import "./Badge.css";

/** status: 'complete' | 'pending' | 'canceled' | 'active'
 *  grade:  'VII A' | 'VII B' | 'VII C'  (auto-detected if type='grade')
 */
const Badge = ({ label, type = "status" }) => {
  const cls = type === "grade"
    ? `badge badge--grade-${label?.replace(/\s+/g, "-").toLowerCase()}`
    : `badge badge--${label?.toLowerCase()}`;

  return <span className={cls}>{label}</span>;
};

export default Badge;
