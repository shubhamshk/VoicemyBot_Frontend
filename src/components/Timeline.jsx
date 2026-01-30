import { motion } from 'framer-motion';

const steps = [
    { title: "Install Extension", description: "Get started in seconds" },
    { title: "Open AI Chat", description: "Works with your favorite platforms" },
    { title: "Click Play", description: "Instant cinematic narration" },
    { title: "Enjoy Story", description: "Immerse in the audio experience" }
];

const Timeline = () => {
    return (
        <section className="py-24 relative">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-16">
                    How It <span className="text-gradient-primary">Works</span>
                </h2>

                <div className="relative">
                    {/* Line */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2" />

                    <div className="grid md:grid-cols-4 gap-8 relative z-10">
                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="flex flex-col items-center group"
                            >
                                <div className="w-16 h-16 rounded-full glass-panel border border-white/20 flex items-center justify-center text-xl font-bold mb-4 group-hover:border-neon-blue group-hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] transition-all bg-black">
                                    {i + 1}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                                <p className="text-white/50 text-sm">{step.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Timeline;
