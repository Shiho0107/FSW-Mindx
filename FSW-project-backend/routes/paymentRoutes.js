import express from 'express';
import paymentController from '../controllers/paymentController.js';

const router = express.Router();

router.get('/', paymentController.getAll);
router.post('/', paymentController.create);
router.get('/:id', paymentController.getById);
router.put('/:id', paymentController.update);
router.delete('/:id', paymentController.delete);

export default router;
