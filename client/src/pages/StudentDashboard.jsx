import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MealSelector from '../components/MealSelector';
import WasteOMeter from '../components/WasteOMeter';
import Footer from '../components/Footer';
import FeedbackForm from '../components/FeedbackForm';
import StudentMenuDisplay from '../components/StudentMenuDisplay';
import WeeklyMenuModal from '../components/WeeklyMenuModal';

const StudentDashboard = () => {
    // Mock user data for now
    const [user, setUser] = useState(null);
    const [showWeeklyMenu, setShowWeeklyMenu] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('userInfo');
            if (!storedUser) {
                window.location.href = '/auth/student';
                return;
            }
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role !== 'student') {
                // Not a student? Bye.
                window.location.href = '/auth/student';
                return;
            }
            // Valid student found
            setUser(parsedUser);
        } catch (error) {
            console.error("Auth check failed:", error);
            window.location.href = '/auth/student';
        }
    }, [navigate]);

    if (!user) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark text-white font-body pb-20">
            <Navbar role="Student" userName={user.name} />

            <main className="w-full px-6 md:px-12 pt-8 space-y-8">
                {/* Greeting Section */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold">
                            Hello, <span className="text-primary">{user.name.split(' ')[0]}</span>! 👋
                        </h1>
                        <p className="text-gray-400 mt-2">Ready to save some food today?</p>
                    </div>
                </div>

                {/* Waste-O-Meter Section - Temporarily Disabled */}
                {/* <WasteOMeter /> */}

                {/* Main Action Section: Meal Selector */}
                <MealSelector />

                {/* Menu & Feedback Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Weekly Menu</h2>
                            <button
                                onClick={() => setShowWeeklyMenu(true)}
                                className="text-primary text-sm font-medium hover:underline focus:outline-none"
                            >
                                View Full Schedule
                            </button>
                        </div>
                        <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 h-full min-h-[300px]">
                            <StudentMenuDisplay messId={user.messId} />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Your Voice</h2>
                        </div>
                        <FeedbackForm studentId={user._id} messId={user.messId} />
                    </div>
                </div>
            </main>
            <Footer />
            <WeeklyMenuModal
                isOpen={showWeeklyMenu}
                onClose={() => setShowWeeklyMenu(false)}
                messId={user.messId}
            />
        </div>
    );
};

export default StudentDashboard;
