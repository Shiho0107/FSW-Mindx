import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    grade: {
      type: String,
      default: '',
    },
    academicYear: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Group', groupSchema);
