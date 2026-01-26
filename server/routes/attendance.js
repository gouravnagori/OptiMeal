import express from 'express';
import { getAttendance, updateAttendance, getMessStats } from '../controllers/attendanceController.js';
import mongoose from 'mongoose'; // Added import for aggregate

const router = express.Router();

router.get('/', getAttendance);
router.post('/update', updateAttendance);
router.get('/stats', getMessStats);

export default router;
