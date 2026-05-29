import mongoose from 'mongoose';

const financeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    type: {
      type: String,
      enum: ['tuition', 'fee', 'scholarship', 'refund'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: String,
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue', 'cancelled'],
      default: 'pending',
    },
    dueDate: Date,
    paidDate: Date,
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model('Finance', financeSchema);
