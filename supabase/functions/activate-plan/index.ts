// This function activates user plans after payment.

// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("Activate Plan Function initialized!")

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  // ✅ Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const { userId, planType, subscriptionId } = await req.json()

    console.log(`[EDGE] Activate Plan Request: userId=${userId}, planType=${planType}, subscriptionId=${subscriptionId}`);

    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('PRIVATE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

    console.log('[EDGE] Environment check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!serviceRoleKey,
      hasAnonKey: !!anonKey,
      urlValue: supabaseUrl?.substring(0, 20) + '...'
    });

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      console.error('[EDGE] Missing environment variables');
      return new Response(JSON.stringify({
        error: 'Server configuration error',
        details: 'Missing required environment variables'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Verify the user's JWT token
    const authHeader = req.headers.get('Authorization');
    console.log('[EDGE] Auth header present:', !!authHeader);

    if (!authHeader) {
      console.error('[EDGE] No authorization header');
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        details: 'No authorization token provided'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Create client with anon key to verify the user's token
    const supabaseClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    // Verify the user's session
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    console.log('[EDGE] User verification:', {
      authenticated: !!user,
      userId: user?.id,
      authError: authError?.message
    });

    if (authError || !user) {
      console.error('[EDGE] Authentication failed:', authError);
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        details: 'Invalid or expired token'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Verify the userId matches the authenticated user
    if (user.id !== userId) {
      console.error('[EDGE] User ID mismatch');
      return new Response(JSON.stringify({
        error: 'Forbidden',
        details: 'User ID does not match authenticated user'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Create admin client with Service Role Key for database updates
    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )


    // Determine what to update based on plan type
    let updateData: any = {}

    if (planType === 'pro_monthly' || planType === 'pro_yearly') {
      updateData = { plan: 'pro' }
      console.log('[EDGE] Setting plan to PRO');
    } else if (planType === 'ultra_yearly' || planType === 'ultra_monthly' || planType === 'ultra_premium') {
      updateData = { ultra_premium: true }
      console.log('[EDGE] Setting ultra_premium to true');
    } else {
      console.error('[EDGE] Invalid plan type:', planType);
      return new Response(JSON.stringify({ error: 'Invalid plan type' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      })
    }

    // Update user plan in database
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()

    if (error) {
      console.error('[EDGE] Database update error:', error);
      throw error;
    }

    console.log(`[EDGE] Plan activated successfully for user ${userId}:`, updateData);

    return new Response(JSON.stringify({
      success: true,
      user: data,
      message: 'Plan activated successfully'
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200,
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('[EDGE] Activate Plan Error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})
