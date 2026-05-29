import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import eventApi from "../../../api/eventApi";
import studentApi from "../../../api/studentApi";
import teacherApi from "../../../api/teacherApi";
import Button from "../../../components/common/Button";
import "./AddEvent.css";

const AddEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    className: "",
    category: "",
    date: "",
    startTime: "",
    endTime: "",
    teacherId: "",
    attendees: [],
    color: "purple",
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

    setLoading(true);
    try {
      await eventApi.create(formData);
      toast.success("Class/Event created successfully!");
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
              <label>Category</label>
              <input name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Algorithm" />
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
          </div>
        </section>

        <section className="formSection">
          <h2 className="sectionTitle">Assign Teacher *</h2>
          <div className="formGroup">
            <select name="teacherId" value={formData.teacherId} onChange={handleChange} required>
              <option value="">— Select Teacher —</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.firstName} {t.lastName} {t.subject ? `(${t.subject})` : ""}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="formSection">
          <h2 className="sectionTitle">Assign Students</h2>
          <p className="sectionHint">Select which students attend this class.</p>
          <div className="attendeeGrid">
            {students.map((s) => (
              <label key={s._id} className="attendeeItem">
                <input
                  type="checkbox"
                  checked={formData.attendees.includes(s._id)}
                  onChange={() => toggleAttendee(s._id)}
                />
                <span>{s.firstName} {s.lastName}</span>
              </label>
            ))}
            {students.length === 0 && <p style={{ color: "#A098AE" }}>No students found.</p>}
          </div>
          {formData.attendees.length > 0 && (
            <p className="selectedCount">{formData.attendees.length} student(s) selected</p>
          )}
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
