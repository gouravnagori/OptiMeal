import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const FeedbackList = ({ messId }) => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!messId) return;

        const fetchFeedback = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/api/feedback/mess/${messId}`);
                setFeedbacks(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeedback();

        // Auto-refresh feedback every 30 seconds
        const refreshInterval = setInterval(() => {
            fetchFeedback();
        }, 10000);

        return () => clearInterval(refreshInterval);
    }, [messId]);

    // Format timestamp with date and time
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const options = {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        return date.toLocaleString('en-IN', options);
    };

    if (loading) return <div className="text-gray-500 text-sm animate-pulse">Loading feedback...</div>;

    if (feedbacks.length === 0) {
        return (
            <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 text-center text-gray-400">
                <p>No feedback received yet.</p>
            </div>
        );
    }

    return (
        <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 max-h-[500px] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 sticky top-0 bg-gray-900 z-10 pb-4 border-b border-gray-800">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
                Anonymous Feedback ({feedbacks.length})
            </h3>
            <div className="space-y-4">
                {feedbacks.map((item) => (
                    <div key={item._id} className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                                {/* Anonymous incognito icon */}
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-sm text-gray-300">Anonymous Student</p>
                                    <p className="text-xs text-gray-500">{formatDateTime(item.createdAt)}</p>
                                </div>
                            </div>
                            <div className="flex gap-0.5">
                                {[...Array(item.rating)].map((_, i) => (
                                    <span key={i} className="text-yellow-400 text-sm">★</span>
                                ))}
                                {[...Array(5 - item.rating)].map((_, i) => (
                                    <span key={i} className="text-gray-600 text-sm">★</span>
                                ))}
                            </div>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed pl-10">
                            "{item.message}"
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeedbackList;
