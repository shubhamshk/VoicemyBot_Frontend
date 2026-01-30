import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const ChatMessage = ({ role, text, playAudio }) => (
    <motion.div
        initial={{ opacity: 0, x: role === 'user' ? 20 : -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
        <div className={`max-w-[80%] p-4 rounded-2xl ${role === 'user'
                ? 'bg-white/10 text-white rounded-tr-sm'
                : 'glass-panel border-neon-blue/30 text-white rounded-tl-sm'
            }`}>
            <p className="text-sm md:text-base leading-relaxed">{text}</p>
            {role === 'ai' && (
                <div className="mt-2 flex items-center gap-2">
                    <button className="text-xs text-neon-blue hover:text-white transition-colors flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                            <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        Play Voice
                    </button>
                    <div className="h-1 w-12 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            animate={{ width: ["0%", "100%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="h-full bg-neon-blue"
                        />
                    </div>
                </div>
            )}
        </div>
    </motion.div>
);

const AudioVisualizer = () => {
    return (
        <div className="flex items-center justify-center gap-1 h-12">
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ height: ["20%", "100%", "20%"] }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: "easeInOut"
                    }}
                    className="w-2 bg-gradient-to-t from-neon-purple to-neon-blue rounded-full"
                    style={{ height: '40%' }}
                />
            ))}
        </div>
    );
};

const InteractiveStory = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-linear-to-r from-transparent via-neon-blue/20 to-transparent" />

            <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">

                <div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold mb-6"
                    >
                        Experience the <br />
                        <span className="text-gradient-primary">Interactive Story</span>
                    </motion.h2>
                    <p className="text-white/60 text-lg mb-8 leading-relaxed">
                        Watch as your characters come to life with distinct voices and personalities.
                        The narrator sets the scene, and characters speak with emotion.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-neon-purple/20 flex items-center justify-center text-neon-purple border border-neon-purple/50">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-white">Multi-Voice Generation</h4>
                                <p className="text-sm text-white/50">Distinct voices for every character.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-neon-blue/20 flex items-center justify-center text-neon-blue border border-neon-blue/50">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /><path d="M3 6h18" /><path d="M3 10h18" /><path d="M3 14h18" /><path d="M3 18h18" /></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-white">Context Awareness</h4>
                                <p className="text-sm text-white/50">Voices adapt to the story's emotion.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 bg-neon-blue/10 blur-[80px] rounded-full" />

                    <div className="glass-panel p-6 rounded-3xl relative border border-white/10 min-h-[500px] flex flex-col">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-neon-blue to-neon-purple" />
                                <div>
                                    <h3 className="font-bold text-white">Sci-Fi Adventure</h3>
                                    <p className="text-xs text-white/50">Chapter 1: The Arrival</p>
                                </div>
                            </div>
                            <AudioVisualizer />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                            <ChatMessage role="ai" text="The airlock hissed open, revealing a landscape of shimmering crystal structures." />
                            <ChatMessage role="user" text="Is it safe to go out?" />
                            <ChatMessage role="ai" text="Captain Vance scanned the horizon. 'Readings are stable, but stay sharp.' his voice echoed." />
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5">
                            <div className="h-10 bg-white/5 rounded-full w-full animate-pulse" />
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default InteractiveStory;
