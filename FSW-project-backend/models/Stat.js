import mongoose from 'mongoose';

const statSchema = new mongoose.Schema(
  {
    metric: {
      type: String,
      required: true,
      enum: ['total_students', 'total_teachers', 'total_events', 'revenue', 'attendance_rate'],
    },
    value: {
      type: Number,
      required: true,
    },
    previousValue: Number,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: 'daily',
    },
    details: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.model('Stat', statSchema);
