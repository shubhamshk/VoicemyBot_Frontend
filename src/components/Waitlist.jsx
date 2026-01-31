import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Check, ChevronRight, DollarSign, Mail, Loader2, Lock, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LoginModal from "./LoginModal";

// Initialize Supabase Client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// PayPal Client ID should be in env
const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || "test";

const ContributionModal = ({ isOpen, onClose, amount, setAmount, handlePayPalApprove, handleSkip, isSubmitting }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-[#0a0a0a] rounded-3xl p-8 border border-white/10 shadow-2xl overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue to-neon-purple" />
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>

                    <div className="text-center space-y-2 mb-8 mt-2">
                        <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                            Help us grow faster <span className="text-2xl">🚀</span>
                        </h3>
                        <p className="text-white/60 text-sm">
                            Your contribution helps us bring this extension to more platforms.
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6 mb-8">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-white/70 uppercase tracking-widest">Contribution</label>
                            <div className="relative w-32">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-neon-blue w-4 h-4" />
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="w-full bg-black/50 border border-white/20 rounded-lg py-2 pl-8 pr-3 text-white font-mono text-right focus:outline-none focus:border-neon-blue transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <input
                                type="range"
                                min="5"
                                max="2000"
                                step="5"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-blue hover:accent-neon-purple transition-all"
                            />
                            <div className="flex justify-between text-xs text-white/30 font-mono">
                                <span>$5</span>
                                <span>$2000</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 relative z-10">
                        <PayPalScriptProvider options={{ "client-id": paypalClientId }}>
                            <PayPalButtons
                                style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay" }}
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
                            />
                        </PayPalScriptProvider>

                        <button
                            onClick={handleSkip}
                            disabled={isSubmitting}
                            className="w-full py-3 rounded-lg text-white/60 hover:text-white text-sm font-medium hover:bg-white/5 transition-all flex items-center justify-center cursor-pointer"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Skip & Join Waitlist for Free"}
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
                        Join the waitlist and help us bring this extension to more platforms.
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
