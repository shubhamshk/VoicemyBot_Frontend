import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Check, ChevronRight, DollarSign, Globe, Mail, Sparkles, Loader2, ArrowRight } from "lucide-react";

// Initialize Supabase Client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// PayPal Client ID should be in env
const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || "test";

const Waitlist = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [url, setUrl] = useState("");
    const [amount, setAmount] = useState(5);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");

    const validateUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return string.includes(".") && string.length > 3; // Basic fallback
        }
    };

    const handleStep1Submit = (e) => {
        e.preventDefault();
        setError("");

        if (!email || !email.includes("@")) {
            setError("Please enter a valid email address.");
            return;
        }
        if (!url || !validateUrl(url)) {
            setError("Please enter a valid URL (e.g., https://example.com).");
            return;
        }

        setStep(2);
    };

    const handleAmountChange = (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 0;
        // We update state, but on blur we might clamp it if needed, or just warn.
        // Slider handles bounds, input should too.
        setAmount(val);
    };

    const handleAmountBlur = () => {
        if (amount < 5) setAmount(5);
        if (amount > 2000) setAmount(2000);
    };

    const handleSkip = async () => {
        setIsSubmitting(true);
        try {
            const { error: dbError } = await supabase.from("waitlist_users").insert({
                email,
                url,
                payment_status: "skipped",
                platform: "none",
            });

            if (dbError) throw dbError;
            setIsSuccess(true);
        } catch (err) {
            console.error("Waitlist Error:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePayPalSuccess = async (details) => {
        // Called after successful payment capture
        try {
            const { error: dbError } = await supabase.from("waitlist_users").insert({
                email,
                url,
                contribution_amount: amount,
                payment_status: "paid",
                platform: "paypal",
            });

            if (dbError) throw dbError;
            setIsSuccess(true);
        } catch (err) {
            console.error("Payment Record Error:", err);
            // Even if DB fails, payment succeeded. We should probably show success anyway or retry.
            setIsSuccess(true);
        }
    };

    if (isSuccess) {
        return (
            <section className="py-24 px-6 max-w-4xl mx-auto text-center" id="waitlist-success">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-panel p-12 rounded-3xl border border-neon-blue/30 bg-gradient-to-b from-neon-blue/10 to-transparent relative overflow-hidden"
                >
                    {/* Confetti / particles can be simulated with CSS or a library, keeping it simple here */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-neon-blue rounded-full animate-ping" />
                        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-neon-purple rounded-full animate-pulse" />
                        <div className="absolute bottom-1/4 center w-4 h-4 bg-white/50 rounded-full animate-bounce" />
                    </div>

                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neon-blue/20 text-neon-blue mb-6 border border-neon-blue/50 shadow-[0_0_30px_rgba(0,243,255,0.3)]">
                        <Check className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Welcome to the Future</h2>
                    <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
                        You've successfully joined the waitlist. We'll notify you at <span className="text-neon-blue font-mono">{email}</span> when early access opens.
                    </p>
                    <div className="flex justify-center gap-4">
                        {/* Could add social share buttons here */}
                    </div>
                </motion.div>
            </section>
        );
    }

    return (
        <section id="waitlist-section" className="py-24 relative px-6">
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
                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-neon-blue to-neon-purple transition-all duration-500 z-10"
                        style={{ width: step === 1 ? '50%' : '100%' }} />

                    <div className="p-8 md:p-12">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.form
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleStep1Submit}
                                    className="space-y-8"
                                >
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-white/70 mb-2 uppercase tracking-wider">Email Address</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-neon-blue transition-colors" />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="you@example.com"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-neon-blue/50 focus:bg-white/10 transition-all text-lg"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-white/70 mb-2 uppercase tracking-wider">Where will you use Cinematic Voice AI?</label>
                                            <div className="relative group">
                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-neon-purple transition-colors" />
                                                <input
                                                    type="text"
                                                    value={url}
                                                    onChange={(e) => setUrl(e.target.value)}
                                                    placeholder="https://janitorai.com/..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-neon-purple/50 focus:bg-white/10 transition-all text-lg"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {error && <p className="text-red-400 text-sm flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400" />{error}</p>}

                                    <button type="submit" className="flex items-center justify-center gap-2 w-full py-4 rounded-xl text-lg font-bold btn-primary hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg cursor-pointer">
                                        Next Step <ChevronRight className="w-5 h-5" />
                                    </button>
                                </motion.form>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-8"
                                >
                                    <div className="text-center space-y-2">
                                        <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                                            Help us grow faster <span className="text-2xl">🚀</span>
                                        </h3>
                                        <p className="text-white/60 text-sm md:text-base max-w-md mx-auto">
                                            Your contribution helps us bring this extension to more platforms and add powerful new features.
                                        </p>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-white/70 uppercase tracking-widest">Contribution</label>
                                            <div className="relative w-32">
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-neon-blue w-4 h-4" />
                                                <input
                                                    type="number"
                                                    value={amount}
                                                    onChange={handleAmountChange}
                                                    onBlur={handleAmountBlur}
                                                    className="w-full bg-black/50 border border-white/20 rounded-lg py-2 pl-8 pr-3 text-white font-mono text-right focus:outline-none focus:border-neon-blue transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {/* Custom Logic for range slider styling */}
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

                                    <div className="space-y-3">
                                        {/* PayPal Integration */}
                                        <div className="z-0 relative">
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
                                        </div>

                                        <button
                                            onClick={handleSkip}
                                            disabled={isSubmitting}
                                            className="w-full py-3 rounded-lg text-white/60 hover:text-white text-sm font-medium hover:bg-white/5 transition-all flex items-center justify-center cursor-pointer"
                                        >
                                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Skip & Join Waitlist for Free"}
                                        </button>

                                        <div className="text-center pt-2">
                                            <button onClick={() => setStep(1)} className="text-xs text-white/30 hover:text-white/50 underline cursor-pointer">
                                                Back to Step 1
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
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
