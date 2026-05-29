import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    className: String,
    category: String,
    date: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    attendees: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    }],
    color: {
      type: String,
      default: 'purple',
    },
    description: String,
    location: String,
    type: {
      type: String,
      enum: ['class', 'meeting', 'exam', 'holiday', 'activity'],
      default: 'class',
    },
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    reminderSet: Boolean,
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model('Event', eventSchema);
