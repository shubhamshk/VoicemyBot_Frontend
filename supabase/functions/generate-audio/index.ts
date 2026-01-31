import { createClient } from "@supabase/supabase-js"

console.log("🎙️ Generate Audio Function initialized!")

// Helper to create response with CORS headers and optional extra headers
function jsonResponse(data: any, status = 200, extraHeaders = {}) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Content-Type': 'application/json',
            ...extraHeaders
        },
    })
}

// Helper to create binary audio response
function audioResponse(audioData: ArrayBuffer, status = 200) {
    return new Response(audioData, {
        status,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'audio/mpeg',
        },
    })
}

Deno.serve(async (req) => {
    // ================================================
    // STEP 0: CORS PREFLIGHT
    // ================================================
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
                'Access-Control-Max-Age': '86400',
            }
        })
    }

    try {
        // ================================================
        // STEP 1: AUTH - Verify JWT and Extract userId
        // ================================================
        const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.error('[EDGE] Missing or invalid authorization header');
            return jsonResponse({ error: 'No authorization header' }, 401);
        }

        const jwt = authHeader.replace('Bearer ', '');

        // Create Supabase client using PRIVATE_SERVICE_ROLE_KEY
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseServiceKey = Deno.env.get('PRIVATE_SERVICE_ROLE_KEY') ?? '';

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('[EDGE] Missing environment variables');
            return jsonResponse({ error: 'Server configuration error' }, 500);
        }

        const supabaseAdmin = createClient(
            supabaseUrl,
            supabaseServiceKey,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Validate JWT explicitly
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt);

        if (userError || !user) {
            console.error('[AUTH FAILED]', userError?.message);
            return jsonResponse({ error: 'Unauthorized', details: userError?.message }, 401);
        }

        console.log(`[AUTH SUCCESS] User: ${user.id}`)

        // ================================================
        // STEP 2: PARSE INPUT
        // ================================================
        let body
        try {
            body = await req.json()
        } catch {
            return jsonResponse({ error: 'Invalid JSON body' }, 400)
        }

        const { text, mode, provider, voice } = body

        // Validate inputs
        if (!text || typeof text !== 'string') {
            return jsonResponse({ error: 'Missing or invalid "text"' }, 400)
        }

        if (!['normal', 'cinematic'].includes(mode)) {
            return jsonResponse({ error: `Invalid mode: ${mode}. Must be "normal" or "cinematic"` }, 400)
        }

        if (!['webspeech', 'elevenlabs', 'unrealspeech'].includes(provider)) {
            return jsonResponse({ error: `Invalid provider: ${provider}` }, 400)
        }

        console.log(`[REQUEST] mode=${mode}, provider=${provider}, text_length=${text.length}`)

        // ================================================
        // STEP 3: PLAN CHECK - Get User Plan
        // ================================================
        // (Using supabaseAdmin already created in Step 1)

        const { data: userData, error: planError } = await supabaseAdmin
            .from('users')
            .select('plan, ultra_premium')
            .eq('id', user.id)
            .single()

        if (planError || !userData) {
            console.error('[PLAN CHECK FAILED]', planError)
            return jsonResponse({ error: 'User profile not found' }, 404)
        }

        // Determine plan
        let userPlan: 'free' | 'pro' | 'ultra' = 'free'
        if (userData.ultra_premium) {
            userPlan = 'ultra'
        } else if (userData.plan === 'pro') {
            userPlan = 'pro'
        }

        console.log(`[PLAN] ${userPlan}`)

        // ================================================
        // STEP 4: USAGE COUNT - Read from usage_daily table
        // ================================================
        const today = new Date().toISOString().split('T')[0];

        const { data: usageData, error: usageError } = await supabaseAdmin
            .from('usage_daily')
            .select('normal_used, cinematic_used')
            .eq('user_id', user.id)
            .eq('date', today)
            .single();

        if (usageError && usageError.code !== 'PGRST116') { // PGRST116 means "no rows found" which is expected for new days
            console.error('[USAGE COUNT ERROR]', usageError);
            return jsonResponse({ error: 'Failed to count usage' }, 500);
        }

        const normalUsedToday = usageData?.normal_used ?? 0;
        const cinematicUsedToday = usageData?.cinematic_used ?? 0;

        console.log(`[USAGE] normal=${normalUsedToday}, cinematic=${cinematicUsedToday}`)

        // ================================================
        // STEP 5: LIMIT ENFORCEMENT
        // ================================================
        const LIMITS = {
            free: { normal: 50, cinematic: 10 },
            pro: { normal: Infinity, cinematic: Infinity },
            ultra: { normal: Infinity, cinematic: Infinity }
        }

        const planLimits = LIMITS[userPlan]

        if (mode === 'normal' && normalUsedToday >= planLimits.normal) {
            console.log(`[LIMIT REACHED] User ${user.id}: normal ${normalUsedToday}/${planLimits.normal}`)
            return jsonResponse({
                error: 'Daily limit reached for normal voices',
                limit: planLimits.normal,
                used: normalUsedToday
            }, 403)
        }

        if (mode === 'cinematic' && cinematicUsedToday >= planLimits.cinematic) {
            console.log(`[LIMIT REACHED] User ${user.id}: cinematic ${cinematicUsedToday}/${planLimits.cinematic}`)
            return jsonResponse({
                error: 'Daily limit reached for cinematic voices',
                limit: planLimits.cinematic,
                used: cinematicUsedToday
            }, 403)
        }

        // ================================================
        // STEP 6: CALL PROVIDER - Generate Audio
        // ================================================
        let audioData: ArrayBuffer | null = null
        let audioURL: string | null = null

        if (provider === 'webspeech') {
            // Web Speech API is client-side only, return metadata for client
            console.log('[PROVIDER] WebSpeech - Client-side generation')

            // We can't generate Web Speech API audio server-side
            // Instead, return success and let client handle it
            // BUT we still log the usage
            audioURL = 'client_side_webspeech'

        } else if (provider === 'elevenlabs') {
            // ================================================
            // ElevenLabs API
            // ================================================
            const elevenLabsKey = Deno.env.get('ELEVENLABS_API_KEY')
            if (!elevenLabsKey) {
                return jsonResponse({ error: 'ElevenLabs API key not configured' }, 500)
            }

            const voiceId = voice || '21m00Tcm4TlvDq8ikWAM' // Rachel (default)
            const modelId = 'eleven_turbo_v2_5'

            console.log(`[ELEVENLABS] Generating with voice: ${voiceId}`)

            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': elevenLabsKey
                },
                body: JSON.stringify({
                    text: text,
                    model_id: modelId,
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75
                    }
                })
            })

            if (!response.ok) {
                const errorText = await response.text()
                console.error('[ELEVENLABS ERROR]', response.status, errorText)
                return jsonResponse({ error: `ElevenLabs API error: ${errorText}` }, 500)
            }

            audioData = await response.arrayBuffer()
            console.log(`[ELEVENLABS] Generated ${audioData.byteLength} bytes`)

        } else if (provider === 'unrealspeech') {
            // ================================================
            // UnrealSpeech API
            // ================================================
            const unrealKey = Deno.env.get('UNREALSPEECH_API_KEY')
            if (!unrealKey) {
                return jsonResponse({ error: 'UnrealSpeech API key not configured' }, 500)
            }

            const voiceId = voice || 'Scarlett'

            console.log(`[UNREALSPEECH] Generating with voice: ${voiceId}`)

            const response = await fetch('https://api.v6.unrealspeech.com/stream', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${unrealKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    Text: text,
                    VoiceId: voiceId,
                    Bitrate: '192k',
                    Speed: '0',
                    Pitch: '1.0',
                    Codec: 'libmp3lame'
                })
            })

            if (!response.ok) {
                const errorText = await response.text()
                console.error('[UNREALSPEECH ERROR]', response.status, errorText)
                return jsonResponse({ error: `UnrealSpeech API error: ${errorText}` }, 500)
            }

            audioData = await response.arrayBuffer()
            console.log(`[UNREALSPEECH] Generated ${audioData.byteLength} bytes`)
        }

        // ================================================
        // STEP 7: LOG USAGE - REMOVED (Handled by increment-usage endpoint)
        // ================================================

        // ================================================
        // STEP 8: RETURN AUDIO & HEADERS
        // ================================================

        // Use database values directly (they were already incremented by increment-usage endpoint)
        const finalNormal = normalUsedToday;
        const finalCinematic = cinematicUsedToday;

        const usageHeaders = {
            'X-Usage-Normal': String(finalNormal),
            'X-Usage-Cinematic': String(finalCinematic),
            'Access-Control-Expose-Headers': 'X-Usage-Normal, X-Usage-Cinematic'
        }

        if (provider === 'webspeech') {
            return jsonResponse({
                success: true,
                provider: 'webspeech',
                message: 'Use client-side Web Speech API',
                usage: {
                    normal: finalNormal,
                    cinematic: finalCinematic
                }
            }, 200, usageHeaders)
        } else if (audioData) {
            // For premium providers, return audio binary with headers
            return new Response(audioData, {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'audio/mpeg',
                    ...usageHeaders
                },
            })
        } else {
            return jsonResponse({ error: 'Failed to generate audio' }, 500)
        }

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        console.error('[INTERNAL ERROR]', errorMessage)
        return jsonResponse({ error: errorMessage }, 500)
    }
})

