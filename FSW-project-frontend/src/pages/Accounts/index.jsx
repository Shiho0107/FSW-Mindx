import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import useFetch from "../../hooks/useFetch";
import accountApi from "../../api/accountApi";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { SkeletonCard } from "../../components/common/Skeleton";
import { Trash2, Edit } from "lucide-react";
import { hashPassword } from "../../utils/hashPassword";
import Button from "../../components/common/Button";
import SearchBar from "../../components/common/SearchBar";
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

  const [searchTerm, setSearchTerm] = useState("");

  const filteredAccounts = useMemo(() => {
    if (!searchTerm.trim()) return accounts;
    const lower = searchTerm.toLowerCase();
    return accounts.filter(acc => 
      acc.name?.toLowerCase().includes(lower) || 
      acc.email?.toLowerCase().includes(lower) ||
      acc.role?.toLowerCase().includes(lower)
    );
  }, [accounts, searchTerm]);

  const [editingAccount, setEditingAccount] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "",
    password: ""
  });

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

  const handleStartEdit = (acc) => {
    setEditingAccount(acc);
    setEditForm({
      name: acc.name ?? "",
      email: acc.email ?? "",
      role: acc.role ?? "student",
      password: ""
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.email.trim()) {
      toast.error("Email is required.");
      return;
    }
    
    try {
      const updateData = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
      };
      
      if (editForm.password.trim()) {
        updateData.passwordHash = await hashPassword(editForm.password);
      }
      
      const updated = await accountApi.update(editingAccount._id, updateData);
      
      // Update local state
      setLocalData((prev) => {
        const sourceList = prev.length ? prev : (fetched ?? []);
        return sourceList.map((a) => (a._id === editingAccount._id ? { ...a, ...updated } : a));
      });
      
      toast.success("Account updated successfully!");
      setEditingAccount(null);
    } catch (err) {
      toast.error(err.message || "Failed to update account.");
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
        <span style={{ fontSize: 13, color: "#A098AE" }}>{filteredAccounts.length} account(s)</span>
      </div>

      <div className="card tableCard">
        <div className="tableControls" style={{ padding: "20px 24px 0" }}>
          <SearchBar 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Search accounts..." 
            className="accountSearch"
          />
        </div>
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
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="emptyTable">
                    No accounts found.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => {
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
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <button
                            onClick={() => handleStartEdit(acc)}
                            title="Edit account"
                            style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 4 }}
                          >
                            <Edit size={16} style={{ color: "var(--color-primary, #4D44B5)" }} />
                          </button>
                          <button
                            onClick={() => handleDelete(acc._id)}
                            title="Delete account"
                            style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 4 }}
                          >
                            <Trash2 size={16} style={{ color: "var(--color-danger)" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingAccount && (
        <div className="modalOverlay" style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.4)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div className="card modalContent" style={{
            width: "100%",
            maxWidth: "450px",
            padding: "24px",
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
          }}>
            <h3 style={{ fontSize: "18px", color: "#303972", fontWeight: 700, marginBottom: "16px" }}>Edit Account</h3>
            <form onSubmit={handleSaveEdit}>
              <div className="formGroup" style={{ marginBottom: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#303972", textAlign: "left" }}>Name</label>
                <input 
                  type="text" 
                  value={editForm.name} 
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", color: "#303972" }}
                />
              </div>
              <div className="formGroup" style={{ marginBottom: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#303972", textAlign: "left" }}>Email *</label>
                <input 
                  type="email" 
                  required
                  value={editForm.email} 
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", color: "#303972" }}
                />
              </div>
              <div className="formGroup" style={{ marginBottom: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#303972", textAlign: "left" }}>Role</label>
                <select 
                  value={editForm.role} 
                  onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                  style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", color: "#303972", background: "#fff" }}
                >
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div className="formGroup" style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#303972", textAlign: "left" }}>New Password</label>
                <input 
                  type="password" 
                  placeholder="Leave blank to keep current password" 
                  value={editForm.password} 
                  onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                  style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", color: "#303972" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <Button type="button" variant="outline" onClick={() => setEditingAccount(null)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
