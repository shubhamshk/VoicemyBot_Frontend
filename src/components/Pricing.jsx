import { useState } from 'react';
import { motion } from 'framer-motion';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

// PayPal Configuration
const PAYPAL_CLIENT_ID = "AeTOPbkHmblQBhLPBo5-4wWAVYgzV_9SsjRTskmcLwHdRZU_Zq3sGxjryrVP7bhtbTbsYbpsIJ73glwN";

// Hardcoded Plan IDs to ensure they match exactly what was generated
const PLANS = {
    PRO_MONTHLY: "P-5V340959S9787991KNGEY65Y",
    PRO_YEARLY: "P-3P3608130E2517437NGEY66A",
    ULTRA_YEARLY: "P-9YJ87040W62522501NGEY66I"
};

const PricingCard = ({ title, price, features, isPremium = false, planId, onLoginReq }) => {
    const { user } = useAuth();
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    if (success) {
        return (
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`relative p-8 rounded-3xl min-h-[400px] flex flex-col items-center justify-center text-center ${isPremium
                    ? 'glass-panel border-neon-purple/50 shadow-[0_0_40px_rgba(188,19,254,0.1)]'
                    : 'bg-white/5 border border-white/10'
                    }`}
            >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 text-green-400 text-3xl">✓</div>
                <h3 className="text-2xl font-bold mb-2">Subscribed!</h3>
                <p className="text-white/60">Thank you for upgrading to {title}. Refreshing your session...</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            whileHover={{ y: -10 }}
            className={`relative p-8 rounded-3xl ${isPremium
                ? 'glass-panel border-neon-purple/50 shadow-[0_0_40px_rgba(188,19,254,0.1)]'
                : 'bg-white/5 border border-white/10'
                }`}
        >
            {isPremium && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-neon-blue to-neon-purple px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Most Popular
                </div>
            )}

            <h3 className="text-2xl font-bold mb-2">{title}</h3>
            <div className="text-4xl font-bold mb-6">
                {price === 'Free' ? 'Free' : <>{price}<span className="text-lg font-normal text-white/50">{price.includes('/mo') ? '' : '/yr'}</span></>}
            </div>

            <ul className="space-y-4 mb-8">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/70">
                        <span className={`text-lg ${isPremium ? 'text-neon-blue' : 'text-white/30'}`}>✓</span>
                        {feature}
                    </li>
                ))}
            </ul>

            {planId ? (
                user ? (
                    <div className="relative z-10 w-full min-h-[45px]">
                        {error && (
                            <div className="text-red-400 text-sm mb-2 text-center bg-red-500/10 p-2 rounded">
                                {error}
                            </div>
                        )}
                        <PayPalButtons
                            style={{ shape: 'rect', color: isPremium ? 'gold' : 'blue', layout: 'vertical', label: 'subscribe' }}
                            createSubscription={(data, actions) => {
                                return actions.subscription.create({
                                    plan_id: planId
                                });
                            }}
                            onApprove={(data, actions) => {
                                console.log('Subscription approved:', data);
                                setSuccess(true);
                                // Here you would typically send the subscriptionID to your backend
                                // For now, we simulate success
                                setTimeout(() => window.location.reload(), 2000);
                            }}
                            onError={(err) => {
                                console.error('PayPal Error:', err);
                                setError("Payment failed. Please try again.");
                            }}
                        />
                    </div>
                ) : (
                    <button
                        onClick={onLoginReq}
                        className={`w-full py-3 rounded-xl font-bold transition-all ${isPremium
                            ? 'btn-primary shadow-lg'
                            : 'bg-white/10 hover:bg-white/20'
                            }`}
                    >
                        Login to Subscribe
                    </button>
                )
            ) : (
                <button className={`w-full py-3 rounded-xl font-bold transition-all ${isPremium
                    ? 'btn-primary shadow-lg'
                    : 'bg-white/10 hover:bg-white/20'
                    }`}>
                    {price === 'Free' ? 'Current Plan' : 'Get Started'}
                </button>
            )}
        </motion.div>
    );
};

const Pricing = () => {
    const [loginOpen, setLoginOpen] = useState(false);

    return (
        <PayPalScriptProvider options={{
            "client-id": PAYPAL_CLIENT_ID,
            vault: true,
            intent: "subscription"
        }}>
            <section id="pricing" className="py-24 relative">
                <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />

                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Simple <span className="text-gradient-primary">Pricing</span>
                        </h2>
                        <p className="text-white/60">Start for free, upgrade for the full cinematic experience.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <PricingCard
                            title="Starter"
                            price="Free"
                            features={[
                                "Basic Voice Models",
                                "10 minutes / month",
                                "Standard Quality",
                                "Web Support"
                            ]}
                        />
                        <PricingCard
                            title="Pro Monthly"
                            price="$9/mo"
                            features={[
                                "Premium Cinematic Voices",
                                "Unlimited Listening",
                                "Emotion Control",
                                "Priority Support",
                                "Monthly Billing"
                            ]}
                            planId={PLANS.PRO_MONTHLY}
                            onLoginReq={() => setLoginOpen(true)}
                        />
                        <PricingCard
                            title="Pro Yearly"
                            price="$59/yr"
                            features={[
                                "All Pro Features",
                                "2 Months Free",
                                "Best Value",
                                "Priority Badge",
                                "Early Access Features"
                            ]}
                            isPremium={true}
                            planId={PLANS.PRO_YEARLY}
                            onLoginReq={() => setLoginOpen(true)}
                        />
                    </div>

                    <div className="mt-12 text-center">
                        {/* Ultra Plan (Hidden for now, available in code if needed: PLANS.ULTRA_YEARLY) */}
                    </div>
                </div>
            </section>
        </PayPalScriptProvider>
    );
};

export default Pricing;
