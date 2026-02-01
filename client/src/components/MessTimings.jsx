import { useState, useEffect, memo } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_URL } from '../config';

// Helper functions outside component to prevent re-creation
const parse24to12 = (time24) => {
    if (!time24) return { hour: '12', minute: '00', period: 'AM' };
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return { hour: String(h12), minute: minutes || '00', period };
};

const format12to24 = (hour, minute, period) => {
    let h = parseInt(hour);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${minute}`;
};

const formatTime12 = (time24) => {
    if (!time24) return '';
    const { hour, minute, period } = parse24to12(time24);
    return `${hour}:${minute} ${period}`;
};

// Time Picker Component - defined OUTSIDE to prevent re-creation
const TimePicker = memo(({ value, onChange }) => {
    const { hour, minute, period } = parse24to12(value);

    const handleHourChange = (e) => {
        onChange(format12to24(e.target.value, minute, period));
    };

    const handleMinuteChange = (e) => {
        onChange(format12to24(hour, e.target.value, period));
    };

    const handlePeriodChange = (e) => {
        onChange(format12to24(hour, minute, e.target.value));
    };

    return (
        <div className="flex items-center gap-1">
            <select
                value={hour}
                onChange={handleHourChange}
                className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-sm w-14 cursor-pointer"
            >
                {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(h => (
                    <option key={h} value={String(h)}>{h}</option>
                ))}
            </select>
            <span className="text-gray-400">:</span>
            <select
                value={minute}
                onChange={handleMinuteChange}
                className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-sm w-14 cursor-pointer"
            >
                {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                    <option key={m} value={m}>{m}</option>
                ))}
            </select>
            <select
                value={period}
                onChange={handlePeriodChange}
                className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-sm w-14 cursor-pointer font-bold"
            >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
            </select>
        </div>
    );
});

// Live Clock Component - separate to isolate re-renders
const LiveClock = memo(() => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const h = time.getHours();
    const m = time.getMinutes();
    const s = time.getSeconds();
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    const formatted = `${h12}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} ${period}`;

    return (
        <span className="text-sm font-mono text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">
            {formatted}
        </span>
    );
});

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

    const meals = [
        { key: 'breakfast', label: 'Breakfast', icon: '🌅' },
        { key: 'lunch', label: 'Lunch', icon: '☀️' },
        { key: 'highTea', label: 'High Tea', icon: '🍵' },
        { key: 'dinner', label: 'Dinner', icon: '🌙' }
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
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-2xl">⏰</span> Mess Timings
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">Current Time:</span>
                        <LiveClock />
                    </div>
                </div>
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
                {meals.map(({ key, label, icon }) => (
                    <div
                        key={key}
                        className={`p-4 rounded-xl border border-gray-700 bg-gray-800/50 ${isEditing ? 'ring-2 ring-primary/30' : ''}`}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">{icon}</span>
                            <h3 className="font-bold text-white">{label}</h3>
                        </div>

                        {isEditing ? (
                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs text-gray-400 w-16">Serving:</span>
                                    <TimePicker
                                        value={timings[key]?.servingStart}
                                        onChange={(v) => handleTimeChange(key, 'servingStart', v)}
                                    />
                                    <span className="text-gray-500">to</span>
                                    <TimePicker
                                        value={timings[key]?.servingEnd}
                                        onChange={(v) => handleTimeChange(key, 'servingEnd', v)}
                                    />
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs text-gray-400 w-16">Lock at:</span>
                                    <TimePicker
                                        value={timings[key]?.requestDeadline}
                                        onChange={(v) => handleTimeChange(key, 'requestDeadline', v)}
                                    />
                                    <span className="text-xs text-red-400 ml-2">🔒 Auto-lock</span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-400">🍽️ Serving:</span>
                                    <span className="text-white font-medium">
                                        {formatTime12(timings[key]?.servingStart)} - {formatTime12(timings[key]?.servingEnd)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-400">🔒 Lock at:</span>
                                    <span className="text-yellow-400 font-medium">
                                        {formatTime12(timings[key]?.requestDeadline)}
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
                            fetchTimings();
                        }}
                        className="px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                </div>
            )}

            <p className="text-xs text-gray-500 mt-4">
                💡 Students won't be able to request meals after the lock time
            </p>
        </div>
    );
};

export default MessTimings;
