import { motion } from 'framer-motion';
import ParticleBackground from './ParticleBackground';

const Hero = () => {
    return (
        <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
            <ParticleBackground />

            {/* Background Gradient Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[128px] animate-pulse-glow" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-blue/20 rounded-full blur-[128px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

            <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="inline-block px-4 py-1.5 mb-6 rounded-full glass-panel border border-neon-blue/30"
                >
                    <span className="text-neon-blue text-xs font-bold tracking-[0.2em] uppercase">
                        Next Gen AI Narrator
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-6xl md:text-8xl font-bold tracking-tight mb-6 leading-tight"
                >
                    Give Life to <br />
                    <span className="text-gradient-primary">AI Characters</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-lg md:text-2xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
                >
                    Turn any AI story into a cinematic multi-voice experience.
                    Real emotion. Real depth. Real time.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col md:flex-row items-center justify-center gap-6"
                >
                    <button className="btn-primary w-full md:w-auto px-8 py-4 rounded-full text-lg font-bold tracking-wide shadow-[0_0_30px_rgba(188,19,254,0.3)] hover:shadow-[0_0_50px_rgba(0,243,255,0.4)] transition-shadow">
                        Get Chrome Extension
                    </button>

                    <button className="group w-full md:w-auto px-8 py-4 rounded-full glass-panel text-white font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-neon-blue group-hover:text-black transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                        </span>
                        Watch Demo
                    </button>
                </motion.div>
            </div>

            <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-white/30 text-sm tracking-widest uppercase"
                >
                    Scroll to Explore
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
