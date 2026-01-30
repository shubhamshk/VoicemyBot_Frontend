import { motion } from 'framer-motion';

const avatars = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike"
];

const Community = () => {
    return (
        <section id="community" className="py-24 border-t border-white/5 bg-black/40">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <h2 className="text-3xl font-bold mb-8">Trusted by AI Storytellers</h2>

                <div className="flex justify-center -space-x-4 mb-8">
                    {avatars.map((src, i) => (
                        <motion.img
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            src={src}
                            alt="User"
                            className="w-16 h-16 rounded-full border-4 border-black bg-gray-800"
                        />
                    ))}
                    <div className="w-16 h-16 rounded-full border-4 border-black bg-gray-800 flex items-center justify-center text-xs font-bold text-white">
                        +2k
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 max-w-lg mx-auto mb-12">
                    <div className="glass-panel p-6 rounded-2xl">
                        <div className="text-3xl font-bold text-neon-blue mb-1">5,000+</div>
                        <div className="text-sm text-white/50">Active Users</div>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl">
                        <div className="text-3xl font-bold text-neon-purple mb-1">4.9/5</div>
                        <div className="text-sm text-white/50">Chrome Store Rating</div>
                    </div>
                </div>

                <blockquote className="text-xl italic text-white/80 max-w-2xl mx-auto font-light">
                    "Finally, my AI characters don't sound like robots. The multi-voice feature completely changes the immersion. It's like watching a movie."
                    <footer className="mt-4 text-sm font-bold not-italic text-neon-blue">- Alex C., Digital Artist</footer>
                </blockquote>
            </div>
        </section>
    );
};

export default Community;
