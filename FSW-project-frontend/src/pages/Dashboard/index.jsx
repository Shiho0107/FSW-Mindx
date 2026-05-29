import { useState, useEffect, useMemo } from "react";
import statApi from "../../api/statApi";
import studentApi from "../../api/studentApi";
import teacherApi from "../../api/teacherApi";
import eventApi from "../../api/eventApi";
import foodApi from "../../api/foodApi";
import StatCard from "./components/StatCard";
import UnpaidStudentsTable from "./components/UnpaidStudentsTable";
import RecentStudentsList from "./components/RecentStudentsList";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import "./Dashboard.css";

/**
 * Dashboard — fetches all counts in parallel via Promise.allSettled.
 * Each card falls back gracefully if its individual API fails.
 * Stats card order: Students → Teachers → Events → Foods.
 */

const Dashboard = () => {
  const [stats,    setStats]    = useState(null);
  const [students, setStudents] = useState([]);
  const [counts,   setCounts]   = useState({});  // { teachers, events, foods }
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);

      // Fetch all concurrently — individual failures do not abort the rest
      const [statsRes, studentsRes, teachersRes, eventsRes, foodsRes] =
        await Promise.allSettled([
          statApi.getStats(),
          studentApi.getAll(),
          teacherApi.getAll(),
          eventApi.getAll(),
          foodApi.getAll(),
        ]);

      if (cancelled) return;

      if (statsRes.status === "fulfilled")   setStats(statsRes.value);
      if (studentsRes.status === "fulfilled") setStudents(Array.isArray(studentsRes.value) ? studentsRes.value : []);

      // Collect direct counts — these override statApi values which may be stale
      const directCounts = {};
      if (teachersRes.status === "fulfilled" && Array.isArray(teachersRes.value))
        directCounts.teachers = teachersRes.value.length;
      if (eventsRes.status === "fulfilled" && Array.isArray(eventsRes.value))
        directCounts.events = eventsRes.value.length;
      if (foodsRes.status === "fulfilled" && Array.isArray(foodsRes.value))
        directCounts.foods = foodsRes.value.length;

      setCounts(directCounts);
      setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, []);

  // ── Derived values ───────────────────────────────────────────────────────────
  const statCardValues = useMemo(() => ({
    totalStudents: counts.students ?? stats?.totalStudents ?? students.length ?? null,
    totalTeachers: counts.teachers ?? stats?.totalTeachers ?? null,
    totalEvents:   counts.events   ?? stats?.totalEvents   ?? null,
    totalFoods:    counts.foods    ?? null,  // always use direct food count
  }), [stats, students, counts]);

  // Latest 5 students sorted by createdAt desc
  const recentStudents = useMemo(
    () =>
      [...students]
        .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
        .slice(0, 5),
    [students]
  );

  // Students with no payment data — show empty table since no finance API
  const unpaidStudents = useMemo(
    () => [],
    []
  );

  const STAT_CARDS = [
    { key: "totalStudents", label: "Students",  icon: "👨‍🎓", color: "purple"   },
    { key: "totalTeachers", label: "Teachers",  icon: "👩‍🏫", color: "orange"   },
    { key: "totalEvents",   label: "Classes",   icon: "📅",  color: "yellow"   },
    { key: "totalFoods",    label: "Menu Items", icon: "🍽️", color: "deepBlue" },
  ];

  if (loading) return <LoadingSpinner message="Loading dashboard…" />;

  if (error) {
    return (
      <div className="stateBox">
        <span style={{ fontSize: 28 }}>⚠️</span>
        <p className="errorMsg">Failed to load data</p>
        <p style={{ fontSize: 12, color: "#A098AE" }}>{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="pageHeader">
        <h1 className="pageTitle">Dashboard</h1>
      </div>

      {/* Summary stat cards */}
      <div className="statGrid">
        {STAT_CARDS.map(({ key, label, icon, color }) => {
          const val = statCardValues[key];
          return (
            <StatCard
              key={key}
              label={label}
              icon={icon}
              color={color}
              value={val != null ? val.toLocaleString() : "—"}
            />
          );
        })}
      </div>

      <div className="contentGrid">
        {/* Unpaid table: empty because no finance/payment API exists */}
        <UnpaidStudentsTable students={unpaidStudents} />
        <RecentStudentsList
          students={recentStudents}
          totalStudents={statCardValues.totalStudents ?? students.length}
        />
      </div>
    </>
  );
};

export default Dashboard;
