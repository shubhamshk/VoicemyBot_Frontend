import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const DemoVideo = () => {
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { amount: 0.5 });

    return (
        <section id="demo-video" className="py-24 relative px-6 bg-black/50" ref={containerRef}>
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] bg-neon-purple/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center">

                <div className="w-full relative rounded-2xl overflow-hidden glass-panel border border-white/10 p-1 bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 shadow-[0_0_50px_rgba(188,19,254,0.1)]">
                    {/* Inner Panel */}
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video group isolate">

                        {/* YouTube Iframe */}
                        <iframe 
                            className="w-full h-full object-cover"
                            src={`https://www.youtube.com/embed/L8JU7AOPonY?autoplay=${isInView ? 1 : 0}&mute=1&loop=1&playlist=L8JU7AOPonY&modestbranding=1&rel=0&iv_load_policy=3&fs=1`} 
                            title="YouTube video player" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerPolicy="strict-origin-when-cross-origin" 
                            allowFullScreen
                        ></iframe>

                        {/* Bottom Info Row */}
                        <div className="absolute bottom-0 left-0 right-0 pointer-events-none bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-32 pb-4">
                            <div className="px-6 md:px-8 flex flex-col items-start gap-4">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="inline-flex flex-col items-start gap-2"
                                >
                                    <div className="px-4 py-2 rounded-lg glass-panel border-l-4 border-l-neon-cyan bg-black/60 backdrop-blur-md max-w-md pointer-events-auto">
                                        <p className="text-lg md:text-xl font-medium text-white shadow-black drop-shadow-md">
                                            “See how AI characters come alive with real voices.”
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-neon-blue font-mono uppercase tracking-widest pl-1 pointer-events-auto">
                                        <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
                                        Live Demo
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DemoVideo;

