import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Star, Crown, Shield, Infinity as InfinityIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import LoginModal from './LoginModal';
import { useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

const PricingCard = ({ title, price, subtitle, features, recommended, type, isLifetime = false, billingCycle, onLoginReq, onSuccess, onError, checkoutPlan, onCheckoutReq }) => {
    const { user, userProfile } = useAuth();
    
    const isPro = userProfile?.plan === 'pro';
    const isUltra = userProfile?.ultra_premium;
    const isCurrentPlan = type === 'free' ? (!isPro && !isUltra) : (isLifetime ? isUltra : (isPro && !isUltra));

    let planId = null;
    if (type === 'pro_monthly') planId = import.meta.env.VITE_PAYPAL_PLAN_ID_MONTHLY;
    if (type === 'pro_yearly') planId = import.meta.env.VITE_PAYPAL_PLAN_ID_YEARLY;

    const handleSubscriptionApprove = async (data, actions) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('No active session.');

            const { data: funcData, error } = await supabase.functions.invoke('activate-plan', {
                body: { userId: user.id, planType: type, subscriptionId: data.subscriptionID },
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (error) throw new Error(error.message);
            onSuccess(`Successfully upgraded! 🎉`);
            onCheckoutReq(null);
        } catch (err) {
            onError(`${err.message || 'Payment processing failed'}.`);
        }
    };

    const handleOrderApprove = async (data, actions) => {
        try {
            const order = await actions.order.capture();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('No active session.');

            const { data: funcData, error } = await supabase.functions.invoke('activate-plan', {
                body: { userId: user.id, planType: "ultra_premium", subscriptionId: order.id },
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (error) throw new Error(error.message);
            onSuccess(`Successfully unlocked Lifetime Access! 🎉`);
            onCheckoutReq(null);
        } catch (err) {
            onError(`${err.message || 'Payment processing failed'}.`);
        }
    };

    const handleActionClick = () => {
        if (!user) {
            onLoginReq();
            return;
        }
        onCheckoutReq(type);
    };

    return (
        <motion.div
            whileHover={{ y: -10 }}
            className={`relative p-8 rounded-3xl backdrop-blur-xl border transition-all duration-300 flex flex-col h-full group ${recommended
                ? 'border-purple-500/50 bg-purple-900/10 shadow-[0_0_40px_-10px_rgba(168,85,247,0.4)] md:-mt-4 md:mb-4'
                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }`}
        >
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
                {isCurrentPlan ? (
                    <button disabled className="w-full py-4 rounded-xl font-bold bg-white/10 text-white/50 cursor-not-allowed border border-white/5">
                        {type === 'free' ? 'Included' : 'Current Plan'}
                    </button>
                ) : type === 'free' ? (
                    <button disabled className="w-full py-4 rounded-xl font-bold bg-white/10 text-white/50 cursor-not-allowed border border-white/5">
                        Included
                    </button>
                ) : checkoutPlan !== type ? (
                    <button 
                        onClick={handleActionClick}
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
                                        onError={(err) => onError("Payment failed. Please try again.")}
                                    />
                                </PayPalScriptProvider>
                            ) : (
                                <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID, currency: "USD", intent: "subscription", vault: true }}>
                                    <PayPalButtons
                                        key={planId}
                                        style={{ layout: "horizontal", height: 48, shape: 'rect', label: 'subscribe', color: 'gold', tagline: false }}
                                        createSubscription={(data, actions) => {
                                            return actions.subscription.create({ plan_id: planId });
                                        }}
                                        onApprove={handleSubscriptionApprove}
                                        onError={(err) => onError("Payment failed. Please try again.")}
                                    />
                                </PayPalScriptProvider>
                            )}
                        </div>
                        <button onClick={() => onCheckoutReq(null)} className="w-full mt-2 text-white/50 text-sm hover:text-white transition-colors">
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
        </motion.div>
    );
};

const Pricing = () => {
    const [loginOpen, setLoginOpen] = useState(false);
    const [billingCycle, setBillingCycle] = useState('yearly'); // 'monthly' | 'yearly'
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [checkoutPlan, setCheckoutPlan] = useState(null);
    const { refreshProfile } = useAuth();
    
    const handleSuccess = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => { refreshProfile(); setSuccessMessage(null); window.location.reload(); }, 3000);
    };

    const handleError = (msg) => {
        setErrorMessage(msg);
        setTimeout(() => setErrorMessage(null), 5000);
    };

    return (
        <section id="pricing" className="py-32 relative text-white">
            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />

            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16 relative z-20">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
                        Priced for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">Creators</span>
                    </h2>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
                        Unlock cinematic intelligence and custom AI voices for your next big project.
                    </p>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-6 mb-12">
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
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch relative z-20">
                    <PricingCard
                        title="Starter"
                        subtitle="Perfect for trying out the cinematic AI voices."
                        price="$0"
                        type="free"
                        billingCycle={billingCycle}
                        onLoginReq={() => setLoginOpen(true)}
                        checkoutPlan={checkoutPlan}
                        onCheckoutReq={setCheckoutPlan}
                        features={[
                            { text: "Normal Voice: 50/day", included: true },
                            { text: "Cinematic Voice: 10/day", included: true },
                            { text: "Basic AI Features", included: true },
                            { text: "Standard Processing", included: true },
                            { text: "Custom Voice Builder", included: false },
                            { text: "Commercial License", included: false },
                        ]}
                    />

                    <PricingCard
                        title="Pro"
                        subtitle="For serious creators needing unlimited access."
                        price={billingCycle === 'yearly' ? '$4' : '$9'}
                        type={billingCycle === 'yearly' ? 'pro_yearly' : 'pro_monthly'}
                        recommended={true}
                        billingCycle={billingCycle}
                        onLoginReq={() => setLoginOpen(true)}
                        onSuccess={handleSuccess}
                        onError={handleError}
                        checkoutPlan={checkoutPlan}
                        onCheckoutReq={setCheckoutPlan}
                        features={[
                            { text: "Unlimited Normal Voices", included: true },
                            { text: "Unlimited Cinematic Voices", included: true },
                            { text: "All AI Features Unlocked", included: true },
                            { text: "Priority Processing Limits", included: true },
                            { text: "Custom Voice Builder", included: true },
                            { text: "Commercial License", included: true },
                        ]}
                    />

                    <PricingCard
                        title="Lifetime"
                        subtitle="Pay once, own the Pro features forever."
                        price="$199"
                        type="lifetime"
                        isLifetime={true}
                        billingCycle={billingCycle}
                        onLoginReq={() => setLoginOpen(true)}
                        onSuccess={handleSuccess}
                        onError={handleError}
                        checkoutPlan={checkoutPlan}
                        onCheckoutReq={setCheckoutPlan}
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
        </section>
    );
};

export default Pricing;
