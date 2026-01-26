import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSun, FiMoon, FiCoffee, FiInfo } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_URL } from '../config';

const MealCard = ({ type, time, isSelected, onToggle, isLocked, menuItems }) => {

    const renderMenuText = (items) => {
        if (!items || items.length === 0 || (items.length === 1 && items[0] === 'Not Updated')) return 'Menu not updated yet';
        return items.join(', ');
    };

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
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
            <p className="text-sm text-gray-400 font-medium mb-4">{time}</p>

            <div className="space-y-2 mt-4 pt-4 border-t border-gray-700/50">
                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">On the Menu</div>
                <p className="text-sm text-gray-300 leading-relaxed">
                    {renderMenuText(menuItems)}
                </p>
            </div>

            {isLocked && (
                <div className="absolute inset-0 bg-dark/50 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-10">
                    <span className="px-3 py-1 bg-red-500/20 text-red-500 text-xs font-bold rounded-full border border-red-500/50">
                        Locked
                    </span>
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
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('userInfo'));
        setUserInfo(user);
        if (user) {
            fetchAttendance(user);
            fetchDailyMenu(user);
        }
    }, []);

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
                    time="07:30 - 09:00 AM"
                    isSelected={meals.breakfast}
                    onToggle={() => toggleMeal('breakfast')}
                    isLocked={false}
                    menuItems={menu.breakfast}
                />

                <MealCard
                    type="lunch"
                    time="12:30 - 02:30 PM"
                    isSelected={meals.lunch}
                    onToggle={() => toggleMeal('lunch')}
                    isLocked={false}
                    menuItems={menu.lunch}
                />

                <MealCard
                    type="highTea"
                    time="04:30 - 05:30 PM"
                    isSelected={meals.highTea}
                    onToggle={() => toggleMeal('highTea')}
                    isLocked={false}
                    menuItems={menu.highTea}
                />

                <MealCard
                    type="dinner"
                    time="07:30 - 09:30 PM"
                    isSelected={meals.dinner}
                    onToggle={() => toggleMeal('dinner')}
                    isLocked={false}
                    menuItems={menu.dinner}
                />
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
                <FiInfo className="w-5 h-5 text-blue-400 mt-0.5" />
                <p className="text-sm text-blue-200">
                    You can change your meal preference at any time.
                    Please be responsible with your choices to help the environment.
                </p>
            </div>
        </div>
    );
};

export default MealSelector;
