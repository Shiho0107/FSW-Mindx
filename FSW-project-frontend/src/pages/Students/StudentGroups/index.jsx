import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import groupApi from "../../../api/groupApi";
import studentApi from "../../../api/studentApi";
import Button from "../../../components/common/Button";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { Plus, Users, Edit3, Trash2, X, Search, Check } from "lucide-react";
import "./StudentGroups.css";

const StudentGroups = () => {
  const [groups, setGroups] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null); // null for new, group object for edit
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    academicYear: "",
    description: "",
    students: [],
  });

  const [studentSearch, setStudentSearch] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [grpData, stuData] = await Promise.all([
        groupApi.getAll(),
        studentApi.getAll(),
      ]);
      setGroups(grpData || []);
      setAllStudents(stuData || []);
    } catch (err) {
      toast.error("Failed to load preset groups data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingGroup(null);
    setFormData({
      name: "",
      grade: "",
      academicYear: "2025-2026",
      description: "",
      students: [],
    });
    setStudentSearch("");
    setModalOpen(true);
  };

  const openEditModal = (group) => {
    setEditingGroup(group);
    const existingStudentIds = (group.students || []).map((s) => (typeof s === "object" ? s._id : s));
    setFormData({
      name: group.name || "",
      grade: group.grade || "",
      academicYear: group.academicYear || "2025-2026",
      description: group.description || "",
      students: existingStudentIds,
    });
    setStudentSearch("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingGroup(null);
  };

  const toggleStudentSelection = (studentId) => {
    setFormData((prev) => ({
      ...prev,
      students: prev.students.includes(studentId)
        ? prev.students.filter((id) => id !== studentId)
        : [...prev.students, studentId],
    }));
  };

  const handleSelectAllFiltered = (filteredIds) => {
    setFormData((prev) => {
      const allSelected = filteredIds.every((id) => prev.students.includes(id));
      if (allSelected) {
        return {
          ...prev,
          students: prev.students.filter((id) => !filteredIds.includes(id)),
        };
      } else {
        const union = new Set([...prev.students, ...filteredIds]);
        return { ...prev, students: Array.from(union) };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Group name is required.");
      return;
    }

    setSaving(true);
    try {
      if (editingGroup) {
        await groupApi.update(editingGroup._id, formData);
        toast.success("Preset group updated successfully!");
      } else {
        await groupApi.create(formData);
        toast.success("Preset group created successfully!");
      }
      closeModal();
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to save group.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = async (groupId, groupName) => {
    if (!window.confirm(`Are you sure you want to delete group "${groupName}"?`)) return;
    try {
      await groupApi.remove(groupId);
      toast.success(`Group "${groupName}" deleted.`);
      setGroups((prev) => prev.filter((g) => g._id !== groupId));
    } catch (err) {
      toast.error("Failed to delete group: " + err.message);
    }
  };

  const filteredStudentsForModal = useMemo(() => {
    if (!studentSearch.trim()) return allStudents;
    const q = studentSearch.toLowerCase();
    return allStudents.filter(
      (s) =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
        s.class?.toLowerCase().includes(q) ||
        s._id?.toLowerCase().includes(q)
    );
  }, [allStudents, studentSearch]);

  if (loading) return <LoadingSpinner message="Loading preset groups..." />;

  return (
    <div className="studentGroupsContainer">
      <div className="groupsHeader">
        <div>
          <h2>Preset Student Groups (Cohorts)</h2>
          <p style={{ color: "#a098ae", fontSize: "14px", margin: "4px 0 0" }}>
            Organize students into fixed classes or groups for single-click class creation.
          </p>
        </div>
        <Button leftIcon={<Plus size={18} />} variant="primary" onClick={openCreateModal}>
          New Group
        </Button>
      </div>

      {groups.length === 0 ? (
        <div
          className="card"
          style={{
            padding: "48px",
            textAlign: "center",
            color: "#a098ae",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <Users size={48} style={{ opacity: 0.5 }} />
          <h3>No Preset Groups Created Yet</h3>
          <p>Create student groups (e.g. Class 10A, Grade 7-B) to easily add full rosters to your classes!</p>
          <Button leftIcon={<Plus size={18} />} variant="primary" onClick={openCreateModal}>
            Create First Group
          </Button>
        </div>
      ) : (
        <div className="groupsGrid">
          {groups.map((group) => {
            const memberCount = group.students?.length || 0;
            return (
              <div key={group._id} className="groupCard">
                <div className="groupCardHeader">
                  <div className="groupTitleBox">
                    <h3 className="groupTitle">{group.name}</h3>
                    <span className="groupSubtitle">
                      {group.academicYear ? `Academic Year: ${group.academicYear}` : "Standard Preset Cohort"}
                    </span>
                  </div>
                  {group.grade && <span className="groupBadge">{group.grade}</span>}
                </div>

                {group.description && (
                  <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>{group.description}</p>
                )}

                <div className="groupStats">
                  <Users size={16} style={{ color: "#4d44b5" }} />
                  <span>{memberCount} Assigned Student{memberCount === 1 ? "" : "s"}</span>
                </div>

                <div className="studentPreviewList">
                  {memberCount === 0 ? (
                    <span style={{ fontSize: "12px", color: "#a098ae", fontStyle: "italic" }}>
                      No students added to this group yet.
                    </span>
                  ) : (
                    group.students.map((st) => {
                      const name = typeof st === "object" ? `${st.firstName} ${st.lastName}` : st;
                      return (
                        <span key={typeof st === "object" ? st._id : st} className="studentChip">
                          {name}
                        </span>
                      );
                    })
                  )}
                </div>

                <div className="groupCardActions">
                  <Button
                    type="button"
                    variant="outline"
                    leftIcon={<Edit3 size={14} />}
                    onClick={() => openEditModal(group)}
                    style={{ flex: 1, fontSize: "12px", padding: "6px 12px" }}
                  >
                    Manage Roster
                  </Button>
                  <button
                    type="button"
                    onClick={() => handleDeleteGroup(group._id, group.name)}
                    style={{
                      background: "none",
                      border: "1px solid #fee2e2",
                      color: "#ef4444",
                      borderRadius: "8px",
                      padding: "6px 12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                    }}
                    title="Delete Group"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT GROUP MODAL */}
      {modalOpen && (
        <div className="groupModalOverlay">
          <div className="groupModal">
            <div className="groupModalHeader">
              <h3>{editingGroup ? `Edit Group: ${editingGroup.name}` : "Create Preset Student Group"}</h3>
              <button
                type="button"
                onClick={closeModal}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <X size={20} color="#a098ae" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
              <div className="groupModalBody">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="formGroup">
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "#303972" }}>Group Name *</label>
                    <input
                      required
                      placeholder="e.g. Class 10A or Grade 7-B"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ padding: "10px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "14px" }}
                    />
                  </div>
                  <div className="formGroup">
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "#303972" }}>Grade / Level</label>
                    <input
                      placeholder="e.g. Grade 10"
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      style={{ padding: "10px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "14px" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="formGroup">
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "#303972" }}>Academic Year</label>
                    <input
                      placeholder="e.g. 2025-2026"
                      value={formData.academicYear}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      style={{ padding: "10px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "14px" }}
                    />
                  </div>
                  <div className="formGroup">
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "#303972" }}>Description</label>
                    <input
                      placeholder="e.g. Morning cohort for Advanced Science"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      style={{ padding: "10px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "14px" }}
                    />
                  </div>
                </div>

                <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: "8px 0" }} />

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <label style={{ fontSize: "14px", fontWeight: 700, color: "#303972" }}>
                      Assign Students ({formData.students.length} selected)
                    </label>
                    <button
                      type="button"
                      onClick={() => handleSelectAllFiltered(filteredStudentsForModal.map((s) => s._id))}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#4d44b5",
                        fontWeight: 600,
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      {filteredStudentsForModal.length > 0 &&
                      filteredStudentsForModal.every((s) => formData.students.includes(s._id))
                        ? "Deselect All Filtered"
                        : "Select All Filtered"}
                    </button>
                  </div>

                  <div style={{ position: "relative", marginBottom: "12px" }}>
                    <Search
                      size={16}
                      style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#a098ae" }}
                    />
                    <input
                      type="text"
                      placeholder="Search students to include in this group..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      style={{
                        padding: "8px 12px 8px 36px",
                        border: "1.5px solid #e0e0e0",
                        borderRadius: "8px",
                        fontSize: "13px",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      maxHeight: "220px",
                      overflowY: "auto",
                      border: "1.5px solid #e0e0e0",
                      borderRadius: "8px",
                    }}
                  >
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                      <thead style={{ background: "#f8fafc", position: "sticky", top: 0, zIndex: 1 }}>
                        <tr>
                          <th style={{ padding: "8px 12px", width: "40px", textAlignment: "center" }}>Select</th>
                          <th style={{ padding: "8px 12px", textAlign: "left", color: "#303972" }}>Student Name</th>
                          <th style={{ padding: "8px 12px", textAlign: "left", color: "#303972" }}>ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudentsForModal.map((s) => {
                          const isSelected = formData.students.includes(s._id);
                          return (
                            <tr
                              key={s._id}
                              onClick={() => toggleStudentSelection(s._id)}
                              style={{
                                cursor: "pointer",
                                borderBottom: "1px solid #f1f5f9",
                                background: isSelected ? "#f0f7ff" : "transparent",
                              }}
                            >
                              <td style={{ padding: "8px 12px", textAlign: "center" }}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  style={{ cursor: "pointer" }}
                                />
                              </td>
                              <td style={{ padding: "8px 12px", fontWeight: 500, color: "#303972" }}>
                                {s.firstName} {s.lastName}
                              </td>
                              <td style={{ padding: "8px 12px", color: "#a098ae", fontFamily: "monospace" }}>
                                #{s._id?.slice(-8).toUpperCase() || s._id}
                              </td>
                            </tr>
                          );
                        })}
                        {filteredStudentsForModal.length === 0 && (
                          <tr>
                            <td colSpan={3} style={{ padding: "16px", textAlign: "center", color: "#a098ae" }}>
                              No matching students found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="groupModalFooter">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingGroup ? "Update Group" : "Create Group"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentGroups;
