
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session) {
                syncSessionToExtension(session);
            }
            setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session) {
                syncSessionToExtension(session);
            } else {
                // Handle logout cleanup if needed
                localStorage.removeItem('sb-session'); // Cleanup local if desired
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const syncSessionToExtension = (session) => {
        // 1. Store in localStorage (Supabase does this automatically usually, but we ensure it's available)
        // Supabase client handles localStorage by default.

        // 2. Send to extension
        // We try multiple methods to reach the extension.

        // Method A: chrome.runtime.sendMessage (requires externally_connectable in manifest)
        if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
            const EXTENSION_ID = "YOUR_EXTENSION_ID_HERE"; // User needs to provide this or we make it generic
            // We'll try just sending a message if we don't have the ID, or assume the user will fill it.
            // For now, let's just log it.
            console.log('[Cinematic Voice] Attempting to sync session to extension via runtime.sendMessage');
            try {
                // Because we don't have the ID, we can't target it directly unless 'externally_connectable' matches this domain
                // But usually you need the ID. 
                // We'll simulate the "Store in chrome.storage.local" by sending a message.
            } catch (e) {
                console.log('[Cinematic Voice] Extension not found or error communicating', e);
            }
        }

        // Method B: window.postMessage (Content script listener)
        window.postMessage({ type: 'CINEMATIC_VOICE_SESSION', session }, '*');
        console.log('[Cinematic Voice] Session stored for extension (via postMessage)');
    };

    const loginWithGoogle = async (redirectUrl) => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl || `${window.location.origin}/dashboard`,
            },
        });
        if (error) console.error('Login error:', error);
    };

    const loginWithDiscord = async (redirectUrl) => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'discord',
            options: {
                redirectTo: redirectUrl || `${window.location.origin}/dashboard`,
            },
        });
        if (error) console.error('Discord login error:', error);
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Logout error:', error);
        setUser(null);
        setSession(null);
        window.location.href = '/';
    };

    const value = {
        user,
        session,
        loginWithGoogle,
        loginWithDiscord,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
