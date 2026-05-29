import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

const ADMIN_NAV = [
  { to: "/",          label: "Dashboard",      icon: "🏠", end: true },
  { to: "/students",  label: "Students",       icon: "👨‍🎓" },
  { to: "/teachers",  label: "Teachers",       icon: "👩‍🏫" },
  { to: "/events",    label: "Class Schedule", icon: "📅" },
  { to: "/accounts",  label: "Accounts",       icon: "🔑" },
  { to: "/finance",   label: "Finance",        icon: "💰" },
  { to: "/food",      label: "Food",           icon: "🍽️" },
  { to: "/user",      label: "User",           icon: "👤" },
  { to: "/chat",      label: "Chat",           icon: "💬" },
  { to: "/activity",  label: "Latest Activity",icon: "🔔" },
];

const STUDENT_NAV = [
  { to: "/calendar",  label: "My Calendar",   icon: "📅" },
  { to: "/chat",      label: "Chat",          icon: "💬" },
];

const TEACHER_NAV = [
  { to: "/calendar",  label: "My Classes",    icon: "📅" },
  { to: "/chat",      label: "Chat",          icon: "💬" },
];

const Sidebar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const navItems =
    role === "student" ? STUDENT_NAV :
    role === "teacher" ? TEACHER_NAV :
    ADMIN_NAV;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="brand">
        <div className="brandIcon">A</div>
        <span className="brandName">Akademi</span>
      </div>

      {/* Navigation */}
      <nav className="nav">
        {navItems.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              ["navItem", isActive ? "active" : ""].filter(Boolean).join(" ")
            }
          >
            <span className="navIcon">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      {user && (
        <div className="sidebarUser">
          <div className="sidebarUserInfo">
            <span className="sidebarUserName">{user.name}</span>
            <span className="sidebarUserRole">{role}</span>
          </div>
          <button className="logoutBtn" onClick={handleLogout} title="Logout">
            🚪
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="footer">
        <p>Akademi — School Dashboard</p>
      </div>
    </aside>
  );
};

export default Sidebar;
