import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Star, Zap, Crown, Shield, Infinity as InfinityIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

const Pricing = () => {
    const { user, userProfile, refreshProfile } = useAuth();
    const [billingCycle, setBillingCycle] = useState('yearly'); // 'monthly' | 'yearly'
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [checkoutPlan, setCheckoutPlan] = useState(null);

    const isPro = userProfile?.plan === 'pro';
    const isUltra = userProfile?.ultra_premium;

    // Check URL for success/error parameters from PayPal redirect
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('success') === 'true') {
            setSuccessMessage('Payment successful! Your plan has been activated. 🎉');
            window.history.replaceState({}, '', '/pricing');
            setTimeout(() => { refreshProfile(); setSuccessMessage(null); }, 3000);
        } else if (params.get('canceled') === 'true') {
            setErrorMessage('Payment was canceled. You can try again anytime.');
            window.history.replaceState({}, '', '/pricing');
            setTimeout(() => setErrorMessage(null), 5000);
        }
    }, [refreshProfile]);

    const handleSubscriptionApprove = async (data, actions, planType) => {
        console.log('[PayPal] Subscription approved:', data);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('No active session. Please log in again.');

            const { data: funcData, error } = await supabase.functions.invoke('activate-plan', {
                body: { userId: user.id, planType: planType, subscriptionId: data.subscriptionID },
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });

            if (error) throw new Error(error.message || 'Failed to activate plan');
            
            await refreshProfile();
            setSuccessMessage(`Successfully upgraded! 🎉`);
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (err) {
            console.error('[PayPal] Error:', err);
            setErrorMessage(`${err.message || 'Payment processing failed'}.`);
            setTimeout(() => setErrorMessage(null), 8000);
        }
    };

    const handleOrderApprove = async (data, actions) => {
        try {
            const order = await actions.order.capture();
            console.log('[PayPal] Capture result', order);

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('No active session. Please log in again.');

            // Calling edge function to activate lifetime plan (assuming ultra_premium serves as lifetime here)
            const { data: funcData, error } = await supabase.functions.invoke('activate-plan', {
                body: { userId: user.id, planType: "ultra_premium", subscriptionId: order.id },
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });

            if (error) throw new Error(error.message || 'Failed to activate plan');
            
            await refreshProfile();
            setSuccessMessage(`Successfully unlocked Lifetime Access! 🎉`);
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (err) {
            console.error('[PayPal Capture] Error:', err);
            setErrorMessage(`${err.message || 'Payment processing failed'}.`);
            setTimeout(() => setErrorMessage(null), 8000);
        }
    };

    // Card Component
    const PricingCard = ({ title, price, subtitle, features, recommended, type, isLifetime = false }) => {
        const isCurrentPlan = type === 'free' ? (!isPro && !isUltra) : (isLifetime ? isUltra : (isPro && !isUltra));

        let planId = null;
        if (type === 'pro_monthly') planId = import.meta.env.VITE_PAYPAL_PLAN_ID_MONTHLY;
        if (type === 'pro_yearly') planId = import.meta.env.VITE_PAYPAL_PLAN_ID_YEARLY;

        return (
            <div
                className={`relative p-8 rounded-3xl backdrop-blur-xl border transition-all duration-300 flex flex-col h-full group ${recommended
                    ? 'border-purple-500/50 bg-purple-900/10 hover:border-purple-400 hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.4)] md:-mt-4 md:mb-4'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
            >
                {/* Glow Effect on Hover */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {recommended && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg z-20 flex items-center gap-1.5 whitespace-nowrap">
                        <Star className="w-4 h-4 fill-current" /> MOST POPULAR
                    </div>
                )}
                {isLifetime && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg z-20 flex items-center gap-1.5 whitespace-nowrap">
                        <Crown className="w-4 h-4 fill-current" /> BEST VALUE
                    </div>
                )}

                <div className="mb-6 relative z-10">
                    <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        {title}
                        {isLifetime && <InfinityIcon className="w-6 h-6 text-amber-500" />}
                    </h3>
                    <p className="text-white/60 text-sm h-10">{subtitle}</p>
                </div>
                
                <div className="mb-8 relative z-10">
                    <div className="flex items-baseline">
                        <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">{price}</span>
                        <span className="text-white/50 ml-2 font-medium">
                            {isLifetime ? 'forever' : '/month'}
                        </span>
                    </div>
                    {type === 'pro_yearly' && (
                        <div className="text-white/40 text-sm mt-1">Billed $49 yearly</div>
                    )}
                </div>

                <ul className="space-y-4 mb-8 flex-1 relative z-10">
                    {features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-white/80">
                            {feature.included ? (
                                <div className={`mt-1 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${recommended ? 'bg-purple-500/20 text-purple-400' : isLifetime ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>
                                    <Check className="w-3.5 h-3.5" />
                                </div>
                            ) : (
                                <div className="mt-1 shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-red-500/10 text-red-400/50">
                                    <X className="w-3.5 h-3.5" />
                                </div>
                            )}
                            <span className={feature.included ? 'font-medium' : 'text-white/40 line-through'}>{feature.text}</span>
                        </li>
                    ))}
                </ul>

                <div className="mt-auto relative z-10">
                    {!user ? (
                        <button disabled className="w-full py-4 rounded-xl font-bold bg-white/10 text-white/50 cursor-not-allowed border border-white/5">
                            Please Login First
                        </button>
                    ) : isCurrentPlan ? (
                        <button disabled className="w-full py-4 rounded-xl font-bold bg-white/10 text-white/50 cursor-not-allowed border border-white/5">
                            {type === 'free' ? 'Included' : 'Current Plan'}
                        </button>
                    ) : type === 'free' ? (
                        <button disabled className="w-full py-4 rounded-xl font-bold bg-white/10 text-white/50 cursor-not-allowed border border-white/5">
                            Included
                        </button>
                    ) : checkoutPlan !== type ? (
                        <button 
                            onClick={() => setCheckoutPlan(type)}
                            className={`w-full py-4 rounded-xl font-bold transition-all duration-300 ${
                                recommended
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-[1.02]'
                                    : isLifetime
                                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-[1.02]'
                                        : 'bg-white/10 text-white hover:bg-white/20 hover:scale-[1.02] border border-white/5'
                            }`}
                        >
                            {isLifetime ? 'Get Lifetime Access' : 'Choose Plan'}
                        </button>
                    ) : (
                        <div className="mt-auto pt-2 w-full animate-in fade-in duration-300">
                            <div className="relative w-full overflow-hidden bg-transparent rounded-xl">
                                {isLifetime ? (
                                    <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}>
                                        <PayPalButtons
                                            style={{ layout: "horizontal", height: 48, shape: 'rect', label: 'pay', color: 'gold', tagline: false }}
                                            createOrder={(data, actions) => {
                                                return actions.order.create({
                                                    purchase_units: [{
                                                        description: "Lifetime Access Cinematic Voice AI",
                                                        amount: { value: "199.00" }
                                                    }]
                                                });
                                            }}
                                            onApprove={handleOrderApprove}
                                            onError={(err) => setErrorMessage("Payment failed. Please try again.")}
                                        />
                                    </PayPalScriptProvider>
                                ) : (
                                    <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID, currency: "USD", intent: "subscription", vault: true }}>
                                        <PayPalButtons
                                            key={planId} // Force re-render when planId changes
                                            style={{ layout: "horizontal", height: 48, shape: 'rect', label: 'subscribe', color: 'gold', tagline: false }}
                                            createSubscription={(data, actions) => {
                                                return actions.subscription.create({ plan_id: planId });
                                            }}
                                            onApprove={(data, actions) => handleSubscriptionApprove(data, actions, type)}
                                            onError={(err) => setErrorMessage("Payment failed. Please try again.")}
                                        />
                                    </PayPalScriptProvider>
                                )}
                            </div>
                            <button onClick={() => setCheckoutPlan(null)} className="w-full mt-2 text-white/50 text-sm hover:text-white transition-colors">
                                Cancel
                            </button>
                        </div>
                    )}
                    {isLifetime && (
                        <div className="text-center mt-3 text-xs text-amber-500/80 flex justify-center items-center gap-1">
                            <Shield className="w-3 h-3" /> One-time payment, yours forever
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (!PAYPAL_CLIENT_ID) {
        return (
            <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center bg-black text-center px-4">
                <div className="bg-red-900/50 border border-red-500 rounded-xl p-8 max-w-2xl text-white">
                    <h2 className="text-2xl font-bold mb-4 text-red-400">❌ Missing VITE_PAYPAL_CLIENT_ID</h2>
                    <p className="mb-4">Check your `.env` configuration file.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white py-32 px-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/10 rounded-full blur-[150px]" />
                <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[60%] h-[20%] bg-blue-600/5 rounded-full blur-[150px]" />
            </div>

            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20 relative z-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-purple-400 font-medium mb-6"
                    >
                        <Zap className="w-4 h-4" /> Next-Gen AI Voice Cloning
                    </motion.div>
                    
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
                    >
                        Priced for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">Creators</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-white/60 max-w-2xl mx-auto mb-10"
                    >
                        Choose the perfect plan to unlock cinematic intelligence and custom AI voices for your next big project.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center justify-center gap-6 mb-12"
                    >
                        <span className={`text-lg font-medium transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-white/40'}`}>Monthly</span>
                        <div 
                            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                            className="w-20 h-10 rounded-full bg-white/10 relative p-1 cursor-pointer transition-colors hover:bg-white/20 border border-white/5 flex items-center"
                        >
                            <motion.div
                                className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30"
                                animate={{ x: billingCycle === 'monthly' ? 0 : 40 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            />
                        </div>
                        <span className={`text-lg font-medium transition-colors flex items-center gap-2 ${billingCycle === 'yearly' ? 'text-white' : 'text-white/40'}`}>
                            Yearly
                            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full font-bold border border-green-500/20">Save 55%</span>
                        </span>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch lg:items-center relative z-20">
                    <div className="lg:h-[95%]">
                        <PricingCard
                            title="Starter"
                            subtitle="Perfect for trying out the cinematic AI voices."
                            price="$0"
                            type="free"
                            features={[
                                { text: "Normal Voice: 50/day", included: true },
                                { text: "Cinematic Voice: 10/day", included: true },
                                { text: "Basic AI Features", included: true },
                                { text: "Standard Processing", included: true },
                                { text: "Custom Voice Builder", included: false },
                                { text: "Commercial License", included: false },
                            ]}
                        />
                    </div>

                    <div className="lg:h-full relative z-30">
                        <PricingCard
                            title="Pro"
                            subtitle="For serious creators needing unlimited access."
                            price={billingCycle === 'yearly' ? '$49' : '$9'}
                            type={billingCycle === 'yearly' ? 'pro_yearly' : 'pro_monthly'}
                            recommended={true}
                            features={[
                                { text: "Unlimited Normal Voices", included: true },
                                { text: "Unlimited Cinematic Voices", included: true },
                                { text: "All AI Features Unlocked", included: true },
                                { text: "Priority Processing Limits", included: true },
                                { text: "Custom Voice Builder", included: true },
                                { text: "Commercial License", included: true },
                            ]}
                        />
                    </div>

                    <div className="lg:h-[95%]">
                        <PricingCard
                            title="Lifetime"
                            subtitle="Pay once, own the Pro features forever."
                            price="$199"
                            type="lifetime"
                            isLifetime={true}
                            features={[
                                { text: "Everything in Pro included", included: true },
                                { text: "Never pay a monthly fee again", included: true },
                                { text: "Custom AI Character Voices", included: true },
                                { text: "Define Personality & Tone", included: true },
                                { text: "Generate Custom AI Voices", included: true },
                                { text: "Early Access to New Models", included: true },
                            ]}
                        />
                    </div>
                </div>
                
                <div className="mt-40 max-w-4xl mx-auto relative z-20">
                    <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white/5 border border-white/5 p-6 rounded-2xl hover:bg-white/10 transition-colors">
                            <h4 className="text-lg font-bold mb-2 text-purple-400">Can I cancel anytime?</h4>
                            <p className="text-white/60 text-sm leading-relaxed">Yes, for the Pro monthly and yearly plans, you can cancel your subscription at any time. You will retain access until the end of your billing cycle.</p>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-6 rounded-2xl hover:bg-white/10 transition-colors">
                            <h4 className="text-lg font-bold mb-2 text-amber-500">What does Lifetime mean?</h4>
                            <p className="text-white/60 text-sm leading-relaxed">The Lifetime plan gives you one-time access to all current and future Pro features without any recurring payments. Pay once, use forever.</p>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-6 rounded-2xl hover:bg-white/10 transition-colors">
                            <h4 className="text-lg font-bold mb-2 text-purple-400">Can I use voices commercially?</h4>
                            <p className="text-white/60 text-sm leading-relaxed">Yes, both the Pro and Lifetime plans include a full commercial license, allowing you to use generated audio in monetized YouTube videos, games, podcasts, and client work.</p>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-6 rounded-2xl hover:bg-white/10 transition-colors">
                            <h4 className="text-lg font-bold mb-2 text-purple-400">How does the Voice Builder work?</h4>
                            <p className="text-white/60 text-sm leading-relaxed">Upload a clear 1-minute audio sample, and our AI will clone the voice characteristics, tone, and inflection to generate a completely new AI voice profile.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlays */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    >
                        <div className="bg-gradient-to-br from-purple-900/90 to-black p-8 rounded-3xl border border-purple-500/50 text-center max-w-sm mx-auto shadow-2xl">
                            <h2 className="text-3xl font-bold text-white mb-2">Success!</h2>
                            <p className="text-white/70 mb-6">{successMessage}</p>
                            <button onClick={() => setSuccessMessage(null)} className="px-8 py-3 rounded-full bg-white text-black font-bold">Awesome!</button>
                        </div>
                    </motion.div>
                )}
                {errorMessage && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    >
                        <div className="bg-gradient-to-br from-red-900/90 to-black p-8 rounded-3xl border border-red-500/50 text-center max-w-sm mx-auto shadow-2xl">
                            <h2 className="text-3xl font-bold text-white mb-2">Payment Issue</h2>
                            <p className="text-white/70 mb-6">{errorMessage}</p>
                            <button onClick={() => setErrorMessage(null)} className="px-8 py-3 rounded-full bg-white text-black font-bold">Got it</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Pricing;
