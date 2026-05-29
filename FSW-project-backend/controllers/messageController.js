import Message from '../models/Message.js';

export default {
  // GET messages by conversationId
  getMessages: async (req, res) => {
    try {
      const { conversationId } = req.query;
      const query = conversationId ? { conversationId } : {};
      const messages = await Message.find(query)
        .populate('sender', 'fullName email avatar')
        .sort({ createdAt: -1 });
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // POST send message
  sendMessage: async (req, res) => {
    try {
      const message = new Message(req.body);
      const saved = await message.save();
      const populated = await saved.populate('sender', 'fullName email avatar');
      res.status(201).json(populated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // GET single message
  getById: async (req, res) => {
    try {
      const message = await Message.findById(req.params.id)
        .populate('sender', 'fullName email avatar');
      if (!message) return res.status(404).json({ error: 'Not found' });
      res.json(message);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // UPDATE message
  update: async (req, res) => {
    try {
      const message = await Message.findByIdAndUpdate(
        req.params.id,
        { ...req.body, editedAt: new Date() },
        { new: true }
      ).populate('sender', 'fullName email avatar');
      if (!message) return res.status(404).json({ error: 'Not found' });
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // DELETE message
  delete: async (req, res) => {
    try {
      const message = await Message.findByIdAndDelete(req.params.id);
      if (!message) return res.status(404).json({ error: 'Not found' });
      res.json({ message: 'Deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
