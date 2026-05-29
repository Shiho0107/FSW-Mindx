import express from 'express';
import foodController from '../controllers/foodController.js';

const router = express.Router();

router.get('/', foodController.getAll);
router.post('/', foodController.create);
router.get('/:id', foodController.getById);
router.put('/:id', foodController.update);
router.delete('/:id', foodController.delete);

export default router;
