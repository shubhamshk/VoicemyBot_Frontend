// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("Increment Usage Function initialized!");

// Helper function to create response with CORS headers
function jsonResponse(data: any, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
                'Access-Control-Max-Age': '86400',
            },
        });
    }

    try {
        // 1. Check for Authorization header
        const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.error('[EDGE] Missing or invalid authorization header');
            return jsonResponse({
                error: 'Missing or invalid authorization header'
            }, 401);
        }

        // 2. Extract JWT and validate
        const jwt = authHeader.replace('Bearer ', '');

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('PRIVATE_SERVICE_ROLE_KEY');

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

        // Validate JWT
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt);

        if (userError || !user) {
            console.error('[EDGE] Invalid JWT:', userError?.message);
            return jsonResponse({ error: 'Invalid or expired token' }, 401);
        }

        // 3. Parse request body
        const { type } = await req.json();

        if (!type || (type !== 'normal' && type !== 'cinematic')) {
            return jsonResponse({ error: 'Invalid type. Must be "normal" or "cinematic"' }, 400);
        }

        // 4. Get user plan
        const { data: userData } = await supabaseAdmin
            .from('users')
            .select('plan, ultra_premium')
            .eq('id', user.id)
            .single();

        const isPro = userData?.plan === 'pro' || userData?.ultra_premium;
        const isUltra = !!userData?.ultra_premium;

        // 5. Get today's usage
        const today = new Date().toISOString().split('T')[0];

        const { data: usageData } = await supabaseAdmin
            .from('usage_daily')
            .select('normal_used, cinematic_used')
            .eq('user_id', user.id)
            .eq('date', today)
            .single();

        const currentNormal = usageData?.normal_used ?? 0;
        const currentCinematic = usageData?.cinematic_used ?? 0;

        // 6. Check limits
        // Ultra = unlimited (null limit). Pro = per-user stored limit. Free = 50/10.
        if (!isUltra) {
            // Read stored limits; fall back to free defaults if not set
            const normalLimit: number = userData?.normal_voice_limit ?? 50;
            const cinematicLimit: number = userData?.cinematic_voice_limit ?? 10;

            if (type === 'normal' && currentNormal >= normalLimit) {
                console.log(`[EDGE] LIMIT REACHED: ${user.id} (normal: ${currentNormal}/${normalLimit})`);
                return jsonResponse({
                    error: `Daily limit reached for normal voices (${normalLimit}/day)`,
                    limit_reached: true,
                    type: 'normal'
                }, 403);
            }

            if (type === 'cinematic' && currentCinematic >= cinematicLimit) {
                console.log(`[EDGE] LIMIT REACHED: ${user.id} (cinematic: ${currentCinematic}/${cinematicLimit})`);
                return jsonResponse({
                    error: `Daily limit reached for cinematic voices (${cinematicLimit}/day)`,
                    limit_reached: true,
                    type: 'cinematic'
                }, 403);
            }
        }

        // 7. Increment usage (UPSERT)
        const newNormal = type === 'normal' ? currentNormal + 1 : currentNormal;
        const newCinematic = type === 'cinematic' ? currentCinematic + 1 : currentCinematic;

        const { data: updatedUsage, error: updateError } = await supabaseAdmin
            .from('usage_daily')
            .upsert({
                user_id: user.id,
                date: today,
                normal_used: newNormal,
                cinematic_used: newCinematic
            }, {
                onConflict: 'user_id,date'
            })
            .select()
            .single();

        if (updateError) {
            console.error('[EDGE] Failed to update usage:', updateError);
            return jsonResponse({ error: 'Failed to update usage' }, 500);
        }

        console.log(`[EDGE] incrementUsage: ${user.id}, ${type}, normal=${newNormal}, cinematic=${newCinematic}`);

        // 8. Return updated usage
        return jsonResponse({
            user_id: user.id,
            date: today,
            normal_used: newNormal,
            cinematic_used: newCinematic,
            type_incremented: type
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('[EDGE] Error:', errorMessage);
        return jsonResponse({ error: errorMessage }, 400);
    }
});
