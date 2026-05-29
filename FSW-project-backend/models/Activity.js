import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    type: {
      type: String,
      enum: ['login', 'logout', 'create', 'update', 'delete', 'download'],
      required: true,
    },
    resource: String,
    description: String,
    details: mongoose.Schema.Types.Mixed,
    ipAddress: String,
  },
  { timestamps: true }
);

export default mongoose.model('Activity', activitySchema);
