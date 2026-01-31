import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import posterImage from '../assets/cinematic_demo_poster.png';

const DemoVideo = () => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { amount: 0.5 });
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);

    useEffect(() => {
        if (isInView && videoRef.current) {
            videoRef.current.play().catch((e) => {
                console.log("Autoplay blocked or failed:", e);
            });
            setIsPlaying(true);
        } else if (!isInView && videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isInView]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const scrollToWaitlist = () => {
        const waitlistSection = document.getElementById('waitlist-section');
        if (waitlistSection) {
            waitlistSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section id="demo-video" className="py-24 relative px-6 bg-black/50" ref={containerRef}>
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] bg-neon-purple/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center">

                <div className="w-full relative rounded-2xl overflow-hidden glass-panel border border-white/10 p-1 bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 shadow-[0_0_50px_rgba(188,19,254,0.1)]">
                    {/* Inner Panel */}
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video group isolate">

                        {/* Video Element */}
                        <video
                            ref={videoRef}
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                            poster={posterImage}
                            loop
                            muted={isMuted}
                            playsInline
                            // Using an abstract tech background video as a placeholder for the demo
                            src="https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-background-loop-2-3210-large.mp4"
                        />

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20 pointer-events-none" />

                        {/* Floating Play/Pause Control */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={togglePlay}
                                className="w-24 h-24 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center pointer-events-auto transition-all hover:bg-white/10 hover:border-neon-blue/50 group/btn shadow-2xl"
                            >
                                <div className="absolute inset-0 rounded-full bg-neon-blue/20 blur-xl opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                {isPlaying ? (
                                    <Pause className="w-10 h-10 text-white fill-white opacity-90 relative z-10" />
                                ) : (
                                    <Play className="w-10 h-10 text-white fill-white opacity-90 ml-1 relative z-10" />
                                )}
                            </motion.button>
                        </div>

                        {/* Bottom Controls & Subtitle */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row items-end md:items-center justify-between gap-6 pointer-events-none">
                            <div className="pointer-events-auto flex-1">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="inline-flex flex-col items-start gap-2"
                                >
                                    <div className="px-4 py-2 rounded-lg glass-panel border-l-4 border-l-neon-cyan bg-black/60 backdrop-blur-md max-w-md">
                                        <p className="text-lg md:text-xl font-medium text-white shadow-black drop-shadow-md">
                                            “See how AI characters come alive with real voices.”
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-neon-blue font-mono uppercase tracking-widest pl-1">
                                        <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
                                        Live Demo
                                    </div>
                                </motion.div>
                            </div>

                            <button
                                onClick={toggleMute}
                                className="pointer-events-auto w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors hover:scale-105 active:scale-95"
                            >
                                {isMuted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DemoVideo;
