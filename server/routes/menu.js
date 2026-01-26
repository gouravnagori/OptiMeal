import express from 'express';
import { generateMenu, saveMenu, getMenu, saveWeeklyMenu, getWeeklyMenu } from '../controllers/menuController.js';

const router = express.Router();

router.post('/generate', generateMenu);
router.post('/save', saveMenu);
router.post('/save-weekly', saveWeeklyMenu);
router.get('/', getMenu);
router.get('/weekly', getWeeklyMenu);

export default router;
