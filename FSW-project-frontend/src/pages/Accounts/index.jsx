import { useState } from "react";
import { toast } from "react-toastify";
import useFetch from "../../hooks/useFetch";
import accountApi from "../../api/accountApi";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { SkeletonCard } from "../../components/common/Skeleton";
import "./Accounts.css";

// Accounts fetched from mock API /accounts.
// passwordHash field is never displayed.

const ROLE_COLORS = {
  admin:   { bg: "#ede9ff", color: "#4D44B5" },
  teacher: { bg: "#fff3e0", color: "#f57c00" },
  student: { bg: "#e8f5e9", color: "#2e7d32" },
};

const Accounts = () => {
  const [localData, setLocalData] = useState([]);
  const onSuccess = (d) => setLocalData(d);
  const { data: fetched, loading, error } = useFetch(accountApi.getAll, [], onSuccess);
  const accounts = localData.length ? localData : (fetched ?? []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this account? The profile will NOT be deleted.")) return;
    try {
      await accountApi.remove(id);
      setLocalData((prev) => prev.filter((a) => a._id !== id));
      toast.success("Account deleted.");
    } catch (err) {
      toast.error("Failed to delete: " + err.message);
    }
  };

  if (error) return <LoadingSpinner message="Failed to load accounts." />;
  if (loading && !localData.length) {
    return (
      <div className="accountsPage">
        {Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div className="accountsPage">
      <div className="pageHeader">
        <h1 className="pageTitle">Accounts</h1>
        <span style={{ fontSize: 13, color: "#A098AE" }}>{accounts.length} account(s)</span>
      </div>

      <div className="card tableCard">
        <div className="tableWrapper">
          <table className="table dataTable">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Profile ID</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="emptyTable">
                    No accounts found. Go to Login to seed admin.
                  </td>
                </tr>
              ) : (
                accounts.map((acc) => {
                  const rc = ROLE_COLORS[acc.role] ?? ROLE_COLORS.admin;
                  return (
                    <tr key={acc._id}>
                      <td className="boldText">{acc.name ?? "—"}</td>
                      <td className="mutedText">{acc.email}</td>
                      <td>
                        <span style={{
                          background: rc.bg,
                          color: rc.color,
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}>
                          {acc.role}
                        </span>
                      </td>
                      <td className="mutedText" style={{ fontFamily: "monospace", fontSize: 12 }}>
                        {acc.linkedProfileId
                          ? `#${String(acc.linkedProfileId).slice(-8).toUpperCase()}`
                          : "—"}
                      </td>
                      {/* passwordHash intentionally not shown */}
                      <td>
                        <button
                          onClick={() => handleDelete(acc._id)}
                          title="Delete account"
                          style={{ fontSize: 16, color: "var(--color-danger)", background: "none", border: "none", cursor: "pointer" }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Accounts;
