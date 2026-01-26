import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_URL } from '../config';

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const MenuEditor = ({ user }) => {
    const [selectedDay, setSelectedDay] = useState('monday');
    const [fullWeekMenu, setFullWeekMenu] = useState({});
    const [loading, setLoading] = useState(false);

    // Initial Empty State
    const emptyDay = { breakfast: '', lunch: '', highTea: '', dinner: '' };

    useEffect(() => {
        const fetchWeeklyMenu = async () => {
            if (!user?.messId) return;
            try {
                const messId = user.messId._id || user.messId;
                const { data } = await axios.get(`${API_URL}/api/menu/weekly?messId=${messId}`);

                // Process incoming data
                const processedMenu = {};
                days.forEach(day => {
                    const dayData = data[day] || {};
                    processedMenu[day] = {
                        breakfast: Array.isArray(dayData.breakfast) ? dayData.breakfast.join(', ') : '',
                        lunch: Array.isArray(dayData.lunch) ? dayData.lunch.join(', ') : '',
                        highTea: Array.isArray(dayData.highTea) ? dayData.highTea.join(', ') : '',
                        dinner: Array.isArray(dayData.dinner) ? dayData.dinner.join(', ') : '',
                    };
                });
                setFullWeekMenu(processedMenu);
            } catch (error) {
                console.error(error);
                // Initialize empty if fetch fails
                const empty = {};
                days.forEach(d => empty[d] = { ...emptyDay });
                setFullWeekMenu(empty);
            }
        };

        fetchWeeklyMenu();
    }, [user.messId]);

    const getCurrentDayMenu = () => {
        return fullWeekMenu[selectedDay] || { ...emptyDay };
    };

    const updateCurrentDayMenu = (field, value) => {
        setFullWeekMenu(prev => ({
            ...prev,
            [selectedDay]: {
                ...prev[selectedDay],
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Convert back to arrays
            const apiPayload = {};
            days.forEach(day => {
                const dayStr = fullWeekMenu[day] || emptyDay;
                apiPayload[day] = {
                    breakfast: dayStr.breakfast.split(',').map(s => s.trim()).filter(s => s),
                    lunch: dayStr.lunch.split(',').map(s => s.trim()).filter(s => s),
                    highTea: dayStr.highTea.split(',').map(s => s.trim()).filter(s => s),
                    dinner: dayStr.dinner.split(',').map(s => s.trim()).filter(s => s),
                };
            });

            await axios.post(`${API_URL}/api/menu/save-weekly`, {
                messId: user.messId._id || user.messId,
                weeklyMenu: apiPayload
            });
            toast.success("Weekly Menu Updated Successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save menu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Weekly Menu Editor
            </h3>

            {/* Day Selector Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {days.map(day => (
                    <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-colors ${selectedDay === day
                                ? 'bg-primary text-dark'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        {day}
                    </button>
                ))}
            </div>

            <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Breakfast</label>
                        <input
                            type="text"
                            value={getCurrentDayMenu().breakfast}
                            onChange={(e) => updateCurrentDayMenu('breakfast', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none"
                            placeholder="e.g. Poha, Tea"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Lunch</label>
                        <input
                            type="text"
                            value={getCurrentDayMenu().lunch}
                            onChange={(e) => updateCurrentDayMenu('lunch', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none"
                            placeholder="e.g. Rice, Dal, Sabji"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">High Tea</label>
                        <input
                            type="text"
                            value={getCurrentDayMenu().highTea}
                            onChange={(e) => updateCurrentDayMenu('highTea', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none"
                            placeholder="e.g. Biscuit, Coffee"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Dinner</label>
                        <input
                            type="text"
                            value={getCurrentDayMenu().dinner}
                            onChange={(e) => updateCurrentDayMenu('dinner', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none"
                            placeholder="e.g. Roti, Paneer"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-800">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <span>Saving All Days...</span>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                                Save Weekly Menu
                            </>
                        )}
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                        This schedule will repeat every week. You can click different days to edit them before saving.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MenuEditor;
