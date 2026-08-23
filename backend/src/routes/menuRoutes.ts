import { Router } from 'express';
import {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuController';

const router = Router();

router.get('/', getMenuItems);
router.get('/:id', getMenuItemById);
router.post('/', createMenuItem);
router.put('/:id', updateMenuItem);
router.delete('/:id', deleteMenuItem);

export default router;
