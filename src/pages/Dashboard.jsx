
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const Dashboard = () => {
    const { user, logout, userProfile } = useAuth();
    const [planData, setPlanData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchPlanData();
        }
    }, [user]);

    const fetchPlanData = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                console.error('No session found');
                setLoading(false);
                return;
            }

            // Call verifyUserPlan edge function
            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-user-plan`,
                {
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setPlanData(data);
            } else {
                console.error('Failed to fetch plan data');
            }
        } catch (error) {
            console.error('Error fetching plan:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    if (loading) {
        return (
            <div className="min-h-screen pt-24 px-4 bg-black text-white flex items-center justify-center">
                <div className="text-xl">Loading dashboard...</div>
            </div>
        );
    }

    const plan = planData?.plan || 'free';
    const normalUsed = planData?.normal_used_today || 0;
    const cinematicUsed = planData?.cinematic_used_today || 0;
    const isPro = plan === 'pro' || plan === 'ultra';

    const normalLimit = isPro ? Infinity : 50;
    const cinematicLimit = isPro ? Infinity : 10;
    const normalPercent = isPro ? 100 : Math.min((normalUsed / normalLimit) * 100, 100);
    const cinematicPercent = isPro ? 100 : Math.min((cinematicUsed / cinematicLimit) * 100, 100);

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
                                {isPro ? (
                                    <>
                                        {plan === 'ultra' ? 'Ultra' : 'Pro'} Plan
                                        <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                                            ⭐ {plan.toUpperCase()}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        Free Plan
                                        <span className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300">Basic</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="p-6 rounded-2xl bg-black/40 border border-white/5">
                            <h3 className="text-lg text-gray-400 mb-2">Normal Voices Today</h3>
                            <div className="text-2xl font-bold text-white">
                                {isPro ? (
                                    <>
                                        <span className="text-green-400">Unlimited</span> 🎉
                                    </>
                                ) : (
                                    <>
                                        {normalUsed} / {normalLimit} <span className="text-sm text-gray-500 font-normal">today</span>
                                    </>
                                )}
                            </div>
                            {!isPro && (
                                <div className="w-full h-2 bg-gray-800 rounded-full mt-3 overflow-hidden">
                                    <div 
                                        className={`h-full ${normalUsed >= normalLimit ? 'bg-red-500' : 'bg-gradient-to-r from-purple-500 to-blue-500'}`}
                                        style={{ width: `${normalPercent}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 mb-8">
                        <div className="p-6 rounded-2xl bg-black/40 border border-white/5">
                            <h3 className="text-lg text-gray-400 mb-2">Cinematic Voices Today</h3>
                            <div className="text-2xl font-bold text-white">
                                {isPro ? (
                                    <>
                                        <span className="text-green-400">Unlimited</span> 🎉
                                    </>
                                ) : (
                                    <>
                                        {cinematicUsed} / {cinematicLimit} <span className="text-sm text-gray-500 font-normal">today</span>
                                    </>
                                )}
                            </div>
                            {!isPro && (
                                <div className="w-full h-2 bg-gray-800 rounded-full mt-3 overflow-hidden">
                                    <div 
                                        className={`h-full ${cinematicUsed >= cinematicLimit ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-500 to-purple-500'}`}
                                        style={{ width: `${cinematicPercent}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        {!isPro && (
                            <a 
                                href="/pricing"
                                className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all font-semibold shadow-lg shadow-purple-500/20 text-center"
                            >
                                Upgrade to Pro - Unlimited Voices
                            </a>
                        )}
                        {isPro && (
                            <div className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 text-green-400 font-semibold text-center">
                                ✓ You have unlimited access!
                            </div>
                        )}
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
