import { useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';

const ManagerAuth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        messName: '',
        messCode: '',
        location: '',
        phone: '',
        gender: 'male'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const url = isLogin
            ? `${API_URL}/api/auth/login`
            : `${API_URL}/api/auth/register`;

        // Force role to manager
        const payload = { ...formData, role: 'manager' };

        // Show toast for server waking up (Render free tier cold start)
        const loadingToast = toast.loading('Connecting to server... (may take 30s on first load)');

        try {
            const { data } = await axios.post(url, payload, {
                withCredentials: true,
                timeout: 60000 // 60 second timeout for cold start
            });

            toast.dismiss(loadingToast);

            // Check if user is actually a manager
            if (data.role !== 'manager') {
                toast.error("This account is not a Manager account.");
                return;
            }

            toast.success(isLogin ? 'Welcome back, Manager!' : 'Mess Created Successfully!');
            // CRITICAL: Clear ALL previous session data before setting new user
            localStorage.clear();
            sessionStorage.clear();
            localStorage.setItem('userInfo', JSON.stringify(data));
            // Force hard reload to clear any cached React state
            window.location.href = '/manager/dashboard';
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error("Login Error Details:", error);

            let errorMessage = 'Authentication failed.';

            if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
                errorMessage = 'Server is waking up. Please try again in a few seconds!';
            } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
                errorMessage = 'Server is starting up. Please wait 30 seconds and try again.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark flex items-center justify-center p-4 relative overflow-hidden">
            <Toaster position="top-right" />
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px]" />

            <motion.div
                layout
                className="w-full max-w-md bg-gray-900/60 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
                            <span className="text-xl font-bold">M</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white">
                            {isLogin ? 'Manager Portal' : 'Register New Mess'}
                        </h1>
                        <p className="text-gray-400 mt-2 text-sm">
                            {isLogin ? 'Manage your mess efficiently' : 'Create your mess profile'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <>
                                <input type="text" name="name" placeholder="Full Name" onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" required />
                                <input type="text" name="messName" placeholder="Mess Name" onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" required />
                                <input type="text" name="messCode" placeholder="Create Unique Mess Code" onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" required />
                                <input type="text" name="location" placeholder="Location" onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" required />

                                <div className="flex gap-4 px-2">
                                    <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="male"
                                            checked={formData.gender === 'male'}
                                            onChange={handleChange}
                                            className="accent-purple-500 w-4 h-4"
                                        />
                                        <span>Male</span>
                                    </label>
                                    <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="female"
                                            checked={formData.gender === 'female'}
                                            onChange={handleChange}
                                            className="accent-purple-500 w-4 h-4"
                                        />
                                        <span>Female</span>
                                    </label>
                                </div>
                            </>
                        )}

                        <input type="email" name="email" placeholder="Email Address" onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" required />

                        {/* Password field with show/hide toggle */}
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                onChange={handleChange}
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pr-16 text-white focus:border-purple-500 outline-none"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-purple-400 transition-colors font-medium uppercase"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>

                        {isLogin && (
                            <div className="flex justify-end">
                                <Link to="/forgot-password" className="text-xs text-purple-400 hover:text-purple-300">
                                    Forgot Password?
                                </Link>
                            </div>
                        )}

                        <button disabled={loading} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all mt-4">
                            {loading ? 'Processing...' : (isLogin ? 'Login as Manager' : 'Create Mess')}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button onClick={() => setIsLogin(!isLogin)} className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                            {isLogin ? "Need to register a mess? Sign Up" : "Already have an account? Login"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ManagerAuth;
