import express from 'express';
import eventController from '../controllers/eventController.js';

const router = express.Router();

router.get('/', eventController.getAll);
router.post('/', eventController.create);
router.get('/:id', eventController.getById);
router.put('/:id', eventController.update);
router.delete('/:id', eventController.delete);

export default router;
