import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  Calendar, 
  KeyRound, 
  User, 
  MessageSquare,
  LogOut 
} from "lucide-react";
import "./Sidebar.css";

const ADMIN_NAV = [
  { to: "/",          label: "Dashboard",      icon: LayoutDashboard, end: true },
  { to: "/students",  label: "Students",       icon: GraduationCap },
  { to: "/teachers",  label: "Teachers",       icon: Users },
  { to: "/events",    label: "Class Schedule", icon: Calendar },
  { to: "/messages",  label: "Messages",       icon: MessageSquare },
  { to: "/accounts",  label: "Accounts",       icon: KeyRound },
  { to: "/user",      label: "User",           icon: User },
];

const STUDENT_NAV = [
  { to: "/calendar",  label: "My Calendar",   icon: Calendar },
  { to: "/messages",  label: "Messages",       icon: MessageSquare },
  { to: "/user",      label: "User",           icon: User },
];

const TEACHER_NAV = [
  { to: "/calendar",  label: "My Classes",    icon: Calendar },
  { to: "/messages",  label: "Messages",       icon: MessageSquare },
  { to: "/user",      label: "User",           icon: User },
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
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              ["navItem", isActive ? "active" : ""].filter(Boolean).join(" ")
            }
          >
            <span className="navIcon"><Icon size={20} /></span>
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
            <LogOut size={20} />
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
