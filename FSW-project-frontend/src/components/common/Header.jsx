import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Search, Bell, LogOut } from "lucide-react";
import "./Header.css";

const ROLE_LABELS = { admin: "Admin", teacher: "Teacher", student: "Student" };

const Header = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const initial = user?.name?.[0]?.toUpperCase() ?? "?";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="header">
      {/* Search */}
      <div className="search">
        <Search size={20} className="searchIcon" style={{ color: "var(--color-muted)" }} />
        <input
          className="searchInput"
          type="text"
          placeholder="Search here..."
          aria-label="Search"
        />
      </div>

      {/* Right actions */}
      <div className="actions">
        <button className="iconBtn" aria-label="Notifications">
          <Bell size={20} style={{ color: "var(--color-muted)" }} />
          <span className="badge" aria-hidden="true" />
        </button>

        {/* User profile */}
        <div className="profile">
          <div className="avatar">{initial}</div>
          <div className="profileInfo">
            <p className="profileName">{user?.name ?? "Guest"}</p>
            <p className="profileRole">{ROLE_LABELS[role] ?? role}</p>
          </div>
        </div>

        {user && (
          <button
            className="iconBtn logoutIconBtn"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={20} />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
