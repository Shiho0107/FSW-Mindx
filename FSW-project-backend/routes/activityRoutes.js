import express from 'express';
import activityController from '../controllers/activityController.js';

const router = express.Router();

router.get('/', activityController.getAll);
router.post('/', activityController.create);
router.get('/:id', activityController.getById);
router.put('/:id', activityController.update);
router.delete('/:id', activityController.delete);

export default router;
