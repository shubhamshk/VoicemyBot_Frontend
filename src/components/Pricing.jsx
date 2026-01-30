import { motion } from 'framer-motion';

const PricingCard = ({ title, price, features, isPremium = false }) => (
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
            {price === 'Free' ? 'Free' : <>{price}<span className="text-lg font-normal text-white/50">/mo</span></>}
        </div>

        <ul className="space-y-4 mb-8">
            {features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-white/70">
                    <span className={`text-lg ${isPremium ? 'text-neon-blue' : 'text-white/30'}`}>✓</span>
                    {feature}
                </li>
            ))}
        </ul>

        <button className={`w-full py-3 rounded-xl font-bold transition-all ${isPremium
                ? 'btn-primary shadow-lg'
                : 'bg-white/10 hover:bg-white/20'
            }`}>
            {isPremium ? 'Get Started' : 'Try For Free'}
        </button>
    </motion.div>
);

const Pricing = () => {
    return (
        <section id="pricing" className="py-24 relative">
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
                        title="Pro Creator"
                        price="$19"
                        features={[
                            "Premium Cinematic Voices",
                            "Unlimited Listening",
                            "Emotion Control",
                            "Priority Support",
                            "Early Access features"
                        ]}
                        isPremium={true}
                    />
                    <PricingCard
                        title="Enterprise"
                        price="$49"
                        features={[
                            "Custom Voice Clones",
                            "API Access",
                            "Team Management",
                            "SSO",
                            "Dedicated Account Manager"
                        ]}
                    />
                </div>
            </div>
        </section>
    );
};

export default Pricing;
