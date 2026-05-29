import express from 'express';
import teacherController from '../controllers/teacherController.js';

const router = express.Router();

router.get('/', teacherController.getAll);
router.post('/', teacherController.create);
router.get('/:id', teacherController.getById);
router.put('/:id', teacherController.update);
router.delete('/:id', teacherController.delete);

export default router;
