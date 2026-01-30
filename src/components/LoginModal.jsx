
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const LoginModal = ({ isOpen, onClose }) => {
    const { loginWithGoogle, loginWithDiscord } = useAuth();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative w-full max-w-md bg-[#111] rounded-3xl p-8 border border-white/10 shadow-2xl overflow-hidden"
                >
                    {/* Background decoration */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-purple-600/20 blur-[100px] rounded-full" />
                        <div className="absolute bottom-[-50%] right-[-50%] w-full h-full bg-blue-600/20 blur-[100px] rounded-full" />
                    </div>

                    <div className="relative z-10 text-center">
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
                            Welcome Back
                        </h2>
                        <p className="text-gray-400 mb-8">Sign in to continue to your dashboard</p>

                        <div className="space-y-4">
                            <button
                                onClick={loginWithGoogle}
                                className="w-full py-4 px-6 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-3 group"
                            >
                                <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span>Sign in with Google</span>
                            </button>

                            <button
                                onClick={loginWithDiscord}
                                className="w-full py-4 px-6 rounded-xl bg-[#5865F2] text-white font-bold hover:bg-[#4752C4] transition-all flex items-center justify-center gap-3 group"
                            >
                                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 19.019 19.019 0 0 0-3.361 5.922 18.068 18.068 0 0 0-8.257 0 19.016 19.016 0 0 0-3.361-5.922.077.077 0 0 0-.08-.037 19.736 19.736 0 0 0-4.885 1.515.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.418 2.157-2.418 1.21 0 2.176 1.096 2.157 2.418 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.096 2.157 2.418 0 1.334-.946 2.419-2.157 2.419z" /></svg>
                                <span>Sign in with Discord</span>
                            </button>
                        </div>

                        <button onClick={onClose} className="mt-8 text-sm text-gray-500 hover:text-white transition-colors">
                            Cancel
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LoginModal;
