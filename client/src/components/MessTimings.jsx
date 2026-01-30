import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_URL } from '../config';

const MessTimings = ({ messId }) => {
    const [timings, setTimings] = useState({
        breakfast: { servingStart: '07:30', servingEnd: '09:30', requestDeadline: '07:00' },
        lunch: { servingStart: '12:00', servingEnd: '14:00', requestDeadline: '11:00' },
        highTea: { servingStart: '17:00', servingEnd: '18:00', requestDeadline: '16:00' },
        dinner: { servingStart: '19:30', servingEnd: '21:30', requestDeadline: '19:00' }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchTimings();
    }, [messId]);

    const fetchTimings = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/mess/timings?messId=${messId}`);
            if (data.mealTimings) {
                setTimings(data.mealTimings);
            }
        } catch (error) {
            console.error('Error fetching timings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTimeChange = (meal, field, value) => {
        setTimings(prev => ({
            ...prev,
            [meal]: {
                ...prev[meal],
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post(`${API_URL}/api/mess/timings`, {
                messId,
                mealTimings: timings
            });
            toast.success('Timings updated successfully!');
            setIsEditing(false);
        } catch (error) {
            toast.error('Failed to update timings');
        } finally {
            setSaving(false);
        }
    };

    const formatTime = (time24) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };

    const meals = [
        { key: 'breakfast', label: 'Breakfast', icon: '🌅', color: 'orange' },
        { key: 'lunch', label: 'Lunch', icon: '☀️', color: 'yellow' },
        { key: 'highTea', label: 'High Tea', icon: '🍵', color: 'pink' },
        { key: 'dinner', label: 'Dinner', icon: '🌙', color: 'blue' }
    ];

    if (loading) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">⏰</span> Mess Timings
                </h2>
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    disabled={saving}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${isEditing
                            ? 'bg-primary text-dark hover:bg-primary-dark'
                            : 'bg-gray-800 text-white hover:bg-gray-700'
                        }`}
                >
                    {saving ? 'Saving...' : isEditing ? '💾 Save Changes' : '✏️ Edit Timings'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {meals.map(({ key, label, icon, color }) => (
                    <div
                        key={key}
                        className={`p-4 rounded-xl border border-gray-700 bg-gray-800/50 ${isEditing ? 'ring-2 ring-primary/30' : ''
                            }`}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">{icon}</span>
                            <h3 className="font-bold text-white">{label}</h3>
                        </div>

                        {isEditing ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-400 w-24">Serving:</label>
                                    <input
                                        type="time"
                                        value={timings[key]?.servingStart || ''}
                                        onChange={(e) => handleTimeChange(key, 'servingStart', e.target.value)}
                                        className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-white text-sm"
                                    />
                                    <span className="text-gray-500">to</span>
                                    <input
                                        type="time"
                                        value={timings[key]?.servingEnd || ''}
                                        onChange={(e) => handleTimeChange(key, 'servingEnd', e.target.value)}
                                        className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-white text-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-400 w-24">Request by:</label>
                                    <input
                                        type="time"
                                        value={timings[key]?.requestDeadline || ''}
                                        onChange={(e) => handleTimeChange(key, 'requestDeadline', e.target.value)}
                                        className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-white text-sm"
                                    />
                                    <span className="text-xs text-red-400">🔒 Auto-lock after</span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-400">🍽️ Serving:</span>
                                    <span className="text-white font-medium">
                                        {formatTime(timings[key]?.servingStart)} - {formatTime(timings[key]?.servingEnd)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-400">🔒 Request by:</span>
                                    <span className="text-yellow-400 font-medium">
                                        {formatTime(timings[key]?.requestDeadline)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {isEditing && (
                <div className="mt-4 flex justify-end gap-2">
                    <button
                        onClick={() => {
                            setIsEditing(false);
                            fetchTimings(); // Reset changes
                        }}
                        className="px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                </div>
            )}

            <p className="text-xs text-gray-500 mt-4">
                💡 Students won't be able to request meals after the "Request by" deadline
            </p>
        </div>
    );
};

export default MessTimings;
