import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import eventApi from "../../../api/eventApi";
import studentApi from "../../../api/studentApi";
import teacherApi from "../../../api/teacherApi";
import Button from "../../../components/common/Button";
import "./AddEvent.css";

const getRepeatedDates = (startDateStr, endDateStr, repeatType) => {
  const dates = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return dates;
  }
  
  let current = new Date(start);
  
  while (current <= end) {
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
    
    if (repeatType === "daily") {
      current.setDate(current.getDate() + 1);
    } else if (repeatType === "weekly") {
      current.setDate(current.getDate() + 7);
    } else if (repeatType === "biweekly") {
      current.setDate(current.getDate() + 14);
    } else if (repeatType === "monthly") {
      current.setMonth(current.getMonth() + 1);
    } else {
      break;
    }
    
    if (dates.length >= 100) {
      break;
    }
  }
  
  return dates;
};

const AddEvent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryDate = searchParams.get("date");

  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    className: "",
    date: queryDate || "",
    startTime: "",
    endTime: "",
    teacherId: "",
    attendees: [],
    color: "purple",
    isRepeating: false,
    repeatType: "weekly",
    repeatEndDate: "",
  });

  useEffect(() => {
    studentApi.getAll().then(setStudents).catch(() => {});
    teacherApi.getAll().then(setTeachers).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleAttendee = (id) => {
    setFormData((prev) => ({
      ...prev,
      attendees: prev.attendees.includes(id)
        ? prev.attendees.filter((a) => a !== id)
        : [...prev.attendees, id],
    }));
  };

  const [teacherSearch, setTeacherSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const filteredTeachersForTable = useMemo(() => {
    if (!teacherSearch.trim()) return teachers;
    const search = teacherSearch.toLowerCase();
    return teachers.filter(t => 
      `${t.firstName} ${t.lastName}`.toLowerCase().includes(search) ||
      t.subject?.toLowerCase().includes(search) ||
      t._id?.toLowerCase().includes(search)
    );
  }, [teachers, teacherSearch]);

  const filteredStudentsForTable = useMemo(() => {
    if (!studentSearch.trim()) return students;
    const search = studentSearch.toLowerCase();
    return students.filter(s => 
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(search) ||
      s._id?.toLowerCase().includes(search)
    );
  }, [students, studentSearch]);

  const selectedStudents = useMemo(() => {
    return students.filter(s => formData.attendees.includes(s._id));
  }, [students, formData.attendees]);

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
    if (!formData.teacherId) {
      toast.error("Please assign a teacher.");
      return;
    }
    if (formData.isRepeating && !formData.repeatEndDate) {
      toast.error("Please specify a repeat end date.");
      return;
    }
    if (formData.isRepeating && formData.repeatEndDate < formData.date) {
      toast.error("Repeat end date must be after the start date.");
      return;
    }

    setLoading(true);
    try {
      if (formData.isRepeating && formData.repeatEndDate) {
        const dates = getRepeatedDates(formData.date, formData.repeatEndDate, formData.repeatType);
        
        if (dates.length === 0) {
          toast.error("Invalid repeat date range.");
          setLoading(false);
          return;
        }
        
        if (dates.length > 50) {
          toast.error("Repeat limit exceeded. Please limit repeating classes to under 50 instances (approx. 1 year of weekly classes or 1 semester).");
          setLoading(false);
          return;
        }

        const createPromises = dates.map(d => {
          const payload = {
            title: formData.title,
            className: formData.className,
            startTime: formData.startTime,
            endTime: formData.endTime,
            teacherId: formData.teacherId,
            attendees: formData.attendees,
            color: formData.color,
            date: d,
          };
          return eventApi.create(payload);
        });

        await Promise.all(createPromises);
        toast.success(`Successfully created ${dates.length} repeating classes!`);
      } else {
        const payload = {
          title: formData.title,
          className: formData.className,
          startTime: formData.startTime,
          endTime: formData.endTime,
          teacherId: formData.teacherId,
          attendees: formData.attendees,
          color: formData.color,
          date: formData.date,
        };
        await eventApi.create(payload);
        toast.success("Class/Event created successfully!");
      }
      navigate("/events");
    } catch (err) {
      toast.error(err.message || "Failed to create class/event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addEventPage">
      <div className="pageHeader">
        <h1 className="pageTitle">Add Class / Event</h1>
      </div>

      <form onSubmit={handleSubmit} className="addEventForm card">
        <section className="formSection">
          <h2 className="sectionTitle">Class / Event Details</h2>
          <div className="formGrid">
            <div className="formGroup">
              <label>Title *</label>
              <input required name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Basic Algorithm" />
            </div>
            <div className="formGroup">
              <label>Class Name</label>
              <input name="className" value={formData.className} onChange={handleChange} placeholder="e.g. VII-A" />
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
              <input type="time" required name="endTime" value={formData.endTime} onChange={handleChange} min={formData.startTime} />
            </div>
            <div className="formGroup" style={{ gridColumn: "span 2", display: "flex", flexDirection: "row", alignItems: "center", gap: "8px", marginTop: "8px" }}>
              <input 
                type="checkbox" 
                id="isRepeating" 
                name="isRepeating" 
                checked={formData.isRepeating} 
                onChange={(e) => setFormData(prev => ({ ...prev, isRepeating: e.target.checked }))} 
                style={{ width: "auto", margin: 0, cursor: "pointer" }}
              />
              <label htmlFor="isRepeating" style={{ cursor: "pointer", userSelect: "none" }}>Repeat this class (Daily / Weekly / Semester)?</label>
            </div>
            {formData.isRepeating && (
              <>
                <div className="formGroup">
                  <label>Repeat Frequency</label>
                  <select name="repeatType" value={formData.repeatType} onChange={handleChange}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="formGroup">
                  <label>Repeat End Date *</label>
                  <input 
                    type="date" 
                    required 
                    name="repeatEndDate" 
                    value={formData.repeatEndDate} 
                    onChange={handleChange} 
                    min={formData.date} 
                  />
                </div>
              </>
            )}
          </div>
        </section>

        <section className="formSection">
          <h2 className="sectionTitle">Assign Teacher *</h2>
          <p className="sectionHint">Search and select a teacher for this class.</p>
          
          <div className="formGroup" style={{ marginBottom: "12px" }}>
            <input 
              type="text" 
              placeholder="Search teacher by name, ID or subject..." 
              value={teacherSearch} 
              onChange={(e) => setTeacherSearch(e.target.value)}
              style={{ padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "14px" }}
            />
          </div>

          <div className="teacherDirectoryTableWrapper" style={{
            maxHeight: "180px",
            overflowY: "auto",
            border: "1.5px solid #e0e0e0",
            borderRadius: "8px",
            marginBottom: "16px"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
              <thead style={{ background: "#f5f5ff", position: "sticky", top: 0, zIndex: 1 }}>
                <tr>
                  <th style={{ padding: "8px 12px", color: "#303972", borderBottom: "1px solid #e0e0e0" }}>Teacher ID</th>
                  <th style={{ padding: "8px 12px", color: "#303972", borderBottom: "1px solid #e0e0e0" }}>Name</th>
                  <th style={{ padding: "8px 12px", color: "#303972", borderBottom: "1px solid #e0e0e0" }}>Subject</th>
                  <th style={{ padding: "8px 12px", color: "#303972", borderBottom: "1px solid #e0e0e0", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachersForTable.map(t => {
                  const isSelected = formData.teacherId === t._id;
                  return (
                    <tr key={t._id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "8px 12px", color: "#A098AE", fontFamily: "monospace" }}>#{t._id?.slice(-9).toUpperCase() || t._id}</td>
                      <td style={{ padding: "8px 12px", color: "#303972", fontWeight: 500 }}>{t.firstName} {t.lastName}</td>
                      <td style={{ padding: "8px 12px", color: "#A098AE" }}>{t.subject || "—"}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, teacherId: isSelected ? "" : t._id }))}
                          style={{
                            background: isSelected ? "#e8f5e9" : "none",
                            border: isSelected ? "none" : "1px solid var(--color-primary)",
                            borderRadius: "4px",
                            padding: "3px 8px",
                            fontSize: "11px",
                            color: isSelected ? "#2e7d32" : "var(--color-primary)",
                            cursor: "pointer",
                            fontWeight: "600",
                            minWidth: "75px"
                          }}
                        >
                          {isSelected ? "Selected ✓" : "Select"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredTeachersForTable.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: "12px", textAlign: "center", color: "#A098AE" }}>No matching teachers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="formSection">
          <h2 className="sectionTitle">Assign Students</h2>
          <p className="sectionHint">Search and select students to attend this class.</p>
          
          <div className="formGroup" style={{ marginBottom: "12px" }}>
            <input
              type="text"
              placeholder="Search student by name or ID..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              style={{ padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "14px" }}
            />
          </div>

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

          <label style={{ fontSize: "13px", fontWeight: "600", color: "#303972", display: "block", marginBottom: "8px" }}>
            Selected Students ({selectedStudents.length})
          </label>
          <div className="selectedStudentsList" style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            padding: "12px",
            border: "1.5px solid #f0f0f0",
            borderRadius: "8px",
            background: "#fcfcfc",
            minHeight: "50px"
          }}>
            {selectedStudents.length === 0 ? (
              <span style={{ color: "#A098AE", fontSize: "13px" }}>No students selected yet. Click "+ Add" on students from the list above.</span>
            ) : (
              selectedStudents.map(s => (
                <div 
                  key={s._id} 
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#ede9ff",
                    color: "#4D44B5",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600"
                  }}
                >
                  <span>{s.firstName} {s.lastName}</span>
                  <button 
                    type="button" 
                    onClick={() => toggleAttendee(s._id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#4D44B5",
                      cursor: "pointer",
                      fontSize: "14px",
                      padding: "0 2px",
                      display: "inline-flex",
                      alignItems: "center",
                      fontWeight: "bold",
                      lineHeight: 1
                    }}
                    title="Remove student"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <div className="formActions">
          <Button type="button" variant="outline" onClick={() => navigate("/events")}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Create Class / Event"}</Button>
        </div>
      </form>
    </div>
  );
};

export default AddEvent;
