
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import LoginModal from './LoginModal';

const Navbar = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoginOpen, setIsLoginOpen] = useState(false);

    return (
        <>
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
            >
                <div className="max-w-7xl mx-auto glass-panel rounded-full px-6 py-3 flex items-center justify-between backdrop-blur-md bg-black/50 border border-white/10">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 animate-pulse" />
                        <span className="font-bold text-xl tracking-wider text-white">CINEMATIC VOICE AI</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        {['Features', 'Demo', 'Pricing', 'Community'].map((item) => (
                            <a
                                key={item}
                                href={`/#${item.toLowerCase()}`}
                                className="text-white/70 hover:text-cyan-400 transition-colors text-sm font-medium tracking-wide"
                            >
                                {item}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                {user.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="User" className="w-9 h-9 rounded-full border border-white/20" />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">
                                        {user.email?.[0].toUpperCase()}
                                    </div>
                                )}
                                <span className="hidden sm:inline font-medium text-sm">Dashboard</span>
                            </Link>
                        ) : (
                            <motion.button
                                onClick={() => setIsLoginOpen(true)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-2 rounded-full bg-white text-black text-sm font-bold tracking-wide hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                                Login
                            </motion.button>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="hidden sm:block px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold tracking-wide shadow-lg shadow-purple-500/20 cursor-pointer"
                        >
                            Get Extension
                        </motion.button>
                    </div>
                </div>
            </motion.nav>

            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        </>
    );
};

export default Navbar;
