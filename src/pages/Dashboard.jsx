
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { user, logout } = useAuth();

    if (!user) return null; // Should be handled by protected route wrapper ideally

    return (
        <div className="min-h-screen pt-24 px-4 bg-black text-white relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/40 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/40 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl"
                >
                    <div className="flex items-center gap-6 mb-8">
                        {user.user_metadata?.avatar_url ? (
                            <img
                                src={user.user_metadata.avatar_url}
                                alt={user.user_metadata.full_name}
                                className="w-20 h-20 rounded-full border-2 border-purple-500 shadow-lg"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl font-bold">
                                {user.email?.[0].toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                Welcome, {user.user_metadata?.full_name || 'User'}
                            </h1>
                            <p className="text-gray-400">{user.email}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="p-6 rounded-2xl bg-black/40 border border-white/5">
                            <h3 className="text-lg text-gray-400 mb-2">Current Plan</h3>
                            <div className="text-2xl font-bold text-white flex items-center gap-2">
                                Free Plan
                                <span className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300">Basic</span>
                            </div>
                        </div>
                        <div className="p-6 rounded-2xl bg-black/40 border border-white/5">
                            <h3 className="text-lg text-gray-400 mb-2">Voice Generations</h3>
                            <div className="text-2xl font-bold text-white">0 / 50 <span className="text-sm text-gray-500 font-normal">this month</span></div>
                            <div className="w-full h-2 bg-gray-800 rounded-full mt-3 overflow-hidden">
                                <div className="w-[0%] h-full bg-gradient-to-r from-purple-500 to-blue-500" />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all font-semibold shadow-lg shadow-purple-500/20">
                            Upgrade to Premium
                        </button>
                        <button
                            onClick={logout}
                            className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-gray-300"
                        >
                            Logout
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
