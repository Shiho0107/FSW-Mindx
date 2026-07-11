import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import { AlertTriangle } from "lucide-react";
import "./Login.css";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [showSeed, setShowSeed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!password.trim()) {
      toast.error("Password cannot be empty.");
      return;
    }
    setLoading(true);
    setShowSeed(false);
    try {
      const session = await login(email, password);
      toast.success(`Welcome, ${session.name}!`);
      navigate(session.role === "admin" ? "/" : "/calendar", { replace: true });
    } catch (err) {
      const msg = err.message || "Login failed.";
      toast.error(msg);
      // Show seed button if accounts not initialized
      if (
        msg.toLowerCase().includes("not initialized") ||
        msg.toLowerCase().includes("no accounts")
      ) {
        setShowSeed(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Admin bootstrap — POSTs hashed admin account to /accounts on mock API
  const handleSeedAdmin = async () => {
    setSeeding(true);
    try {
      const res = await authService.seedAdmin();
      if (res.alreadyExists) {
        toast.info("Admin account already exists. Try: admin@school.com / admin123");
      } else {
        toast.success("Admin account created on mock API!");
        setEmail("admin@school.com");
        setPassword("admin123");
      }
      setShowSeed(false);
    } catch (err) {
      toast.error("Seed failed: " + (err.message || "Unknown error"));
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="loginPage">
      <div className="loginCard">
        <div className="loginBrand">
          <div className="loginBrandIcon">A</div>
          <span className="loginBrandName">Akademi</span>
        </div>
        <h1 className="loginTitle">Sign In</h1>
        <p className="loginSubtitle">School Management System</p>

        {showSeed && (
          <div className="seedBox">
            <p className="seedTitle" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={18} /> First-time setup
            </p>
            <p className="seedDesc">
              Accounts not initialized. Click below to create the default admin
              account on the mock API.
            </p>
            {/* Admin bootstrap — POSTs to /accounts on mock API, hashed password, not production auth */}
            <button className="seedBtn" onClick={handleSeedAdmin} disabled={seeding}>
              {seeding ? "Creating…" : "Create Admin Account"}
            </button>
            <p className="seedNote">
              After seeding: <code>admin@school.com</code> / <code>admin123</code>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="loginForm">
          <div className="loginGroup">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.com"
              required
              autoFocus
            />
          </div>
          <div className="loginGroup">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="loginBtn" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="loginHint">
          Default password for staff: <code>firstname.lastname</code> (lowercase).
          Contact your admin if you cannot log in.
        </p>
      </div>
    </div>
  );
};

export default Login;
