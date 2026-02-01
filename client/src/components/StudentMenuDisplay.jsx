import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const StudentMenuDisplay = ({ messId }) => {
    const [menu, setMenu] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMenu = async () => {
            if (!messId) return;
            try {
                const date = new Date().toISOString();
                const { data } = await axios.get(`${API_URL}/api/menu?messId=${messId}&date=${date}`);
                setMenu(data);
            } catch (error) {
                console.error("Failed to fetch menu", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();

        // Auto-refresh menu every 30 seconds
        const refreshInterval = setInterval(() => {
            fetchMenu();
        }, 30000);

        return () => clearInterval(refreshInterval);
    }, [messId]);

    if (loading) return <div className="text-gray-500 animate-pulse text-center p-4">Loading today's menu...</div>;

    if (!menu) {
        return <div className="text-gray-500 text-center p-4">No menu updated for today.</div>;
    }

    const { breakfast, lunch, highTea, dinner } = menu;

    const renderMealSection = (title, items, color) => (
        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
            <h4 className={`text-${color}-400 font-bold mb-2 uppercase text-xs tracking-wider`}>{title}</h4>
            {items && items.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {items.map((item, idx) => (
                        <span key={idx} className="bg-gray-700/50 text-gray-200 px-3 py-1 rounded-full text-sm border border-gray-600">
                            {item}
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-sm italic">Not decided yet</p>
            )}
        </div>
    );

    // Get current day name
    const getDayName = () => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[new Date().getDay()];
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
                <div className="flex flex-col">
                    <span className="text-lg font-semibold text-white">{getDayName()}'s Menu</span>
                    <span className="text-xs text-gray-400">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30">Live Menu</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {renderMealSection("Breakfast", breakfast, "yellow")}
                {renderMealSection("Lunch", lunch, "green")}
                {renderMealSection("High Tea", highTea, "pink")}
                {renderMealSection("Dinner", dinner, "blue")}
            </div>
        </div>
    );
};

export default StudentMenuDisplay;
