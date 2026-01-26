
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error

    useEffect(() => {
        if (!token) {
            setStatus('error');
            return;
        }

        const verify = async () => {
            try {
                await axios.get(`${API_URL}/api/auth/verify-email?token=${token}`);
                setStatus('success');
                toast.success('Email verified successfully!');
                setTimeout(() => {
                    // Redirect to login (assuming we don't know if student or manager, send to landing or one of them)
                    // Or maybe just show a button
                }, 2000);
            } catch (error) {
                console.error(error);
                setStatus('error');
                toast.error(error.response?.data?.message || 'Verification failed');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen bg-dark text-white flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-gray-900 border border-gray-800 p-8 rounded-2xl text-center"
            >
                {status === 'verifying' && (
                    <>
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                        <h2 className="text-2xl font-bold mb-2">Verifying Email...</h2>
                        <p className="text-gray-400">Please wait while we verify your email address.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                            ✓
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-green-500">Email Verified!</h2>
                        <p className="text-gray-400 mb-6">Your account has been successfully verified.</p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => navigate('/auth/student')}
                                className="px-6 py-2 bg-primary text-dark font-bold rounded-lg hover:bg-primary-dark transition-colors"
                            >
                                Student Login
                            </button>
                            <button
                                onClick={() => navigate('/auth/manager')}
                                className="px-6 py-2 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600 transition-colors"
                            >
                                Manager Login
                            </button>
                        </div>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                            ✕
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-red-500">Verification Failed</h2>
                        <p className="text-gray-400 mb-6">The link might be invalid or expired.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-2 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Return Home
                        </button>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default VerifyEmail;
