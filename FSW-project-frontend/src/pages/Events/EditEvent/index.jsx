import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import eventApi from "../../../api/eventApi";
import studentApi from "../../../api/studentApi";
import teacherApi from "../../../api/teacherApi";
import groupApi from "../../../api/groupApi";
import Button from "../../../components/common/Button";
import { Users, Plus, Check, RefreshCw, Filter, X, Search, SlidersHorizontal } from "lucide-react";
import "../AddEvent/AddEvent.css";

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);

  const [selectedPresetGroup, setSelectedPresetGroup] = useState("");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState("all");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [modalGroupSearch, setModalGroupSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    className: "",
    date: "",
    startTime: "",
    endTime: "",
    teacherId: "",
    attendees: [],
    absentees: [],
    color: "purple",
  });

  useEffect(() => {
    Promise.all([
      eventApi.getById(id),
      studentApi.getAll(),
      teacherApi.getAll(),
      groupApi.getAll(),
    ])
      .then(([event, stu, tch, grps]) => {
        setFormData({
          title: event.title ?? "",
          className: event.className ?? "",
          date: event.date ?? "",
          startTime: event.startTime ?? "",
          endTime: event.endTime ?? "",
          teacherId: event.teacherId ?? "",
          attendees: event.attendees ?? [],
          absentees: event.absentees ?? [],
          color: event.color ?? "purple",
        });
        setStudents(stu);
        setTeachers(tch);
        setGroups(grps || []);
      })
      .catch((err) => toast.error("Failed to load event: " + err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleAttendee = (sid) => {
    setFormData((prev) => ({
      ...prev,
      attendees: prev.attendees.includes(sid)
        ? prev.attendees.filter((a) => a !== sid)
        : [...prev.attendees, sid],
    }));
  };

  const toggleAbsentee = (sid) => {
    setFormData((prev) => ({
      ...prev,
      absentees: prev.absentees.includes(sid)
        ? prev.absentees.filter((a) => a !== sid)
        : [...prev.absentees, sid],
    }));
  };

  const handleAppendGroupStudents = (groupId) => {
    const targetGroup = groups.find((g) => g._id === groupId);
    if (!targetGroup) return;
    const groupStudentIds = (targetGroup.students || []).map((s) => (typeof s === "object" ? s._id : s));
    setFormData((prev) => {
      const merged = Array.from(new Set([...prev.attendees, ...groupStudentIds]));
      return {
        ...prev,
        className: prev.className || targetGroup.name,
        attendees: merged,
      };
    });
    toast.success(`Added ${groupStudentIds.length} students from "${targetGroup.name}"!`);
  };

  const handleReplaceGroupStudents = (groupId) => {
    const targetGroup = groups.find((g) => g._id === groupId);
    if (!targetGroup) return;
    const groupStudentIds = (targetGroup.students || []).map((s) => (typeof s === "object" ? s._id : s));
    setFormData((prev) => ({
      ...prev,
      className: prev.className || targetGroup.name,
      attendees: groupStudentIds,
    }));
    toast.success(`Replaced roster with ${groupStudentIds.length} students from "${targetGroup.name}".`);
  };

  const filteredStudentsForTable = (students || []).filter((s) => {
    if (selectedGroupFilter === "independent") {
      const allGroupStudentIds = new Set(
        groups.flatMap((g) => (g.students || []).map((st) => (typeof st === "object" ? st._id : st)))
      );
      if (allGroupStudentIds.has(s._id)) return false;
    } else if (selectedGroupFilter !== "all") {
      const targetGroup = groups.find((g) => g._id === selectedGroupFilter);
      if (targetGroup) {
        const groupStudentIds = new Set(
          (targetGroup.students || []).map((st) => (typeof st === "object" ? st._id : st))
        );
        if (!groupStudentIds.has(s._id)) return false;
      }
    }

    if (studentSearch.trim()) {
      const search = studentSearch.toLowerCase();
      return (
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(search) ||
        s._id?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.date || !formData.startTime || !formData.endTime) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (formData.endTime <= formData.startTime) {
      toast.error("End time must be after start time.");
      return;
    }
    setSaving(true);
    try {
      await eventApi.update(id, formData);
      toast.success(role === "teacher" ? "Attendance recorded successfully!" : "Class/Event updated successfully!");
      navigate(role === "teacher" ? "/calendar" : "/events");
    } catch (err) {
      toast.error(err.message || "Failed to update.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="stateBox"><div className="spinner" /></div>;

  return (
    <div className="addEventPage">
      <div className="pageHeader">
        <h1 className="pageTitle">
          {role === "teacher" ? "Class Attendance" : "Edit Class / Event"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="addEventForm card">
        {role !== "teacher" && (
          <>
            <section className="formSection">
              <h2 className="sectionTitle">Class / Event Details</h2>
              <div className="formGrid">
                <div className="formGroup">
                  <label>Title *</label>
                  <input required name="title" value={formData.title} onChange={handleChange} />
                </div>
                <div className="formGroup">
                  <label>Class Name</label>
                  <input name="className" value={formData.className} onChange={handleChange} />
                </div>

                <div className="formGroup">
                  <label>Color</label>
                  <select name="color" value={formData.color} onChange={handleChange}>
                    <option value="purple">Purple</option>
                    <option value="orange">Orange</option>
                    <option value="yellow">Yellow</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                  </select>
                </div>
                <div className="formGroup">
                  <label>Date *</label>
                  <input type="date" required name="date" value={formData.date} onChange={handleChange} />
                </div>
                <div className="formGroup">
                  <label>Start Time *</label>
                  <input type="time" required name="startTime" value={formData.startTime} onChange={handleChange} />
                </div>
                <div className="formGroup">
                  <label>End Time *</label>
                  <input type="time" required name="endTime" value={formData.endTime} onChange={handleChange} />
                </div>
              </div>
            </section>

            <section className="formSection">
              <h2 className="sectionTitle">Assign Teacher</h2>
              <div className="formGroup">
                <select name="teacherId" value={formData.teacherId} onChange={handleChange}>
                  <option value="">— Select Teacher —</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.firstName} {t.lastName} {t.subject ? `(${t.subject})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </section>
          </>
        )}

        <section className="formSection">
          <h2 className="sectionTitle">Class Attendance</h2>
          <p className="sectionHint">Mark which students were absent from this class.</p>
          <div className="attendanceWrapper" style={{
            border: "1.5px solid #e0e0e0",
            borderRadius: "8px",
            overflow: "hidden",
            marginTop: "12px",
            background: "#fff"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
              <thead style={{ background: "#f5f5ff" }}>
                <tr>
                  <th style={{ padding: "10px 12px", color: "#303972", borderBottom: "1px solid #e0e0e0" }}>Student ID</th>
                  <th style={{ padding: "10px 12px", color: "#303972", borderBottom: "1px solid #e0e0e0" }}>Name</th>
                  <th style={{ padding: "10px 12px", color: "#303972", borderBottom: "1px solid #e0e0e0", textAlign: "center" }}>Status</th>
                  <th style={{ padding: "10px 12px", color: "#303972", borderBottom: "1px solid #e0e0e0", textAlign: "right" }}>Toggle</th>
                </tr>
              </thead>
              <tbody>
                {students.filter(s => formData.attendees.includes(s._id)).map(s => {
                  const isAbsent = formData.absentees.includes(s._id);
                  return (
                    <tr key={s._id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "10px 12px", color: "#A098AE", fontFamily: "monospace" }}>#{s._id?.slice(-8).toUpperCase()}</td>
                      <td style={{ padding: "10px 12px", color: "#303972", fontWeight: 600 }}>{s.firstName} {s.lastName}</td>
                      <td style={{ padding: "10px 12px", textAlign: "center" }}>
                        <span style={{
                          background: isAbsent ? "#ffebee" : "#e8f5e9",
                          color: isAbsent ? "#c62828" : "#2e7d32",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: "700"
                        }}>
                          {isAbsent ? "ABSENT" : "PRESENT"}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => toggleAbsentee(s._id)}
                          style={{
                            background: isAbsent ? "var(--color-primary, #4D44B5)" : "#f0f0f0",
                            border: "none",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            fontSize: "11px",
                            color: isAbsent ? "#fff" : "#303972",
                            cursor: "pointer",
                            fontWeight: "600",
                            minWidth: "90px"
                          }}
                        >
                          {isAbsent ? "Mark Present" : "Mark Absent"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {students.filter(s => formData.attendees.includes(s._id)).length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: "12px", textAlign: "center", color: "#A098AE" }}>
                      No students are currently assigned to this class. Assign students below to take attendance.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {role !== "teacher" && (
          <section className="formSection">
            <h2 className="sectionTitle">Assign Students</h2>
            <p className="sectionHint">Select a preset group or search & add individual/retake students.</p>

            {/* PRESET GROUP QUICK ASSIGNMENT BOX */}
            <div style={{
              background: "#F8FAFC",
              border: "1.5px dashed #CBD5E1",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "16px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <Users size={18} style={{ color: "#4D44B5" }} />
                <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#303972", margin: 0 }}>
                  Quick Assign by Preset Group (Cohort)
                </h3>
              </div>
              {groups.length === 0 ? (
                <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0 }}>
                  No preset groups available. You can create groups in the Students tab.
                </p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
                  <select
                    value={selectedPresetGroup}
                    onChange={(e) => setSelectedPresetGroup(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #CBD5E1",
                      fontSize: "13px",
                      fontWeight: "500",
                      minWidth: "200px"
                    }}
                  >
                    <option value="">-- Choose a Preset Group --</option>
                    {groups.map((g) => (
                      <option key={g._id} value={g._id}>
                        {g.name} ({g.students?.length || 0} students)
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    disabled={!selectedPresetGroup}
                    onClick={() => handleAppendGroupStudents(selectedPresetGroup)}
                    style={{
                      background: selectedPresetGroup ? "#4D44B5" : "#E2E8F0",
                      color: selectedPresetGroup ? "#FFFFFF" : "#94A3B8",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 14px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: selectedPresetGroup ? "pointer" : "not-allowed",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <Plus size={14} /> Add Group Students (+)
                  </button>

                  <button
                    type="button"
                    disabled={!selectedPresetGroup}
                    onClick={() => handleReplaceGroupStudents(selectedPresetGroup)}
                    style={{
                      background: "none",
                      border: selectedPresetGroup ? "1px solid #4D44B5" : "1px solid #CBD5E1",
                      color: selectedPresetGroup ? "#4D44B5" : "#94A3B8",
                      borderRadius: "8px",
                      padding: "8px 14px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: selectedPresetGroup ? "pointer" : "not-allowed",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <RefreshCw size={14} /> Replace Roster
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: "12px", marginBottom: "12px" }}>
              <input
                type="text"
                placeholder="Search student by name or ID..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                style={{ padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "14px" }}
              />
              <button
                type="button"
                onClick={() => setFilterModalOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                  padding: "10px 14px",
                  border: selectedGroupFilter !== "all" ? "1.5px solid #4D44B5" : "1.5px solid #e0e0e0",
                  background: selectedGroupFilter !== "all" ? "#F5F5FF" : "#ffffff",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: selectedGroupFilter !== "all" ? "#4D44B5" : "#303972",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  overflow: "hidden"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden" }}>
                  <Filter size={15} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                    {selectedGroupFilter === "all" && "Filter: All Students"}
                    {selectedGroupFilter === "independent" && "Filter: Independent"}
                    {selectedGroupFilter !== "all" && selectedGroupFilter !== "independent" && (
                      `Filter: ${groups.find((g) => g._id === selectedGroupFilter)?.name || "Group"}`
                    )}
                  </span>
                </div>
                <SlidersHorizontal size={14} style={{ opacity: 0.6, flexShrink: 0 }} />
              </button>
            </div>

            {filterModalOpen && (
              <div className="filterModalOverlay" onClick={() => setFilterModalOpen(false)}>
                <div className="filterModal" onClick={(e) => e.stopPropagation()}>
                  <div className="filterModalHeader">
                    <h3>
                      <Filter size={18} style={{ color: "#4D44B5" }} />
                      Filter Students by Cohort / Group
                    </h3>
                    <button
                      type="button"
                      onClick={() => setFilterModalOpen(false)}
                      style={{ background: "none", border: "none", cursor: "pointer" }}
                    >
                      <X size={20} color="#a098ae" />
                    </button>
                  </div>

                  <div className="filterModalBody">
                    <div style={{ position: "relative" }}>
                      <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                      <input
                        type="text"
                        placeholder="Search preset groups / cohorts..."
                        value={modalGroupSearch}
                        onChange={(e) => setModalGroupSearch(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px 10px 36px",
                          border: "1.5px solid #e2e8f0",
                          borderRadius: "10px",
                          fontSize: "13px",
                          outline: "none"
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "320px", overflowY: "auto" }}>
                      {(!modalGroupSearch.trim() || "all students".includes(modalGroupSearch.toLowerCase())) && (
                        <div
                          className={`filterModalOption ${selectedGroupFilter === "all" ? "active" : ""}`}
                          onClick={() => {
                            setSelectedGroupFilter("all");
                            setFilterModalOpen(false);
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "14px", color: "#303972" }}>🌐 All Students</div>
                            <div style={{ fontSize: "12px", color: "#94a3b8" }}>Show all registered students directory</div>
                          </div>
                          {selectedGroupFilter === "all" && <Check size={18} color="#4D44B5" />}
                        </div>
                      )}

                      {(!modalGroupSearch.trim() || "independent retake".includes(modalGroupSearch.toLowerCase())) && (
                        <div
                          className={`filterModalOption ${selectedGroupFilter === "independent" ? "active" : ""}`}
                          onClick={() => {
                            setSelectedGroupFilter("independent");
                            setFilterModalOpen(false);
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "14px", color: "#303972" }}>👤 Independent / Retake Students</div>
                            <div style={{ fontSize: "12px", color: "#94a3b8" }}>Students not assigned to any preset cohort</div>
                          </div>
                          {selectedGroupFilter === "independent" && <Check size={18} color="#4D44B5" />}
                        </div>
                      )}

                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", marginTop: "8px", textTransform: "uppercase" }}>
                        Preset Cohorts ({groups.length})
                      </div>

                      {groups
                        .filter((g) => g.name?.toLowerCase().includes(modalGroupSearch.toLowerCase()) || g.grade?.toLowerCase().includes(modalGroupSearch.toLowerCase()))
                        .map((g) => (
                          <div
                            key={g._id}
                            className={`filterModalOption ${selectedGroupFilter === g._id ? "active" : ""}`}
                            onClick={() => {
                              setSelectedGroupFilter(g._id);
                              setFilterModalOpen(false);
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 600, fontSize: "14px", color: "#303972" }}>👥 {g.name}</div>
                              <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                                {g.students?.length || 0} students {g.grade ? `• ${g.grade}` : ""} {g.academicYear ? `(${g.academicYear})` : ""}
                              </div>
                            </div>
                            {selectedGroupFilter === g._id && <Check size={18} color="#4D44B5" />}
                          </div>
                        ))}

                      {groups.filter((g) => g.name?.toLowerCase().includes(modalGroupSearch.toLowerCase()) || g.grade?.toLowerCase().includes(modalGroupSearch.toLowerCase())).length === 0 && modalGroupSearch.trim() && (
                        <div style={{ textAlign: "center", padding: "16px", color: "#94a3b8", fontSize: "13px" }}>
                          No preset groups matching "{modalGroupSearch}"
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="filterModalFooter">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedGroupFilter("all");
                        setFilterModalOpen(false);
                      }}
                      style={{ fontSize: "12px" }}
                    >
                      Reset to All Students
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setFilterModalOpen(false)}
                      style={{ fontSize: "12px" }}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="studentDirectoryTableWrapper" style={{
              maxHeight: "200px",
              overflowY: "auto",
              border: "1.5px solid #e0e0e0",
              borderRadius: "8px",
              marginBottom: "16px"
            }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                <thead style={{ background: "#f5f5ff", position: "sticky", top: 0, zIndex: 1 }}>
                  <tr>
                    <th style={{ padding: "8px 12px", color: "#303972", borderBottom: "1px solid #e0e0e0" }}>Student ID</th>
                    <th style={{ padding: "8px 12px", color: "#303972", borderBottom: "1px solid #e0e0e0" }}>Name</th>
                    <th style={{ padding: "8px 12px", color: "#303972", borderBottom: "1px solid #e0e0e0", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudentsForTable.map(s => {
                    const isAdded = formData.attendees.includes(s._id);
                    return (
                      <tr key={s._id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td style={{ padding: "8px 12px", color: "#A098AE", fontFamily: "monospace" }}>#{s._id?.slice(-9).toUpperCase() || s._id}</td>
                        <td style={{ padding: "8px 12px", color: "#303972", fontWeight: 500 }}>{s.firstName} {s.lastName}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right" }}>
                          <button
                            type="button"
                            onClick={() => toggleAttendee(s._id)}
                            style={{
                              background: isAdded ? "#e8f5e9" : "none",
                              border: isAdded ? "none" : "1px solid var(--color-primary)",
                              borderRadius: "4px",
                              padding: "3px 8px",
                              fontSize: "11px",
                              color: isAdded ? "#2e7d32" : "var(--color-primary)",
                              cursor: "pointer",
                              fontWeight: "600",
                              minWidth: "60px"
                            }}
                          >
                            {isAdded ? "Added ✓" : "+ Add"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredStudentsForTable.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ padding: "12px", textAlign: "center", color: "#A098AE" }}>No matching students found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {formData.attendees.length > 0 && (
              <p className="selectedCount">{formData.attendees.length} student(s) selected for this class roster.</p>
            )}
          </section>
        )}

        <div className="formActions">
          <Button type="button" variant="outline" onClick={() => navigate(role === "teacher" ? "/calendar" : "/events")}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : (role === "teacher" ? "Save Attendance" : "Save Changes")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent;
