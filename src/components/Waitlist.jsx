import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Check, ChevronRight, DollarSign, Mail, Loader2, Lock, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LoginModal from "./LoginModal";
import { supabase } from "../lib/supabaseClient";

// PayPal Client ID should be in env
const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || "test";

const ContributionModal = ({ isOpen, onClose, amount, setAmount, handlePayPalApprove, handleSkip, isSubmitting }) => {
    if (!isOpen) return null;

    const isAmountValid = amount >= 5;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 30 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-md bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] rounded-3xl p-6 border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden"
                >
                    {/* Animated gradient borders */}
                    <div className="absolute inset-0 rounded-3xl opacity-50 pointer-events-none">
                        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent animate-pulse" />
                        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-neon-purple to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
                    </div>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/30 hover:text-white hover:rotate-90 transition-all duration-300 z-20 cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Header - More compact */}
                    <div className="text-center space-y-1 mb-6 relative z-10">
                        <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                            Fuel the Revolution <span className="text-2xl">🚀</span>
                        </h3>
                        <p className="text-white/50 text-xs max-w-xs mx-auto">
                            Your contribution funds better voice models & faster servers
                        </p>
                    </div>

                    {/* Amount Input & Slider - Compact */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-5 mb-5 relative group backdrop-blur-sm">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 via-transparent to-neon-purple/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        {/* Amount display */}
                        <div className="flex items-center justify-between relative z-10">
                            <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Amount</label>
                            <div className="relative">
                                <DollarSign className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-all duration-300 ${isAmountValid ? 'text-neon-blue' : 'text-red-400'}`} />
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    min="5"
                                    className={`w-32 bg-black/60 border rounded-xl py-2 pl-8 pr-3 text-white font-mono text-lg text-right focus:outline-none transition-all duration-300 ${isAmountValid
                                        ? 'border-white/20 focus:border-neon-blue focus:shadow-[0_0_20px_rgba(0,243,255,0.3)]'
                                        : 'border-red-500/50 focus:border-red-500'
                                        }`}
                                />
                            </div>
                        </div>

                        {/* Custom animated slider */}
                        <div className="space-y-3 relative z-10">
                            <div className="relative h-3 bg-white/5 rounded-full overflow-visible group/slider">
                                {/* Progress bar with gradient */}
                                <motion.div
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-neon-blue via-purple-500 to-neon-purple rounded-full shadow-[0_0_15px_rgba(0,243,255,0.5)]"
                                    initial={false}
                                    animate={{ width: `${Math.min((amount / 2000) * 100, 100)}%` }}
                                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                                />

                                {/* Custom slider thumb */}
                                <motion.div
                                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-[0_0_20px_rgba(0,243,255,0.8)] border-2 border-neon-blue cursor-grab active:cursor-grabbing group-hover/slider:scale-125 transition-transform duration-200"
                                    initial={false}
                                    animate={{ left: `calc(${Math.min((amount / 2000) * 100, 100)}% - 10px)` }}
                                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                                    style={{ pointerEvents: 'none' }}
                                />

                                {/* Invisible range input */}
                                <input
                                    type="range"
                                    min="5"
                                    max="2000"
                                    step="5"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                            </div>

                            {/* Min/Max labels */}
                            <div className="flex justify-between items-center text-xs font-mono">
                                <span className="text-white/30">$5</span>
                                {!isAmountValid && (
                                    <motion.span
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-red-400 font-bold flex items-center gap-1"
                                    >
                                        ⚠️ Min $5
                                    </motion.span>
                                )}
                                <span className="text-white/30">$2000</span>
                            </div>
                        </div>
                    </div>

                    {/* PayPal Button Container - Glassmorphism */}
                    <div className="space-y-3 relative z-10">
                        {isAmountValid ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative rounded-2xl overflow-hidden border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                            >
                                {/* Glassmorphism glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/20 via-transparent to-neon-purple/20 opacity-50 pointer-events-none" />

                                <div className="relative z-10">
                                    <PayPalScriptProvider options={{ "client-id": paypalClientId }}>
                                        <PayPalButtons
                                            style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay", height: 48 }}
                                            createOrder={(data, actions) => {
                                                return actions.order.create({
                                                    purchase_units: [
                                                        {
                                                            description: "Cinematic Voice AI - Early Access Contribution",
                                                            amount: {
                                                                value: amount.toString()
                                                            }
                                                        }
                                                    ]
                                                });
                                            }}
                                            onApprove={handlePayPalApprove}
                                            onError={(err) => console.error("PayPal Error:", err)}
                                        />
                                    </PayPalScriptProvider>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="min-h-[120px] flex items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
                                <p className="text-white/30 text-sm">Adjust amount to continue</p>
                            </div>
                        )}

                        {/* Divider */}
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#0a0a0a] px-3 text-white/30">Or</span>
                            </div>
                        </div>

                        {/* Skip button */}
                        <button
                            onClick={handleSkip}
                            disabled={isSubmitting}
                            className="w-full py-3 rounded-xl text-white/60 hover:text-white text-sm font-medium hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300 flex items-center justify-center cursor-pointer gap-2 group"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <span className="group-hover:scale-105 transition-transform">Skip Contribution</span>
                                    <span className="opacity-50 text-xs">(Join Free)</span>
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const Waitlist = () => {
    const { user } = useAuth(); // Get user from AuthContext
    const [loginOpen, setLoginOpen] = useState(false);
    const [email, setEmail] = useState("");

    // Auto-fill email if user is logged in
    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
    }, [user]);

    const [amount, setAmount] = useState(5);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [contributionModalOpen, setContributionModalOpen] = useState(false);
    const [error, setError] = useState("");

    const handleInitialSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (!user) {
            setLoginOpen(true);
            return;
        }

        if (!email || !email.includes("@")) {
            setError("Please enter a valid email address.");
            return;
        }

        // Open contribution modal
        setContributionModalOpen(true);
    };

    const handleSkip = async () => {
        setIsSubmitting(true);
        try {
            const { error: dbError } = await supabase.from("waitlist_users").insert({
                user_id: user?.id,
                email,
                payment_status: "skipped",
                platform: "none",
            });

            if (dbError) throw dbError;
            setContributionModalOpen(false);
            setIsSuccess(true);
        } catch (err) {
            console.error("Waitlist Error:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePayPalApprove = async (data, actions) => {
        return actions.order.capture().then(async (details) => {
            // Handle successful payment
            try {
                const { error: dbError } = await supabase.from("waitlist_users").insert({
                    user_id: user?.id,
                    email,
                    contribution_amount: amount,
                    payment_status: "paid",
                    platform: "paypal",
                });

                if (dbError) throw dbError;
                setContributionModalOpen(false);
                setIsSuccess(true);
            } catch (err) {
                console.error("Payment Record Error:", err);
                // Even if DB fails, payment succeeded
                setContributionModalOpen(false);
                setIsSuccess(true);
            }
        });
    };


    if (isSuccess) {
        return (
            <section className="py-24 px-6 max-w-4xl mx-auto text-center" id="waitlist-success">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-panel p-12 rounded-3xl border border-neon-blue/30 bg-gradient-to-b from-neon-blue/10 to-transparent relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-neon-blue rounded-full animate-ping" />
                        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-neon-purple rounded-full animate-pulse" />
                    </div>

                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neon-blue/20 text-neon-blue mb-6 border border-neon-blue/50 shadow-[0_0_30px_rgba(0,243,255,0.3)]">
                        <Check className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Welcome to the Future</h2>
                    <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
                        You've successfully joined the waitlist. We'll notify you at <span className="text-neon-blue font-mono">{email}</span> when early access opens.
                    </p>
                </motion.div>
            </section>
        );
    }

    return (
        <section id="waitlist-section" className="py-24 relative px-6">
            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />

            {/* Payment Modal */}
            {contributionModalOpen && (
                <ContributionModal
                    isOpen={contributionModalOpen}
                    onClose={() => setContributionModalOpen(false)}
                    amount={amount}
                    setAmount={setAmount}
                    handlePayPalApprove={handlePayPalApprove}
                    handleSkip={handleSkip}
                    isSubmitting={isSubmitting}
                />
            )}

            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Get Early Access to <span className="text-gradient-primary">Cinematic Voice AI</span>
                    </h2>
                    <p className="text-lg text-white/60">
                        Join the waitlist to get early access for VoiceMyBot.
                    </p>
                </div>

                <motion.div
                    className="glass-panel rounded-3xl border border-white/10 p-1 md:p-2 bg-black/40 backdrop-blur-xl overflow-hidden relative"
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <div className="p-8 md:p-12">
                        {/* Step 1: Login Check & Email */}
                        <form onSubmit={handleInitialSubmit} className="space-y-8">
                            {!user ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                                        <Lock className="w-8 h-8 text-white/50" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Login Required</h3>
                                    <p className="text-white/60 mb-8 max-w-md mx-auto">Please login to join the waitlist and secure your spot.</p>
                                    <button
                                        type="button"
                                        onClick={() => setLoginOpen(true)}
                                        className="btn-primary px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-neon-blue/20 transition-all"
                                    >
                                        Login to Join Waitlist
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row items-end gap-4">
                                        <div className="flex-1 w-full">
                                            <label className="block text-sm font-medium text-white/70 mb-2 uppercase tracking-wider">Email Address</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-neon-blue transition-colors" />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="you@example.com"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-neon-blue/50 focus:bg-white/10 transition-all text-lg"
                                                // Allow editing if they want to use a different email? Usually keeping logged in email is safer, but user might want notifications elsewhere.
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full md:w-auto px-8 py-4 rounded-xl text-lg font-bold btn-primary hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
                                        >
                                            Next Step <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                    {error && <p className="text-red-400 text-sm flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400" />{error}</p>}
                                </div>
                            )}
                        </form>
                    </div>
                </motion.div>

                {/* Extension Preview Image - placed after waitlist box */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: 0.2 }}
                    className="mt-12 relative rounded-2xl overflow-hidden glass-panel border border-white/10 p-2 bg-gradient-to-br from-white/5 to-white/0 shadow-2xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-neon-blue/10 via-transparent to-neon-purple/10 pointer-events-none" />
                    <img
                        src="https://res.cloudinary.com/dkwxxfewv/image/upload/v1769895796/Untitled_design_otd9jz.png"
                        alt="Extension UI Preview"
                        className="w-full h-auto rounded-xl shadow-lg border border-white/5"
                    />
                </motion.div>

                {/* Conversion Text */}
                <div className="mt-8 text-center space-y-2">
                    <p className="text-sm font-medium text-neon-blue/80 opacity-80">
                        ✨ Be one of the first creators
                    </p>
                    <p className="text-xs text-white/40">
                        Early supporters get lifetime perks & help shape the future of AI storytelling.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Waitlist;
