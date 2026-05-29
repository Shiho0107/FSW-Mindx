import express from 'express';
import statController from '../controllers/statController.js';

const router = express.Router();

router.get('/', statController.getAll);
router.post('/', statController.create);
router.get('/:id', statController.getById);
router.put('/:id', statController.update);
router.delete('/:id', statController.delete);

export default router;
