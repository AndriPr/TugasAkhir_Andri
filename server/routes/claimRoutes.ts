import express from 'express';
import { ClaimController } from '../controllers/claimController';

const router = express.Router();

router.get('/', ClaimController.getAll);
router.get('/:id', ClaimController.getById);
router.post('/', ClaimController.create);
router.put('/:id', ClaimController.update);
router.delete('/:id', ClaimController.remove);

export default router;
