import express from 'express';
import Mess from '../models/Mess.js';

const router = express.Router();

// Get mess timings
router.get('/timings', async (req, res) => {
    const { messId } = req.query;
    try {
        const mess = await Mess.findById(messId).select('mealTimings name');
        if (!mess) {
            return res.status(404).json({ message: 'Mess not found' });
        }
        res.json(mess);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching timings', error: error.message });
    }
});

// Update mess timings (Manager only)
router.post('/timings', async (req, res) => {
    const { messId, mealTimings } = req.body;
    try {
        const mess = await Mess.findByIdAndUpdate(
            messId,
            { mealTimings },
            { new: true }
        );
        if (!mess) {
            return res.status(404).json({ message: 'Mess not found' });
        }
        res.json({ message: 'Timings updated successfully', mealTimings: mess.mealTimings });
    } catch (error) {
        res.status(500).json({ message: 'Error updating timings', error: error.message });
    }
});

// Check if meal request is allowed (based on deadline)
router.get('/can-request', async (req, res) => {
    const { messId, meal } = req.query;
    try {
        const mess = await Mess.findById(messId).select('mealTimings');
        if (!mess || !mess.mealTimings) {
            return res.json({ canRequest: true }); // Default allow if no timings set
        }

        const mealKey = meal === 'hightea' ? 'highTea' : meal;
        const mealTiming = mess.mealTimings[mealKey];

        if (!mealTiming || !mealTiming.requestDeadline) {
            return res.json({ canRequest: true });
        }

        // Get current time in HH:MM format
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Compare current time with deadline
        const canRequest = currentTime < mealTiming.requestDeadline;

        res.json({
            canRequest,
            deadline: mealTiming.requestDeadline,
            currentTime,
            message: canRequest ? 'Request allowed' : `Request closed. Deadline was ${mealTiming.requestDeadline}`
        });
    } catch (error) {
        res.status(500).json({ message: 'Error checking request status', error: error.message });
    }
});

export default router;
