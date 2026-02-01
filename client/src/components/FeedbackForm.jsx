import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_URL } from '../config';
import { containsProfanity } from '../utils/profanityFilter';

const FeedbackForm = ({ studentId, messId }) => {
    const [message, setMessage] = useState('');
    const [rating, setRating] = useState(5);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        // Check for profanity before submission
        if (containsProfanity(message)) {
            toast.error("Your feedback contains inappropriate language. Please keep it constructive.");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/feedback/add`, {
                studentId,
                messId,
                message,
                rating
            });
            toast.success("Feedback sent to manager!");
            setMessage('');
            setRating(5);
        } catch (error) {
            console.error(error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Failed to send feedback");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                Send Feedback to Manager
            </h3>

            {/* Warning Message */}
            <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
                <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-amber-200">
                    Your feedback is anonymous to mess staff. However, inappropriate language may be reviewed by administration. Please keep your feedback constructive.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Rate your recent meals</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${rating >= star ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'bg-gray-800 text-gray-600'}`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write your suggestions, complaints, or compliments here..."
                        className="w-full h-32 bg-gray-800 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:border-purple-500 outline-none resize-none"
                        required
                    />
                </div>
                <button
                    disabled={loading || !message.trim()}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Sending...' : 'Submit Feedback'}
                </button>
            </form>
        </div>
    );
};

export default FeedbackForm;
