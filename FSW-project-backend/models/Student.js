import mongoose from 'mongoose';

const parentSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
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
    parentName: String,
    parent: parentSchema,
    paymentMethod: String,
    photo: String,
    class: String,
    avatar: String,
    parentContact: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'graduated'],
      default: 'active',
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model('Student', studentSchema);
