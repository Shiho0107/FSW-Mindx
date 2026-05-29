import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    }],
    name: String,
    isGroup: {
      type: Boolean,
      default: false,
    },
    lastMessage: String,
    lastMessageAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Conversation', conversationSchema);
