import express from 'express';
import { addFeedback, getMessFeedback } from '../controllers/feedbackController.js';

const router = express.Router();

router.post('/add', addFeedback);
router.get('/mess/:messId', getMessFeedback);

export default router;
