import Conversation from '../models/Conversation.js';
import Account from '../models/Account.js';

export default {
  // GET all conversations (filtered by participant userId if provided)
  getAll: async (req, res) => {
    try {
      const { userId } = req.query;
      const filter = userId ? { participants: userId } : {};
      const conversations = await Conversation.find(filter)
        .populate('participants', 'name email role avatar')
        .sort({ lastMessageAt: -1, updatedAt: -1 });
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // GET single conversation
  getById: async (req, res) => {
    try {
      const conversation = await Conversation.findById(req.params.id)
        .populate('participants', 'name email role avatar');
      if (!conversation) return res.status(404).json({ error: 'Not found' });
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // GET or CREATE direct (1-on-1) conversation between current user and target user
  getOrCreateDirect: async (req, res) => {
    try {
      const { currentUserId, targetUserId } = req.body;
      if (!currentUserId || !targetUserId) {
        return res.status(400).json({ error: 'currentUserId and targetUserId are required' });
      }

      // Check if conversation between these 2 users already exists
      let conversation = await Conversation.findOne({
        isGroup: false,
        participants: { $all: [currentUserId, targetUserId], $size: 2 },
      }).populate('participants', 'name email role avatar');

      if (!conversation) {
        conversation = new Conversation({
          participants: [currentUserId, targetUserId],
          isGroup: false,
          lastMessageAt: new Date(),
        });
        await conversation.save();
        conversation = await conversation.populate('participants', 'name email role avatar');
      }

      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // CREATE conversation (e.g. Group chat)
  create: async (req, res) => {
    try {
      let { participants, groupAdmin, isGroup, name } = req.body;

      // Sanitize and filter out null, undefined, or string 'undefined'
      if (Array.isArray(participants)) {
        participants = participants.filter((id) => id && id !== 'undefined');
      }

      if (isGroup && groupAdmin && groupAdmin !== 'undefined') {
        const adminAccount = await Account.findById(groupAdmin);
        if (adminAccount && adminAccount.role === 'student') {
          return res.status(403).json({ error: 'Students are not permitted to create group chats' });
        }
      } else {
        groupAdmin = undefined;
      }

      const conversation = new Conversation({
        name,
        isGroup: isGroup ?? true,
        participants,
        groupAdmin,
        lastMessageAt: new Date(),
      });

      const saved = await conversation.save();
      const populated = await saved.populate('participants', 'name email role avatar');
      res.status(201).json(populated);
    } catch (error) {
      console.error('Error creating conversation:', error.message);
      res.status(400).json({ error: error.message });
    }
  },

  // MARK as read for a user
  markAsRead: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: 'userId is required' });

      const conversation = await Conversation.findById(id);
      if (!conversation) return res.status(404).json({ error: 'Not found' });

      if (conversation.unreadCounts) {
        conversation.unreadCounts.set(userId.toString(), 0);
        await conversation.save();
      }

      const populated = await Conversation.findById(id).populate('participants', 'name email role avatar');
      res.json(populated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // UPDATE conversation
  update: async (req, res) => {
    try {
      const conversation = await Conversation.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      ).populate('participants', 'name email role avatar');
      if (!conversation) return res.status(404).json({ error: 'Not found' });
      res.json(conversation);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // DELETE conversation
  delete: async (req, res) => {
    try {
      const conversation = await Conversation.findByIdAndDelete(req.params.id);
      if (!conversation) return res.status(404).json({ error: 'Not found' });
      res.json({ message: 'Deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
