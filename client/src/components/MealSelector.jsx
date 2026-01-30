import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSun, FiMoon, FiCoffee, FiInfo } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_URL } from '../config';

const MealCard = ({ type, time, isSelected, onToggle, isLocked, menuItems, deadline }) => {

    const renderMenuText = (items) => {
        if (!items || items.length === 0 || (items.length === 1 && items[0] === 'Not Updated')) return 'Menu not updated yet';
        return items.join(', ');
    };

    const formatDeadline = (time24) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };

    return (
        <motion.div
            whileHover={{ scale: isLocked ? 1 : 1.02 }}
            className={`relative p-6 rounded-2xl border transition-all ${isSelected ? 'bg-gray-800/80 border-primary/50 shadow-lg shadow-primary/10' : 'bg-gray-900/50 border-gray-800 opacity-60'}`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${isSelected ? 'bg-primary/20 text-primary' : 'bg-gray-800 text-gray-500'}`}>
                    {type === 'breakfast' && <FiCoffee size={24} />}
                    {type === 'lunch' && <FiSun size={24} />}
                    {type === 'highTea' && <FiCoffee size={24} />}
                    {type === 'dinner' && <FiMoon size={24} />}
                </div>

                <div className="relative inline-flex items-center cursor-pointer z-20" onClick={(e) => { e.stopPropagation(); !isLocked && onToggle(); }}>
                    <input type="checkbox" checked={isSelected} readOnly className="sr-only peer" disabled={isLocked} />
                    <div className={`w-11 h-6 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary/30 dark:peer-focus:ring-primary/80 transition-colors ${isSelected ? 'bg-primary' : 'bg-gray-700'} ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}></div>
                    <div className={`absolute top-0.5 left-[2px] bg-white border-gray-300 border rounded-full h-5 w-5 transition-all ${isSelected ? 'translate-x-full border-white' : ''}`}></div>
                </div>
            </div>

            <h3 className={`text-xl font-bold mb-1 capitalize ${isSelected ? 'text-white' : 'text-gray-400'}`}>{type === 'highTea' ? 'High Tea' : type}</h3>
            <p className="text-sm text-gray-400 font-medium mb-1">{time}</p>
            {deadline && !isLocked && (
                <p className="text-xs text-yellow-400">🔒 Request by {formatDeadline(deadline)}</p>
            )}

            <div className="space-y-2 mt-4 pt-4 border-t border-gray-700/50">
                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">On the Menu</div>
                <p className="text-sm text-gray-300 leading-relaxed">
                    {renderMenuText(menuItems)}
                </p>
            </div>

            {isLocked && (
                <div className="absolute inset-0 bg-dark/60 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center z-10">
                    <span className="px-4 py-2 bg-red-500/20 text-red-400 text-sm font-bold rounded-full border border-red-500/50 flex items-center gap-2">
                        🔒 Locked
                    </span>
                    <p className="text-xs text-gray-400 mt-2">Request closed at {formatDeadline(deadline)}</p>
                </div>
            )}
        </motion.div>
    );
};

