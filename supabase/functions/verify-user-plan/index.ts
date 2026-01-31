// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("Verify User Plan Function initialized!");

// Helper function to create response with CORS headers
function jsonResponse(data: any, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Content-Type': 'application/json',
        },
    });
}

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
                'Access-Control-Max-Age': '86400',
            },
        });
    }

    try {
        // 1. Check for Authorization header (case-insensitive)
        const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');

        // Debug: Log all headers
        console.log('[DEBUG] All request headers:');
        for (const [key, value] of req.headers.entries()) {
            console.log(`  ${key}: ${value.substring(0, 50)}...`);
        }
        console.log('[DEBUG] Authorization Header:', authHeader ? 'Present' : 'Missing');

        if (!authHeader) {
            console.error('[EDGE] No authorization header found');
            return jsonResponse({
                code: 401,
                message: 'Missing authorization header',
                error: 'Missing authorization header'
            }, 401);
        }

        if (!authHeader.startsWith('Bearer ')) {
            console.error('[EDGE] Invalid authorization header format');
            return jsonResponse({
                code: 401,
                message: 'Invalid authorization header format',
                error: 'Invalid authorization header format'
            }, 401);
        }

        // 2. Create Supabase client - MUST pass Authorization header from request
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('PRIVATE_SERVICE_ROLE_KEY'); // ✅ FIXED: Changed name to avoid reserved prefix

        console.log('[EDGE] SUPABASE_URL present:', !!supabaseUrl);
        console.log('[EDGE] PRIVATE_SERVICE_ROLE_KEY present:', !!supabaseServiceKey);

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('[EDGE] Missing required environment variables');
            return jsonResponse({ error: 'Server configuration error: Missing PRIVATE_SERVICE_ROLE_KEY' }, 500);
        }

        const supabaseClient = createClient(
            supabaseUrl,
            supabaseServiceKey,
            {
                global: {
                    headers: {
                        Authorization: authHeader
                    }
                }
            }
        );

        // 3. Get User - this validates the token
        console.log('[DEBUG] Validating user token...');
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

        if (userError) {
            console.error('[DEBUG] Token validation error:', userError.message);

            // Provide more specific error messages
            let errorMessage = 'Invalid token';
            if (userError.message.includes('expired')) {
                errorMessage = 'Token expired';
            } else if (userError.message.includes('JWT')) {
                errorMessage = 'Invalid JWT';
            }

            return jsonResponse({
                code: 401,
                message: errorMessage,
                error: errorMessage,
                details: userError.message,
                hint: 'Please refresh your session or log in again'
            }, 401);
        }

        if (!user) {
            console.error('[EDGE] No user found after validation');
            return jsonResponse({ error: 'No user found' }, 401);
        }

        console.log('[DEBUG] User validation successful:', user?.id);

        // 4. Query Plan from DB using Admin Client (Service Role)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('PRIVATE_SERVICE_ROLE_KEY') ?? ''
        );

        const { data: userData, error: planError } = await supabaseAdmin
            .from('users')
            .select('plan, ultra_premium')
            .eq('id', user.id)
            .single();

        if (planError || !userData) {
            console.error(`[EDGE] User ${user.id} not found in users table`);
            return jsonResponse({ error: 'User profile not found' }, 404);
        }

        // Determine plan type
        let userPlan = 'free';
        if (userData.ultra_premium) {
            userPlan = 'ultra';
        } else if (userData.plan === 'pro') {
            userPlan = 'pro';
        }

        // 5. Get Today's Usage from usage_daily table
        const today = new Date().toISOString().split('T')[0];

        const { data: usageData } = await supabaseAdmin
            .from('usage_daily')
            .select('normal_used, cinematic_used')
            .eq('user_id', user.id)
            .eq('date', today)
            .single();

        const normalUsedToday = usageData?.normal_used ?? 0;
        const cinematicUsedToday = usageData?.cinematic_used ?? 0;

        // Log per requirements
        console.log(`[EDGE] verifyUserPlan: ${user.id}, ${userPlan}, normal: ${normalUsedToday}, cinematic: ${cinematicUsedToday}`);

        // 6. Return result
        return jsonResponse({
            userId: user.id,
            plan: userPlan,
            normal_used_today: normalUsedToday,
            cinematic_used_today: cinematicUsedToday,
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('[EDGE] Error:', errorMessage);
        return jsonResponse({ error: errorMessage }, 400);
    }
});
