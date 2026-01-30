import { motion } from 'framer-motion';

const features = [
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 18h.01" /><path d="M7 18h.01" /><path d="M17 18h.01" /><path d="M5.6 11a2.4 2.4 0 0 0 0 3.8l.8.6a4.8 4.8 0 0 1 0 5.6" /><path d="M18.4 11a2.4 2.4 0 0 1 0 3.8l-.8.6a4.8 4.8 0 0 0 0 5.6" />
                <path d="M12 2a4 4 0 0 0-4 4v5a4 4 0 1 0 8 0V6a4 4 0 0 0-4-4Z" />
            </svg>
        ),
        title: "Multi-Character Voices",
        desc: "Automatically detects different characters and assigns unique voices."
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 10v3" /><path d="M6 6v11" /><path d="M10 3v18" /><path d="M14 8v7" /><path d="M18 5v13" /><path d="M22 10v3" />
            </svg>
        ),
        title: "Smart Narrator",
        desc: "Separates narration from dialogue for a truly cinematic experience."
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
        ),
        title: "Real-time Playback",
        desc: "Zero latency streaming. Hear the story as it helps."
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
        ),
        title: "Emotion Detection",
        desc: "Voices adapt to the emotional context of the scene."
    }
];

const FeatureShowcase = () => {
    return (
        <section id="features" className="py-24 bg-black/50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Beyond Basic <span className="text-gradient-primary">TTS</span>
                    </h2>
                    <p className="text-white/60 max-w-2xl mx-auto">
                        We don't just read text. We perform it.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="glass-panel p-8 rounded-2xl border-white/5 hover:border-neon-blue/50 transition-colors group cursor-pointer"
                        >
                            <div className="text-neon-blue mb-6 group-hover:scale-110 transition-transform duration-300 transform origin-left">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-neon-blue transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-white/50 text-sm leading-relaxed">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeatureShowcase;