const MealSelector = () => {
    const [meals, setMeals] = useState({
        breakfast: true,
        lunch: true,
        highTea: true,
        dinner: true
    });
    const [menu, setMenu] = useState({
        breakfast: [],
        lunch: [],
        highTea: [],
        dinner: []
    });
    const [mealTimings, setMealTimings] = useState({
        breakfast: { servingStart: '07:30', servingEnd: '09:30', requestDeadline: '07:00' },
        lunch: { servingStart: '12:00', servingEnd: '14:00', requestDeadline: '11:00' },
        highTea: { servingStart: '17:00', servingEnd: '18:00', requestDeadline: '16:00' },
        dinner: { servingStart: '19:30', servingEnd: '21:30', requestDeadline: '19:00' }
    });
    const [lockedMeals, setLockedMeals] = useState({
        breakfast: false,
        lunch: false,
        highTea: false,
        dinner: false
    });
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);

    // Check which meals are locked based on current time
    const checkLockedMeals = (timings) => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const locked = {
            breakfast: timings.breakfast?.requestDeadline ? currentTime >= timings.breakfast.requestDeadline : false,
            lunch: timings.lunch?.requestDeadline ? currentTime >= timings.lunch.requestDeadline : false,
            highTea: timings.highTea?.requestDeadline ? currentTime >= timings.highTea.requestDeadline : false,
            dinner: timings.dinner?.requestDeadline ? currentTime >= timings.dinner.requestDeadline : false
        };

        setLockedMeals(locked);
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('userInfo'));
        setUserInfo(user);
        if (user) {
            fetchAttendance(user);
            fetchDailyMenu(user);
            fetchMealTimings(user);
        }

        // Check locked meals every minute
        const interval = setInterval(() => {
            checkLockedMeals(mealTimings);
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const fetchMealTimings = async (user) => {
        try {
            const { data } = await axios.get(`${API_URL}/api/mess/timings?messId=${user.messId}`);
            if (data.mealTimings) {
                setMealTimings(data.mealTimings);
                checkLockedMeals(data.mealTimings);
            }
        } catch (error) {
            console.error('Error fetching timings:', error);
        }
    };

    // Format time for display
    const formatServingTime = (mealKey) => {
        const timing = mealTimings[mealKey];
        if (!timing) return '';

        const format12h = (time24) => {
            if (!time24) return '';
            const [hours, minutes] = time24.split(':');
            const h = parseInt(hours);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return `${h12}:${minutes} ${ampm}`;
        };

        return `${format12h(timing.servingStart)} - ${format12h(timing.servingEnd)}`;
    };

    const fetchDailyMenu = async (user) => {
        try {
            const date = new Date().toISOString();
            const { data } = await axios.get(`${API_URL}/api/menu?messId=${user.messId}&date=${date}`);
            setMenu({
                breakfast: data.breakfast || [],
                lunch: data.lunch || [],
                highTea: data.highTea || [],
                dinner: data.dinner || []
            });
        } catch (error) {
            console.error(error);
        }
    };

    const fetchAttendance = async (user) => {
        try {
            const date = new Date().toISOString();
            const { data } = await axios.get(`${API_URL}/api/attendance?studentId=${user._id}&date=${date}`);
            setMeals({
                breakfast: data.breakfast,
                lunch: data.lunch,
                highTea: data.highTea,
                dinner: data.dinner
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleMeal = async (type) => {
        const newStatus = !meals[type];
        // Optimistic UI Update
        setMeals(prev => ({ ...prev, [type]: newStatus }));

        try {
            const date = new Date().toISOString();
            await axios.post(`${API_URL}/api/attendance/update`, {
                studentId: userInfo._id,
                messId: userInfo.messId,
                date: date,
                mealType: type,
                status: newStatus
            });
            toast.success(`${type} preference updated`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update');
            // Revert on failure
            setMeals(prev => ({ ...prev, [type]: !newStatus }));
        }
    };

    if (loading) return <div className="text-white text-center py-10 animate-pulse">Loading Meal Data...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-white">Daily Meal Selection</h2>
                    <p className="text-gray-400">Opt-in for meals you plan to eat. Help us reduce waste.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-medium text-primary">Today</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MealCard
                    type="breakfast"
                    time={formatServingTime('breakfast')}
                    isSelected={meals.breakfast}
                    onToggle={() => toggleMeal('breakfast')}
                    isLocked={lockedMeals.breakfast}
                    menuItems={menu.breakfast}
                    deadline={mealTimings.breakfast?.requestDeadline}
                />

                <MealCard
                    type="lunch"
                    time={formatServingTime('lunch')}
                    isSelected={meals.lunch}
                    onToggle={() => toggleMeal('lunch')}
                    isLocked={lockedMeals.lunch}
                    menuItems={menu.lunch}
                    deadline={mealTimings.lunch?.requestDeadline}
                />

                <MealCard
                    type="highTea"
                    time={formatServingTime('highTea')}
                    isSelected={meals.highTea}
                    onToggle={() => toggleMeal('highTea')}
                    isLocked={lockedMeals.highTea}
                    menuItems={menu.highTea}
                    deadline={mealTimings.highTea?.requestDeadline}
                />

                <MealCard
                    type="dinner"
                    time={formatServingTime('dinner')}
                    isSelected={meals.dinner}
                    onToggle={() => toggleMeal('dinner')}
                    isLocked={lockedMeals.dinner}
                    menuItems={menu.dinner}
                    deadline={mealTimings.dinner?.requestDeadline}
                />
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
                <FiInfo className="w-5 h-5 text-blue-400 mt-0.5" />
                <p className="text-sm text-blue-200">
                    Meal requests automatically lock after the deadline.
                    Please plan your meals responsibly to help us reduce food waste.
                </p>
            </div>
        </div>
    );
};

export default MealSelector;
