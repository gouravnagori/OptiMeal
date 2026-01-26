import Feedback from '../models/Feedback.js';

// Add new feedback (Student)
export const addFeedback = async (req, res) => {
    const { studentId, messId, message, rating } = req.body;

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

// Get feedback for a mess (Manager)
export const getMessFeedback = async (req, res) => {
    const { messId } = req.params;

    try {
        const feedbacks = await Feedback.find({ messId })
            .populate('studentId', 'name email avatar')
            .sort({ createdAt: -1 }); // Newest first

        res.status(200).json(feedbacks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching feedback" });
    }
};
