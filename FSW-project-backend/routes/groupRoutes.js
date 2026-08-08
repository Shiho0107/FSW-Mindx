import express from 'express';
import groupController from '../controllers/groupController.js';

const router = express.Router();

router.get('/', groupController.getAll);
router.post('/', groupController.create);
router.get('/:id', groupController.getById);
router.put('/:id', groupController.update);
router.delete('/:id', groupController.delete);

export default router;
