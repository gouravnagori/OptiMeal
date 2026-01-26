import { useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';

const StudentAuth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        messCode: '',
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

        // Force role to student
        const payload = { ...formData, role: 'student' };

        try {
            const { data } = await axios.post(url, payload, { withCredentials: true });

            // Check if user is actually a student
            if (data.role !== 'student') {
                toast.error("This account is not a Student account.");
                return;
            }

            toast.success(isLogin ? 'Welcome back!' : 'Joined Mess Successfully!');
            // CRITICAL: Clear ALL previous session data before setting new user
            localStorage.clear();
            sessionStorage.clear();
            localStorage.setItem('userInfo', JSON.stringify(data));
            // Force hard reload to clear any cached React state
            window.location.href = '/student/dashboard';
        } catch (error) {
            console.error("Login Error Details:", error);
            const errorMessage = error.response?.data?.message
                || error.message
                || 'Authentication failed. Check server connection.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark flex items-center justify-center p-4 relative overflow-hidden">
            <Toaster position="top-right" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]" />

            <motion.div
                layout
                className="w-full max-w-md bg-gray-900/60 backdrop-blur-xl border border-primary/30 rounded-2xl shadow-2xl overflow-hidden z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
                            <span className="text-xl font-bold text-dark">S</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white">
                            {isLogin ? 'Student Portal' : 'Join a Mess'}
                        </h1>
                        <p className="text-gray-400 mt-2 text-sm">
                            {isLogin ? 'Login to check your daily menu' : 'Enter your mess code to join'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <>
                                <input type="text" name="name" placeholder="Full Name" onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-primary outline-none" required />
                                <input type="text" name="messCode" placeholder="Enter Mess Code" onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-primary outline-none" required />
                                <input type="number" name="phone" placeholder="Phone Number" onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-primary outline-none" />

                                <div className="flex gap-4 px-2">
                                    <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="male"
                                            checked={formData.gender === 'male'}
                                            onChange={handleChange}
                                            className="accent-primary w-4 h-4"
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
                                            className="accent-primary w-4 h-4"
                                        />
                                        <span>Female</span>
                                    </label>
                                </div>
                            </>
                        )}

                        <input type="email" name="email" placeholder="Email Address" onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-primary outline-none" required />

                        {/* Password field with show/hide toggle */}
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                onChange={handleChange}
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pr-16 text-white focus:border-primary outline-none"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-primary transition-colors font-medium uppercase"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>

                        <button disabled={loading} className="w-full bg-primary hover:bg-primary-dark text-dark font-bold py-3 rounded-xl transition-all mt-4">
                            {loading ? 'Processing...' : (isLogin ? 'Login as Student' : 'Join Mess')}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:text-primary-dark text-sm font-medium">
                            {isLogin ? "New student? Join a mess here" : "Already have an account? Login"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default StudentAuth;
