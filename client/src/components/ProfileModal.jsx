import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ProfileModal = ({ isOpen, onClose, user }) => {
    const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

    // Reset confirm state when modal closes
    React.useEffect(() => {
        if (!isOpen) setShowLogoutConfirm(false);
    }, [isOpen]);

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
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden"
                >
                    {showLogoutConfirm ? (
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Confirm Logout</h3>
                            <p className="text-gray-400 mb-8">Are you sure you want to log out of your account?</p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        localStorage.clear();
                                        sessionStorage.clear();
                                        window.location.href = '/';
                                    }}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors"
                                >
                                    Yes, Log Out
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Header with decorative background */}
                            <div className="h-24 bg-gradient-to-r from-purple-600 to-blue-600 relative">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full p-1.5 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>

                            {/* Avatar & Info */}
                            <div className="px-6 pb-6 mt-[-3rem] relative">
                                <div className="flex flex-col items-center">
                                    <div className="w-24 h-24 rounded-full border-4 border-gray-900 bg-gray-800 p-1 shadow-xl">
                                        <img
                                            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=random&color=fff`}
                                            alt="Profile"
                                            className="w-full h-full rounded-full bg-gray-700 object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = `https://ui-avatars.com/api/?name=${user?.name}&background=random&color=fff`;
                                            }}
                                        />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mt-3">{user?.name}</h2>
                                    <span className="px-3 py-1 bg-gray-800 text-gray-300 text-xs font-semibold uppercase tracking-wider rounded-full mt-2 border border-gray-700">
                                        {user?.role}
                                    </span>
                                </div>

                                <div className="mt-8 space-y-4">
                                    <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                                        <label className="block text-xs text-gray-500 uppercase font-semibold mb-1">Contact Details</label>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 text-gray-300">
                                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                                <span>{user?.email}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-300">
                                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                                <span>{user?.phone || 'Not provided'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {user?.role === 'manager' && (
                                        <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                                            <label className="block text-xs text-purple-400 uppercase font-semibold mb-1">Mess Information</label>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Mess Name</span>
                                                    <span className="text-white font-medium">{user?.messName || 'Main Mess'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Location</span>
                                                    <span className="text-white font-medium">{user?.location || 'Campus Center'}</span>
                                                </div>
                                                <div className="flex justify-between pt-2 border-t border-purple-500/20 mt-2">
                                                    <span className="text-gray-400">Mess Code</span>
                                                    <code className="bg-purple-500/20 px-2 py-0.5 rounded text-purple-300 font-mono text-sm">{user?.messCode}</code>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {user?.role === 'student' && (
                                        <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                                            <label className="block text-xs text-green-400 uppercase font-semibold mb-1">Membership</label>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Linked Mess</span>
                                                    <span className="text-white font-medium">{user?.messName || 'Campus Mess'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Mess Code</span>
                                                    <code className="bg-green-500/20 px-2 py-0.5 rounded text-green-300 font-mono text-sm">{user?.messCode || 'N/A'}</code>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setShowLogoutConfirm(true)}
                                        className="w-full py-3 mt-4 bg-red-600/10 hover:bg-red-600/20 text-red-500 hover:text-red-400 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                        Log Out
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ProfileModal;
