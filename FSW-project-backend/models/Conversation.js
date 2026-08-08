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
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
    },
    groupAvatar: String,
    lastMessage: String,
    lastMessageAt: Date,
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model('Conversation', conversationSchema);
