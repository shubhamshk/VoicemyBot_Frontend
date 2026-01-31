import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';

const ExtensionAuth = () => {
    const { user, loginWithGoogle, loginWithDiscord, logout, loading } = useAuth();
    const [debugInfo, setDebugInfo] = useState([]);
    const [sessionSent, setSessionSent] = useState(false);

    const addDebug = (message) => {
        console.log(message);
        setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    useEffect(() => {
        // Get extension ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const extensionId = urlParams.get('extensionId');
        
        addDebug(`[Init] Extension ID: ${extensionId || 'MISSING!'}`);
        addDebug(`[Init] Chrome available: ${typeof chrome !== 'undefined'}`);
        addDebug(`[Init] Current URL: ${window.location.href}`);

        const syncSession = async () => {
            const { data } = await supabase.auth.getSession();
            
            if (data?.session) {
                console.log(data.session.access_token); // Log the JWT token
                addDebug("[Session] ✓ Found Supabase session");
                addDebug(`[Session] User: ${data.session.user?.email}`);
                
                // Store in localStorage
                try {
                    localStorage.setItem('cinematicAuthSession', JSON.stringify({
                        session: data.session,
                        timestamp: Date.now()
                    }));
                    addDebug("[LocalStorage] ✓ Stored session");
                } catch (err) {
                    addDebug(`[LocalStorage] ✗ Error: ${err.message}`);
                }
                
                // Dispatch custom event
                try {
                    const event = new CustomEvent('CINEMATIC_AUTH_EVENT', {
                        detail: { session: data.session }
                    });
                    window.dispatchEvent(event);
                    addDebug("[CustomEvent] ✓ Dispatched CINEMATIC_AUTH_EVENT");
                } catch (err) {
                    addDebug(`[CustomEvent] ✗ Error: ${err.message}`);
                }
                
                setSessionSent(true);
                
                // Give content script time to pick up the session
                setTimeout(() => {
                    addDebug("[Info] Session should be synced now. You can close this tab manually.");
                }, 2000);
            } else {
                addDebug("[Session] No session found (user not logged in)");
            }
        };

        // Check immediately
        syncSession();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            addDebug(`[AuthStateChange] Event: ${event}`);
            
            if (event === 'SIGNED_IN' && session) {
                addDebug(`[AuthStateChange] ✓ User signed in: ${session.user?.email}`);
                
                // Store in localStorage
                try {
                    localStorage.setItem('cinematicAuthSession', JSON.stringify({
                        session: session,
                        timestamp: Date.now()
                    }));
                    addDebug("[LocalStorage] ✓ Stored session after sign-in");
                } catch (err) {
                    addDebug(`[LocalStorage] ✗ Error: ${err.message}`);
                }
                
                // Dispatch custom event
                try {
                    const customEvent = new CustomEvent('CINEMATIC_AUTH_EVENT', {
                        detail: { session: session }
                    });
                    window.dispatchEvent(customEvent);
                    addDebug("[CustomEvent] ✓ Dispatched CINEMATIC_AUTH_EVENT");
                } catch (err) {
                    addDebug(`[CustomEvent] ✗ Error: ${err.message}`);
                }
                
                setSessionSent(true);
                
                setTimeout(() => {
                    addDebug("[Info] ✓ Authentication complete! Close this tab and check your extension.");
                }, 2000);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] bg-purple-900/20 blur-[150px] rounded-full" />
            </div>

            {user && (
                <button
                    onClick={logout}
                    className="absolute top-6 right-6 px-4 py-2 text-sm text-gray-400 hover:text-white border border-white/10 rounded-full hover:bg-white/5 transition-all"
                >
                    Logout
                </button>
            )}

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl text-center max-w-md w-full relative overflow-hidden"
            >
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4 animate-pulse">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold tracking-widest text-white">CINEMATIC VOICE</h2>
                </div>

                {user ? (
                    <>
                        <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/50">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        
                        {/* Terminal-style success message */}
                        <div className="mt-6 mb-6 p-6 bg-black/50 rounded-lg text-left border border-green-500/20">
                            <div className="font-mono space-y-2">
                                <div className="text-green-400 text-sm">
                                    <span className="text-green-500">●</span> Login successful
                                </div>
                                <div className="text-green-400 text-sm">
                                    <span className="text-green-500">●</span> Session synced to extension
                                </div>
                                <div className="text-green-400 text-sm mt-4 border-t border-green-500/20 pt-3">
                                    <span className="text-green-300">→</span> Close this tab and your extension is ready to use
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
                        <p className="text-gray-400 mb-8 leading-relaxed">Login to use Cinematic Voice AI pro features.</p>

                        <div className="space-y-4 w-full">
                            <button
                                onClick={() => loginWithGoogle(`${window.location.origin}/extension-auth`)}
                                className="w-full py-4 px-6 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-3 group"
                            >
                                <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span>Sign in with Google</span>
                            </button>

                            <button
                                onClick={() => loginWithDiscord(`${window.location.origin}/extension-auth`)}
                                className="w-full py-4 px-6 rounded-xl bg-[#5865F2] text-white font-bold hover:bg-[#4752C4] transition-all flex items-center justify-center gap-3 group"
                            >
                                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 19.019 19.019 0 0 0-3.361 5.922 18.068 18.068 0 0 0-8.257 0 19.016 19.016 0 0 0-3.361-5.922.077.077 0 0 0-.08-.037 19.736 19.736 0 0 0-4.885 1.515.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.418 2.157-2.418 1.21 0 2.176 1.096 2.157 2.418 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.096 2.157 2.418 0 1.334-.946 2.419-2.157 2.419z" /></svg>
                                <span>Sign in with Discord</span>
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default ExtensionAuth;
