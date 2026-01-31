import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="py-12 border-t border-white/5 relative z-10 bg-black">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">

                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-linear-to-r from-neon-blue to-neon-purple" />
                    <span className="font-bold tracking-wider text-white">CINEMATIC VOICE AI</span>
                </div>

                <div className="flex flex-wrap justify-center gap-8 text-sm text-white/50">
                    <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-white transition-colors">Twitter</a>
                    <a href="#" className="hover:text-white transition-colors">Discord</a>
                </div>

                <div className="text-sm text-white/30">
                    © 2024 Cinematic Voice AI. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
