import express from 'express';
import messageController from '../controllers/messageController.js';

const router = express.Router();

router.get('/', messageController.getMessages);
router.post('/', messageController.sendMessage);
router.get('/:id', messageController.getById);
router.put('/:id', messageController.update);
router.delete('/:id', messageController.delete);

export default router;
