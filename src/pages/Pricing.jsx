import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Star, Zap, Crown, Shield } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

const PLANS = {
    FREE: 'free',
    PRO: 'pro',
    ULTRA: 'ultra'
};

const Pricing = () => {
    const { user, userProfile, refreshProfile } = useAuth();
    const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
    const [processing, setProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    const isPro = userProfile?.plan === 'pro';
    const isUltra = userProfile?.ultra_premium;

    // PayPal Configuration
    const isSandbox = (import.meta.env.VITE_PAYPAL_CLIENT_ID || "").includes("sb-") ||
        (import.meta.env.VITE_PAYPAL_CLIENT_ID || "").length < 50;

    const initialOptions = {
        "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb",
        currency: "USD",
        intent: "subscription",
        vault: true, // Crucial for subscriptions
    };

    const handleApprove = async (data, actions, planType, priceMethod) => {
        setProcessing(true);
        try {
            // For subscription: 
            // data.subscriptionID contains the ID of the created subscription

            // Call Edge Function
            const { data: funcData, error } = await supabase.functions.invoke('activate-plan', {
                body: {
                    userId: user.id,
                    planType: priceMethod === 'yearly' ? `${planType}_yearly` : `${planType}_monthly`,
                    subscriptionId: data.subscriptionID
                }
            });

            if (error) throw error;

            await refreshProfile();
            setSuccessMessage(`Successfully upgraded to ${planType.toUpperCase()}! 🎉`);
            setTimeout(() => setSuccessMessage(null), 5000);

        } catch (err) {
            console.error(err);
            alert("Payment failed or activation error. Please contact support.");
        } finally {
            setProcessing(false);
        }
    };

    // Card Component
    const PricingCard = ({ title, price, features, recommended, type }) => {
        const isCurrentPlan = type === 'free' ? (!isPro) : (type === 'pro' ? isPro : isUltra);

        // Determine Plan ID based on type and cycle
        let planId = null;
        if (type === 'pro') {
            console.log("Plan ID:", import.meta.env.VITE_PAYPAL_PLAN_ID_PRO_MONTHLY); // Debug log
            planId = billingCycle === 'yearly'
                ? import.meta.env.VITE_PAYPAL_PLAN_ID_PRO_YEARLY
                : import.meta.env.VITE_PAYPAL_PLAN_ID_PRO_MONTHLY;
        } else if (type === 'ultra') {
            // Ultra is yearly only in this implementation logic
            planId = import.meta.env.VITE_PAYPAL_PLAN_ID_ULTRA_YEARLY;
        }

        return (
            <div
                className={`relative p-8 rounded-2xl backdrop-blur-xl border transition-all duration-300 flex flex-col h-full group ${recommended
                    ? 'border-purple-500/50 bg-purple-900/10 hover:border-purple-400 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
            >
                {/* Glow Effect on Hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {recommended && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg z-20">
                        MOST POPULAR
                    </div>
                )}

                <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
                <div className="mb-6">
                    <span className="text-4xl font-bold text-white">{price}</span>
                    {price !== 'Free' && <span className="text-white/60">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>}
                </div>

                <ul className="space-y-4 mb-8 flex-1 relative z-10">
                    {features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-white/80">
                            {feature.included ? (
                                <Check className="w-5 h-5 text-green-400 shrink-0" />
                            ) : (
                                <X className="w-5 h-5 text-red-400/50 shrink-0" />
                            )}
                            <span className={feature.included ? '' : 'text-white/40'}>{feature.text}</span>
                        </li>
                    ))}
                </ul>

                <div className="mt-auto relative z-10">
                    {isCurrentPlan ? (
                        <button disabled className="w-full py-3.5 rounded-full bg-white/10 text-white/50 font-semibold cursor-not-allowed border border-white/5">
                            Current Plan
                        </button>
                    ) : type === 'free' ? (
                        <button disabled className="w-full py-3.5 rounded-full bg-white/10 text-white/50 font-semibold cursor-not-allowed border border-white/5">
                            Included
                        </button>
                    ) : (
                        <div className="relative w-full flex items-center justify-center pt-4">
                            <PayPalButtons
                                className="w-full relative z-10"
                                forceReRender={[billingCycle, type]}
                                style={{
                                    layout: "horizontal",
                                    height: 48,
                                    tagline: false,
                                    shape: 'pill',
                                    label: 'paypal', // 'paypal' label gives the cleanest logo-only look 
                                    color: 'gold'
                                }}
                                createSubscription={(data, actions) => {
                                    const isInvalid = !planId ||
                                        planId.includes('PLACEHOLDER') ||
                                        planId.includes('XXXXX') ||
                                        planId.includes('YYYYY') ||
                                        planId.includes('UUUUU') ||
                                        planId.includes('TEST') ||
                                        planId.length < 10;

                                    if (isInvalid) {
                                        const msg = `CRITICAL: Invalid PayPal Plan ID: "${planId}".\n\n` +
                                            "PayPal strictly requires a real Plan ID (usually starting with P- followed by ~20 characters).\n\n" +
                                            "Please create a real plan in your PayPal Dashboard and update your .env file.";
                                        alert(msg);
                                        throw new Error("Invalid Plan ID format");
                                    }
                                    return actions.subscription.create({
                                        plan_id: planId,
                                        application_context: {
                                            brand_name: "Cinematic Voice AI",
                                            locale: "en-US",
                                            shipping_preference: "NO_SHIPPING",
                                            user_action: "SUBSCRIBE_NOW",
                                            return_url: window.location.origin + "/pricing?success=true",
                                            cancel_url: window.location.origin + "/pricing?canceled=true"
                                        }
                                    });
                                }}
                                onApprove={(data, actions) => handleApprove(data, actions, type, billingCycle)}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <PayPalScriptProvider options={initialOptions}>
            <div className="min-h-screen bg-deep-black text-white py-20 px-4 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-6"
                        >
                            Unlock Cinematic Intelligence
                        </motion.h1>
                        <p className="text-xl text-white/60 max-w-2xl mx-auto mb-8">
                            Choose the plan that fits your creative needs. Upgrade anytime.
                        </p>

                        {/* Toggle */}
                        <div className="flex items-center justify-center gap-4 mb-12">
                            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-white/60'}`}>Monthly</span>
                            <button
                                onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                                className="w-16 h-8 rounded-full bg-white/10 relative p-1 transition-colors hover:bg-white/20"
                            >
                                <motion.div
                                    className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg"
                                    animate={{ x: billingCycle === 'monthly' ? 0 : 32 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            </button>
                            <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-white' : 'text-white/60'}`}>
                                Yearly <span className="text-green-400 text-xs ml-1">(Save 45%)</span>
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* FREE PLAN */}
                        <PricingCard
                            title="Free"
                            price="Free"
                            type="free"
                            features={[
                                { text: "Normal Voice: 50/day", included: true },
                                { text: "Cinematic Voice: 10/day", included: true },
                                { text: "Basic AI Features", included: true },
                                { text: "Standard Processing", included: true },
                                { text: "Custom Voice Builder", included: false },
                            ]}
                        />

                        {/* PRO PLAN */}
                        <PricingCard
                            title="Pro"
                            price={billingCycle === 'yearly' ? '$59' : '$9'}
                            type="pro"
                            recommended={true}
                            features={[
                                { text: "Unlimited Normal Voices", included: true },
                                { text: "Unlimited Cinematic Voices", included: true },
                                { text: "All AI Features Unlocked", included: true },
                                { text: "Priority Processing", included: true },
                                { text: "Custom Voice Builder", included: false },
                            ]}
                        />

                        {/* ULTRA ADDON */}
                        <PricingCard
                            title="Ultra Premium"
                            price={billingCycle === 'yearly' ? '$399' : '$59'}
                            // Ultra is strictly Yearly based on prompt "$199/year (separate from Pro)"
                            // Prompt says "Ultra Premium ($1.99/year)" in payments section but "Plan 3.. $199" in text.
                            // I'll assume it's yearly only.
                            type="ultra"
                            features={[
                                { text: "Everything in Pro", included: true },
                                { text: "Custom AI Character Voice Builder", included: true },
                                { text: "Define Personality & Tone", included: true },
                                { text: "Generate Custom AI Voices", included: true },
                                { text: "Early Access to New Features", included: true },
                            ]}
                        />
                    </div>
                </div>

                {/* Success Overlay */}
                <AnimatePresence>
                    {successMessage && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                        >
                            <div className="bg-gradient-to-br from-purple-900/90 to-black p-8 rounded-3xl border border-purple-500/50 text-center max-w-sm mx-auto shadow-2xl">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.5 }}
                                    className="text-6xl mb-4"
                                >
                                    🎉
                                </motion.div>
                                <h2 className="text-3xl font-bold text-white mb-2">Premium Unlocked!</h2>
                                <p className="text-white/70 mb-6">{successMessage}</p>
                                <button
                                    onClick={() => setSuccessMessage(null)}
                                    className="px-8 py-3 rounded-full bg-white text-black font-bold hover:scale-105 transition-transform"
                                >
                                    Awesome!
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PayPalScriptProvider>
    );
};

export default Pricing;
