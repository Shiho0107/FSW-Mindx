import { createCRUDController } from './crudController.js';
import Account from '../models/Account.js';
import Event from '../models/Event.js';
import Group from '../models/Group.js';

const baseController = createCRUDController(Account);

export default {
  ...baseController,

  // GET scoped accounts based on requesting user role and profile relations
  getScopedAccounts: async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        const allAccounts = await Account.find().select('-passwordHash');
        return res.json(allAccounts);
      }

      const currentUser = await Account.findById(userId);
      if (!currentUser) {
        return res.status(404).json({ error: 'User account not found' });
      }

      // 1. Admin gets all active accounts
      if (currentUser.role === 'admin') {
        const accounts = await Account.find({ _id: { $ne: userId } }).select('-passwordHash');
        return res.json(accounts);
      }

      // 2. Teacher role scoping
      if (currentUser.role === 'teacher') {
        const profileId = currentUser.linkedProfileId;
        let allowedStudentProfileIds = new Set();

        if (profileId) {
          const teacherEvents = await Event.find({ teacherId: profileId });
          teacherEvents.forEach((evt) => {
            (evt.attendees || []).forEach((stId) => allowedStudentProfileIds.add(stId.toString()));
          });

          const groups = await Group.find();
          groups.forEach((grp) => {
            (grp.students || []).forEach((stId) => allowedStudentProfileIds.add(stId.toString()));
          });
        }

        const accounts = await Account.find({
          _id: { $ne: userId },
          $or: [
            { role: 'admin' },
            { role: 'teacher' },
            { linkedProfileId: { $in: Array.from(allowedStudentProfileIds) } },
            { role: 'student' }
          ],
        }).select('-passwordHash');

        return res.json(accounts);
      }

      // 3. Student role scoping
      if (currentUser.role === 'student') {
        const profileId = currentUser.linkedProfileId;
        let allowedTeacherProfileIds = new Set();
        let allowedClassmateProfileIds = new Set();

        if (profileId) {
          const studentEvents = await Event.find({ attendees: profileId });
          studentEvents.forEach((evt) => {
            if (evt.teacherId) allowedTeacherProfileIds.add(evt.teacherId.toString());
            (evt.attendees || []).forEach((stId) => {
              if (stId.toString() !== profileId.toString()) {
                allowedClassmateProfileIds.add(stId.toString());
              }
            });
          });

          const groups = await Group.find({ students: profileId });
          groups.forEach((grp) => {
            (grp.students || []).forEach((stId) => {
              if (stId.toString() !== profileId.toString()) {
                allowedClassmateProfileIds.add(stId.toString());
              }
            });
          });
        }

        const accounts = await Account.find({
          _id: { $ne: userId },
          $or: [
            { role: 'admin' },
            { linkedProfileId: { $in: Array.from(allowedTeacherProfileIds) } },
            { linkedProfileId: { $in: Array.from(allowedClassmateProfileIds) } },
            { role: 'teacher' }
          ],
        }).select('-passwordHash');

        return res.json(accounts);
      }

      const accounts = await Account.find({ _id: { $ne: userId } }).select('-passwordHash');
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
