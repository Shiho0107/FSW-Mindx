import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ['cash', 'card', 'bank_transfer', 'wallet'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    transactionId: String,
    relatedFinance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Finance',
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
    },
    receipt: String,
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);
