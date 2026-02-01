import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WasteOMeter from '../components/WasteOMeter';
import MenuEditor from '../components/MenuEditor';
import FeedbackList from '../components/FeedbackList';
import StudentManagement from '../components/StudentManagement';
import MessTimings from '../components/MessTimings';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { API_URL } from '../config';

const StatBox = ({ title, count, total, color }) => (
    <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 relative overflow-hidden group hover:border-gray-700 transition-colors">
        <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:opacity-20 transition-opacity`}></div>
        <h3 className="text-gray-400 font-medium mb-2">{title}</h3>
        <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-white">{count}</span>
            <span className="text-sm text-gray-500 mb-1">requests</span>
        </div>
        <div className="mt-4 w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div className={`h-full ${color.replace('text-', 'bg-')} transition-all duration-1000`} style={{ width: `${(count / (total || 1)) * 100}%` }}></div>
        </div>
    </div>
);

const ManagerDashboard = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ breakfast: 0, lunch: 0, highTea: 0, dinner: 0 });
    const [unverifiedCount, setUnverifiedCount] = useState(0);
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiMenu, setAiMenu] = useState(null);
    const [loadingAi, setLoadingAi] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [unverifiedStudents, setUnverifiedStudents] = useState([]);

    // Define functions BEFORE useEffect to avoid hoisting issues
    const fetchStats = async (currentUser) => {
        try {
            const date = new Date().toISOString();
            const timestamp = new Date().getTime();
            const messId = currentUser.messId?._id || currentUser.messId;
            const { data } = await axios.get(`${API_URL}/api/attendance/stats?messId=${messId}&date=${date}&t=${timestamp}`);
            setStats(data || { breakfast: 0, lunch: 0, highTea: 0, dinner: 0 });
        } catch (error) {
            console.error(error);
        }
    };

    const fetchUnverifiedCount = async (currentUser) => {
        try {
            const messId = currentUser.messId?._id || currentUser.messId;
            const timestamp = new Date().getTime();
            const { data } = await axios.get(`${API_URL}/api/auth/get-unverified?messId=${messId}&t=${timestamp}`);
            setUnverifiedCount(data?.count || 0);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchUnverifiedList = async (currentUser) => {
        try {
            const messId = currentUser.messId?._id || currentUser.messId;
            const { data } = await axios.get(`${API_URL}/api/auth/get-unverified-list?messId=${messId}`);
            setUnverifiedStudents(data || []);
        } catch (error) {
            console.error(error);
        }
    };

    // useEffect now comes AFTER function definitions
    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                fetchStats(parsedUser);
                fetchUnverifiedCount(parsedUser);
                fetchUnverifiedList(parsedUser);

                // Auto-refresh every 30 seconds
                const refreshInterval = setInterval(() => {
                    fetchStats(parsedUser);
                    fetchUnverifiedCount(parsedUser);
                    fetchUnverifiedList(parsedUser);
                }, 30000); // 30 seconds

                // Cleanup interval on unmount
                return () => clearInterval(refreshInterval);
            } catch (e) {
                console.error("Failed to parse user:", e);
                window.location.href = '/auth/manager';
            }
        } else {
            window.location.href = '/auth/manager';
        }
    }, []);

    // Early return for loading state
    if (!user) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    const generateAiMenu = async () => {
        setLoadingAi(true);
        setShowAiModal(true);
        try {
            const { data } = await axios.post(`${API_URL}/api/menu/generate`, {
                messId: user.messId
            });
            setAiMenu(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate menu");
            setShowAiModal(false);
        } finally {
            setLoadingAi(false);
        }
    };

    const handleSaveAiMenu = async () => {
        if (!aiMenu) return;
        setLoadingAi(true);
        try {
            const date = new Date().toISOString();
            await axios.post(`${API_URL}/api/menu/save`, {
                messId: user.messId?._id || user.messId,
                date: date,
                breakfast: aiMenu.breakfast,
                lunch: aiMenu.lunch,
                dinner: aiMenu.dinner
            });
            toast.success("Menu successfully saved!");
            setShowAiModal(false);
            // Refresh stats or local menu state if needed
            window.location.reload(); // Simple refresh to show new data in MenuEditor
        } catch (error) {
            console.error(error);
            toast.error("Failed to save menu to database");
        } finally {
            setLoadingAi(false);
        }
    };



    const handleVerifyStudentsKey = async () => {
        const messId = user.messId?._id || user.messId;
        if (!messId) return;

        try {
            const { data } = await axios.get(`${API_URL}/api/auth/get-unverified-list?messId=${messId}`);
            setUnverifiedStudents(data);
            if (data.length === 0) {
                toast("No pending verifications", { icon: '✅' });
            } else {
                setShowVerifyModal(true);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch requests");
        }
    };

    const confirmVerify = async (studentId) => {
        try {
            await axios.post(`${API_URL}/api/auth/verify-student`, { studentId });
            toast.success("Student Verified");
            setUnverifiedStudents(prev => prev.filter(s => s._id !== studentId));
            setUnverifiedCount(prev => prev - 1);
        } catch (error) {
            toast.error("Verification failed");
        }
    };

    const confirmReject = async (studentId) => {
        try {
            await axios.delete(`${API_URL}/api/auth/delete-student?studentId=${studentId}`);
            toast.success("Student Rejected");
            setUnverifiedStudents(prev => prev.filter(s => s._id !== studentId));
            setUnverifiedCount(prev => prev - 1);
        } catch (error) {
            toast.error("Rejection failed");
        }
    };

    // Derived Cook Instructions based on stats
    const avgLunchRice = (stats.lunch * 0.150).toFixed(1); // 150g per person
    const avgLunchDal = (stats.lunch * 0.2).toFixed(1); // 200ml per person
    const avgDinnerRoti = stats.dinner * 3; // 3 rotis per person

    return (
        <div className="min-h-screen bg-dark text-white font-body pb-20 relative">
            <Toaster />
            <Navbar role="Manager" userName={user.name} />

            <main className="w-full px-6 md:px-12 pt-8 space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold">
                            Dashboard
                        </h1>
                        <p className="text-gray-400 mt-2">Overview for Today</p>
                    </div>
                    <div
                        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl font-medium flex items-center gap-2 opacity-70 cursor-not-allowed"
                        title="AI Menu Planner - Coming Soon!"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        <span className="hidden sm:inline">AI Menu</span>
                        <span className="text-xs bg-purple-600/50 px-2 py-0.5 rounded-full">Soon</span>
                    </div>
                </div>

                {/* Real-time Headcount */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatBox title="Breakfast Requests" count={stats.breakfast} total={stats.totalStudents || 100} color="bg-orange-500" />
                    <StatBox title="Lunch Requests" count={stats.lunch} total={stats.totalStudents || 100} color="bg-primary" />
                    <StatBox title="High Tea Requests" count={stats.highTea} total={stats.totalStudents || 100} color="bg-pink-500" />
                    <StatBox title="Dinner Requests" count={stats.dinner} total={stats.totalStudents || 100} color="bg-blue-500" />
                </div>

                {/* Waste Stats - Temporarily Disabled */}
                {/* <WasteOMeter /> */}

                {/* Recent Activities / Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Column 1: Menu Editor (New) */}
                    <div className="lg:col-span-1">
                        <MenuEditor user={user} />
                    </div>

                    {/* Column 2: Quick Actions */}
                    <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800">
                        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button
                                onClick={handleVerifyStudentsKey}
                                className="w-full p-4 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-between transition-colors text-left group cursor-pointer"
                            >
                                <span className="font-medium text-gray-300 group-hover:text-white">Verify New Students</span>
                                {unverifiedCount > 0 ? (
                                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{unverifiedCount} Pending</span>
                                ) : (
                                    <span className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded-full border border-green-500/20">All Verified</span>
                                )}
                            </button>
                            <div className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 flex items-center justify-between opacity-75 cursor-not-allowed">
                                <span className="font-medium text-gray-400">Contact NGO Partner</span>
                                <span className="text-[10px] uppercase font-bold bg-gray-700 text-gray-300 px-2 py-1 rounded">Coming Soon</span>
                            </div>
                        </div>
                    </div>

                    {/* Column 3: Cook Instructions */}
                    <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Cook Instructions</h3>
                            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-lg">Auto-Calculated</span>
                        </div>

                        <div className="relative h-48 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-3">
                                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            </div>
                            <h4 className="text-white font-bold mb-1">Coming Soon</h4>
                            <p className="text-gray-500 text-sm px-4">Automated prep quantities based on live attendance.</p>
                        </div>
                    </div>
                </div>

                {/* Mess Timings Section */}
                <MessTimings messId={user.messId?._id || user.messId} />

                {/* Student Management Section */}
                <StudentManagement messId={user.messId?._id || user.messId} />

                {/* Feedback Section */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Recent Feedback</h2>
                    <FeedbackList messId={user.messId?._id || user.messId} />
                </div>
            </main>

            {/* AI Modal */}
            {showAiModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                                AI Smart Menu
                            </h3>
                            <button onClick={() => setShowAiModal(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>

                        {loadingAi ? (
                            <div className="py-12 text-center space-y-4">
                                <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                                <p className="text-gray-300">Analyzing waste patterns & generating menu...</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {aiMenu && Object.entries(aiMenu).map(([meal, items]) => (
                                    <div key={meal} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                        <h4 className="capitalize text-purple-400 font-bold mb-2">{meal}</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {Array.isArray(items) && items.map((item, idx) => (
                                                <span key={idx} className="bg-gray-700 px-3 py-1 rounded-full text-sm">{item}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <button onClick={handleSaveAiMenu} disabled={loadingAi} className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold mt-4 disabled:opacity-50">
                                    {loadingAi ? 'Saving...' : 'Approve & Save Menu'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Verification Modal */}
            {showVerifyModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Pending Requests</h3>
                            <button onClick={() => setShowVerifyModal(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                            {unverifiedStudents.map(student => (
                                <div key={student._id} className="p-4 bg-gray-800 rounded-xl flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-white">{student.name}</h4>
                                        <p className="text-xs text-gray-400">{student.email}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => confirmReject(student._id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                        <button onClick={() => confirmVerify(student._id)} className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white rounded-lg transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {unverifiedStudents.length === 0 && (
                                <p className="text-center text-gray-500 py-4">All caught up!</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default ManagerDashboard;

// Error Boundary Wrapper

class ManagerDashboardErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ManagerDashboard crashed:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-dark flex items-center justify-center p-8">
                    <div className="bg-red-900/50 border border-red-500 rounded-2xl p-8 max-w-lg text-center">
                        <h1 className="text-2xl font-bold text-red-400 mb-4">Dashboard Crashed</h1>
                        <p className="text-gray-300 mb-4">Something went wrong loading the Manager Dashboard.</p>
                        <pre className="bg-black/50 p-4 rounded-lg text-left text-xs text-red-300 overflow-auto max-h-40 mb-4">
                            {this.state.error?.toString()}
                        </pre>
                        <button
                            onClick={() => { localStorage.removeItem('userInfo'); window.location.href = '/auth/manager'; }}
                            className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-bold"
                        >
                            Clear Session & Retry
                        </button>
                    </div>
                </div>
            );
        }
        return <ManagerDashboard />;
    }
}

export { ManagerDashboardErrorBoundary };
