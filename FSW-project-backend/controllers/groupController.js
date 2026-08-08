import Group from '../models/Group.js';

export const groupController = {
  getAll: async (req, res) => {
    try {
      const groups = await Group.find().populate('students');
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const group = await Group.findById(req.params.id).populate('students');
      if (!group) return res.status(404).json({ error: 'Group not found' });
      res.json(group);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const group = new Group(req.body);
      const saved = await group.save();
      const populated = await Group.findById(saved._id).populate('students');
      res.status(201).json(populated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const group = await Group.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('students');
      if (!group) return res.status(404).json({ error: 'Group not found' });
      res.json(group);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const group = await Group.findByIdAndDelete(req.params.id);
      if (!group) return res.status(404).json({ error: 'Group not found' });
      res.json({ message: 'Group deleted successfully', data: group });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default groupController;
