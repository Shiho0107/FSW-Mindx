import express from 'express';
import conversationController from '../controllers/conversationController.js';

const router = express.Router();

router.get('/', conversationController.getAll);
router.post('/', conversationController.create);
router.post('/direct', conversationController.getOrCreateDirect);
router.post('/:id/read', conversationController.markAsRead);
router.get('/:id', conversationController.getById);
router.put('/:id', conversationController.update);
router.delete('/:id', conversationController.delete);

export default router;
