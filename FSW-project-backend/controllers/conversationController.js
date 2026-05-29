import Conversation from '../models/Conversation.js';

export default {
  // GET all conversations
  getAll: async (req, res) => {
    try {
      const conversations = await Conversation.find()
        .populate('participants', 'fullName email avatar')
        .sort({ lastMessageAt: -1 });
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // GET single conversation
  getById: async (req, res) => {
    try {
      const conversation = await Conversation.findById(req.params.id)
        .populate('participants', 'fullName email avatar');
      if (!conversation) return res.status(404).json({ error: 'Not found' });
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // CREATE conversation
  create: async (req, res) => {
    try {
      const conversation = new Conversation(req.body);
      const saved = await conversation.save();
      const populated = await saved.populate('participants', 'fullName email avatar');
      res.status(201).json(populated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // UPDATE conversation
  update: async (req, res) => {
    try {
      const conversation = await Conversation.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      ).populate('participants', 'fullName email avatar');
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
