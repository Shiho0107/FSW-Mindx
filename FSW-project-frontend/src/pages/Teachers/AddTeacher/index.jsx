import { useState } from "react";
import { toast } from "react-toastify";
import teacherApi from "../../../api/teacherApi";
import useAccountCreate from "../../../hooks/useAccountCreate";
import Button from "../../../components/common/Button";
import "./AddTeacher.css";

// Assignment demo — accounts stored on mock API /accounts with SHA-256 hashed passwords.

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[0-9]{10,15}$/;

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  dateOfBirth: "",
  placeOfBirth: "",
  education: [{ degree: "", university: "", city: "", startDate: "", endDate: "" }],
};

const AddTeacher = () => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const { createAccount } = useAccountCreate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("education.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        education: [{ ...prev.education[0], [field]: value }],
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Please enter a valid phone number (10-15 digits, optional +).");
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    const currentMonth = today.substring(0, 7);
    if (formData.dateOfBirth > today) {
      toast.error("Date of Birth cannot be in the future.");
      return;
    }
    const edu = formData.education[0];
    if (edu.startDate > currentMonth) {
      toast.error("Education Start Date cannot be in the future.");
      return;
    }
    if (edu.endDate && edu.endDate < edu.startDate) {
      toast.error("Education End Date must be after the Start Date.");
      return;
    }

    setLoading(true);
    try {
      // 1. Create teacher profile on mock API
      const createdTeacher = await teacherApi.create(formData);
      const profileId = createdTeacher?._id;

      // 2. Create login account on mock API /accounts with hashed password
      await createAccount({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: "teacher",
        profileId,
      });

      setFormData(EMPTY_FORM);
    } catch (err) {
      toast.error(err.message || "Failed to create teacher.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addTeacherPage">
      <h1 className="pageTitle">Add New Teacher</h1>

      <form onSubmit={handleSubmit} className="addTeacherForm">
        {/* Personal Details Section */}
        <section className="formSection">
          <h2 className="sectionTitle">Personal Details</h2>
          <div className="formGrid">
            <div className="formGroup">
              <label>First Name *</label>
              <input required name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Maria" />
            </div>
            <div className="formGroup">
              <label>Last Name *</label>
              <input required name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Historia" />
            </div>
            <div className="formGroup">
              <label>Email *</label>
              <input type="email" required name="email" value={formData.email} onChange={handleChange} placeholder="Historia@mail.com" />
            </div>
            <div className="formGroup">
              <label>Phone *</label>
              <input type="tel" required name="phone" value={formData.phone} onChange={handleChange} placeholder="+1234567890" />
            </div>
            <div className="formGroup fullWidth">
              <label>Address *</label>
              <textarea required name="address" value={formData.address} onChange={handleChange} placeholder="Lorem ipsum..." rows="4" />
            </div>
            <div className="formGroup fullWidth">
              <label>Photo *</label>
              <div className="fileUploadPlaceholder">
                <p>Drag and drop or click here to select file</p>
              </div>
            </div>
            <div className="formGroup">
              <label>Date of Birth *</label>
              <input type="date" required name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} max={new Date().toISOString().split("T")[0]} />
            </div>
            <div className="formGroup">
              <label>Place of Birth *</label>
              <input required name="placeOfBirth" value={formData.placeOfBirth} onChange={handleChange} placeholder="Jakarta, Indonesia" />
            </div>
          </div>
        </section>

        {/* Education Section */}
        <section className="formSection">
          <h2 className="sectionTitle">Education</h2>
          <div className="formGrid">
            <div className="formGroup">
              <label>University *</label>
              <input required name="education.university" value={formData.education[0].university} onChange={handleChange} placeholder="University Akademi Historia" />
            </div>
            <div className="formGroup">
              <label>Degree *</label>
              <input required name="education.degree" value={formData.education[0].degree} onChange={handleChange} placeholder="History Major" />
            </div>
            <div className="formGroup">
              <label>Start Date *</label>
              <input type="month" required name="education.startDate" value={formData.education[0].startDate} onChange={handleChange} max={new Date().toISOString().substring(0, 7)} />
            </div>
            <div className="formGroup">
              <label>End Date *</label>
              <input type="month" required name="education.endDate" value={formData.education[0].endDate} onChange={handleChange} min={formData.education[0].startDate} />
            </div>
            <div className="formGroup">
              <label>City *</label>
              <input required name="education.city" value={formData.education[0].city} onChange={handleChange} placeholder="Yogyakarta, Indonesia" />
            </div>
          </div>
        </section>

        <div className="formActions">
          <Button type="button" variant="outline">Save as Draft</Button>
          <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Submit"}</Button>
        </div>
      </form>
    </div>
  );
};

export default AddTeacher;
