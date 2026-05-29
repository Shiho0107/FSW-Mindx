import express from 'express';
import financeController from '../controllers/financeController.js';

const router = express.Router();

router.get('/', financeController.getAll);
router.post('/', financeController.create);
router.get('/:id', financeController.getById);
router.put('/:id', financeController.update);
router.delete('/:id', financeController.delete);

export default router;
