import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileModal from './ProfileModal';
import LiveClock from './LiveClock';

const Navbar = ({ role, userName }) => {
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Get full user object for the modal
    let user = {};
    try {
        user = JSON.parse(localStorage.getItem('userInfo')) || {};
    } catch (e) {
        console.error("Failed to parse user info", e);
    }

    const handleLogout = () => {
        // CRITICAL: Clear ALL session data
        localStorage.clear();
        sessionStorage.clear();
        // Force full reload to clear any in-memory React state
        window.location.href = '/';
    };

    return (
        <>
            <nav className="p-4 flex justify-between items-center bg-gray-900/50 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <img src="/optimeal-logo.png?v=2" alt="OptiMeal Logo" className="w-12 h-12 rounded-xl object-contain" />
                    <div>
                        <h1 className="text-xl font-display font-bold text-white leading-none">OptiMeal</h1>
                        <span className="text-xs text-gray-400 capitalize">{role} Portal</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <LiveClock />
                    <div className="hidden md:block text-right cursor-pointer" onClick={() => setIsProfileOpen(true)}>
                        <p className="text-sm font-medium text-white hover:text-primary transition-colors">{userName}</p>
                        <p className="text-xs text-green-400">● Online</p>
                    </div>

                    <button
                        onClick={() => setIsProfileOpen(true)}
                        className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border border-gray-600 hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 relative group"
                    >
                        <img
                            src={user?.avatar || `https://ui-avatars.com/api/?name=${userName}&background=random&color=fff`}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${userName}&background=random&color=fff`;
                            }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-bold">
                            VIEW
                        </div>
                    </button>


                </div>
            </nav>

            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={user}
            />
        </>
    );
};

export default Navbar;
