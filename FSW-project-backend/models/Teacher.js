import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema(
  {
    degree: String,
    university: String,
    city: String,
    startDate: String,
    endDate: String,
  },
  { _id: false }
);

const teacherSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    phone: String,
    address: String,
    dateOfBirth: Date,
    placeOfBirth: String,
    education: [educationSchema],
    photo: String,
    subject: String,
    avatar: String,
    qualifications: String,
    experience: Number,
    department: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'on-leave'],
      default: 'active',
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model('Teacher', teacherSchema);
