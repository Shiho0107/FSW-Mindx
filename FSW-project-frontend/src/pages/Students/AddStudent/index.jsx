import { useState } from "react";
import { toast } from "react-toastify";
import studentApi from "../../../api/studentApi";
import useAccountCreate from "../../../hooks/useAccountCreate";
import Button from "../../../components/common/Button";
import "./AddStudent.css";

// Assignment demo — accounts stored on mock API /accounts with SHA-256 hashed passwords.

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[0-9]{10,15}$/;

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  placeOfBirth: "",
  parentName: "",
  email: "",
  phone: "",
  address: "",
  parent: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  },
  paymentMethod: "Cash",
};

const AddStudent = () => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const { createAccount } = useAccountCreate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("parent.")) {
      const parentField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        parent: { ...prev.parent, [parentField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailRegex.test(formData.email) || !emailRegex.test(formData.parent.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!phoneRegex.test(formData.phone) || !phoneRegex.test(formData.parent.phone)) {
      toast.error("Please enter a valid phone number (10-15 digits, optional +).");
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    if (formData.dateOfBirth > today) {
      toast.error("Date of Birth cannot be in the future.");
      return;
    }

    setLoading(true);
    try {
      // 1. Create student profile on mock API
      const createdStudent = await studentApi.create(formData);
      const profileId = createdStudent?._id;

      // 2. Create login account on mock API /accounts with hashed password
      await createAccount({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: "student",
        profileId,
      });

      setFormData(EMPTY_FORM);
    } catch (err) {
      toast.error(err.message || "Failed to create student.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addStudentPage">
      <h1 className="pageTitle">Add New Student</h1>

      <form onSubmit={handleSubmit} className="addStudentForm">
        {/* Student Details Section */}
        <section className="formSection">
          <h2 className="sectionTitle">Student Details</h2>
          <div className="formGrid">
            <div className="formGroup fullWidth">
              <label>Photo *</label>
              <div className="fileUploadPlaceholder">
                <p>Drag and drop or click here to select file</p>
              </div>
            </div>
            <div className="formGroup">
              <label>First Name *</label>
              <input required name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Samantha" />
            </div>
            <div className="formGroup">
              <label>Last Name *</label>
              <input required name="lastName" value={formData.lastName} onChange={handleChange} placeholder="William" />
            </div>
            <div className="formGroup">
              <label>Date of Birth *</label>
              <input type="date" required name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} max={new Date().toISOString().split("T")[0]} />
            </div>
            <div className="formGroup">
              <label>Place of Birth *</label>
              <input required name="placeOfBirth" value={formData.placeOfBirth} onChange={handleChange} placeholder="Jakarta" />
            </div>
            <div className="formGroup">
              <label>Parent Name *</label>
              <input required name="parentName" value={formData.parentName} onChange={handleChange} placeholder="Mana William" />
            </div>
            <div className="formGroup">
              <label>Email *</label>
              <input type="email" required name="email" value={formData.email} onChange={handleChange} placeholder="william@mail.com" />
            </div>
            <div className="formGroup">
              <label>Phone *</label>
              <input type="tel" required name="phone" value={formData.phone} onChange={handleChange} placeholder="+1234567890" />
            </div>
            <div className="formGroup fullWidth">
              <label>Address *</label>
              <textarea required name="address" value={formData.address} onChange={handleChange} placeholder="Lorem ipsum..." rows="4" />
            </div>
          </div>
        </section>

        {/* Parent Details Section */}
        <section className="formSection">
          <h2 className="sectionTitle">Parent Details</h2>
          <div className="formGrid">
            <div className="formGroup">
              <label>First Name *</label>
              <input required name="parent.firstName" value={formData.parent.firstName} onChange={handleChange} placeholder="Mana" />
            </div>
            <div className="formGroup">
              <label>Last Name *</label>
              <input required name="parent.lastName" value={formData.parent.lastName} onChange={handleChange} placeholder="William" />
            </div>
            <div className="formGroup">
              <label>Email *</label>
              <input type="email" required name="parent.email" value={formData.parent.email} onChange={handleChange} placeholder="Mana@mail.com" />
            </div>
            <div className="formGroup">
              <label>Phone *</label>
              <input type="tel" required name="parent.phone" value={formData.parent.phone} onChange={handleChange} placeholder="+1234567890" />
            </div>
            <div className="formGroup fullWidth">
              <label>Address *</label>
              <textarea required name="parent.address" value={formData.parent.address} onChange={handleChange} placeholder="Lorem ipsum..." rows="4" />
            </div>
            <div className="formGroup fullWidth">
              <label>Payments *</label>
              <div className="radioGroup">
                <label>
                  <input type="radio" name="paymentMethod" value="Cash" checked={formData.paymentMethod === "Cash"} onChange={handleChange} />
                  Cash
                </label>
                <label>
                  <input type="radio" name="paymentMethod" value="Debit" checked={formData.paymentMethod === "Debit"} onChange={handleChange} />
                  Debit
                </label>
              </div>
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

export default AddStudent;
