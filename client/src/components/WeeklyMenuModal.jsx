import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../config';

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const WeeklyMenuModal = ({ isOpen, onClose, messId }) => {
    const [selectedDay, setSelectedDay] = useState('monday');
    const [weeklyMenu, setWeeklyMenu] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen || !messId) return;

        const fetchWeeklyMenu = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`${API_URL}/api/menu/weekly?messId=${messId}`);
                setWeeklyMenu(data || {});
            } catch (error) {
                console.error("Failed to display weekly menu", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWeeklyMenu();
    }, [isOpen, messId]);

    const getCurrentDayMenu = () => {
        return weeklyMenu[selectedDay] || { breakfast: [], lunch: [], highTea: [], dinner: [] };
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-4xl bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900 sticky top-0 z-10">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span className="text-3xl">📅</span> Weekly Menu Schedule
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                        {/* Sidebar / Tabs */}
                        <div className="w-full md:w-64 bg-gray-900/50 border-b md:border-b-0 md:border-r border-gray-800 p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible scrollbar-hide">
                            {days.map(day => (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDay(day)}
                                    className={`px-4 py-3 rounded-xl text-left font-bold capitalize transition-all md:w-full flex justify-between items-center ${selectedDay === day
                                            ? 'bg-primary text-dark shadow-lg shadow-primary/20'
                                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
                                        }`}
                                >
                                    {day}
                                    {selectedDay === day && <span className="hidden md:block">👉</span>}
                                </button>
                            ))}
                        </div>

                        {/* Menu Grid */}
                        <div className="flex-1 p-6 overflow-y-auto bg-gray-900/30">
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-fadeIn">
                                    <h3 className="text-xl font-bold text-white capitalize mb-4 border-b border-gray-800 pb-2">{selectedDay}'s Menu</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <MealCard title="Breakfast 🍳" items={getCurrentDayMenu().breakfast} color="yellow" />
                                        <MealCard title="Lunch 🍛" items={getCurrentDayMenu().lunch} color="green" />
                                        <MealCard title="High Tea ☕" items={getCurrentDayMenu().highTea} color="pink" />
                                        <MealCard title="Dinner 🍽️" items={getCurrentDayMenu().dinner} color="blue" />
                                    </div>

                                    {(!getCurrentDayMenu().breakfast?.length && !getCurrentDayMenu().lunch?.length) && (
                                        <div className="text-center py-10 text-gray-500 italic">
                                            No menu scheduled for this day yet.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const MealCard = ({ title, items, color }) => (
    <div className={`p-5 rounded-2xl border bg-gray-800/40 border-gray-700/50 hover:border-${color}-500/30 transition-colors group`}>
        <h4 className={`text-${color}-400 font-bold mb-3 uppercase tracking-wider text-sm flex items-center gap-2`}>
            {title}
        </h4>
        {items && items.length > 0 ? (
            <div className="flex flex-wrap gap-2">
                {items.map((item, idx) => (
                    <span key={idx} className="bg-gray-700/50 text-gray-200 px-3 py-1.5 rounded-lg text-sm border border-gray-600 group-hover:border-gray-500 transition-colors">
                        {item}
                    </span>
                ))}
            </div>
        ) : (
            <p className="text-gray-600 text-sm italic">Not decided</p>
        )}
    </div>
);

export default WeeklyMenuModal;
