
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);

    const fetchUserProfile = async (userId) => {
        try {
            // Check for daily reset
            await supabase.rpc('check_and_reset_usage');

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) {
                setUserProfile(data);
            } else if (error) {
                console.error('Error fetching profile:', error);
            }
        } catch (e) {
            console.error('Profile fetch error:', e);
        }
    };

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session) {
                syncSessionToExtension(session);
                fetchUserProfile(session.user.id);
            }
            setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session) {
                syncSessionToExtension(session);
                fetchUserProfile(session.user.id);
            } else {
                setUserProfile(null);
                // Handle logout cleanup if needed
                localStorage.removeItem('sb-session'); // Cleanup local if desired
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const syncSessionToExtension = async (session) => {
        // 1. Store in localStorage (for website use)
        localStorage.setItem('cinematic_session', JSON.stringify(session));

        // 2. Send to extension via postMessage (content script will listen and forward to chrome.storage.local)
        window.postMessage({ 
            type: 'CINEMATIC_VOICE_SESSION', 
            session: {
                access_token: session.access_token,
                refresh_token: session.refresh_token,
                expires_at: session.expires_at,
                user: session.user
            }
        }, '*');
        
        console.log('[Cinematic Voice] Session synced - access_token:', session.access_token?.substring(0, 20) + '...');
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
        userProfile,
        refreshProfile: () => user && fetchUserProfile(user.id),
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
