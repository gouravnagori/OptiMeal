import Feedback from '../models/Feedback.js';
import { containsProfanity } from '../utils/profanityFilter.js';

// Add new feedback (Student)
export const addFeedback = async (req, res) => {
    const { studentId, messId, message, rating } = req.body;

    // Server-side profanity check (backup validation)
    if (containsProfanity(message)) {
        return res.status(400).json({
            message: "Your feedback contains inappropriate language. Please keep it constructive."
        });
    }

    try {
        const feedback = new Feedback({
            studentId,
            messId,
            message,
            rating
        });

        await feedback.save();
        res.status(201).json({ message: "Feedback submitted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error submitting feedback" });
    }
};

// Get feedback for a mess (Manager) - ANONYMOUS: Student details hidden
export const getMessFeedback = async (req, res) => {
    const { messId } = req.params;

    try {
        // Don't populate studentId to keep feedback anonymous
        const feedbacks = await Feedback.find({ messId })
            .select('message rating createdAt') // Only select necessary fields, exclude studentId
            .sort({ createdAt: -1 }); // Newest first

        res.status(200).json(feedbacks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching feedback" });
    }
};
