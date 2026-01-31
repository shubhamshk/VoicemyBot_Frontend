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

    // Create a 
    //  admin client with Service Role Key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('PRIVATE_SERVICE_ROLE_KEY') ?? '',
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
    } else if (planType === 'ultra_yearly' || planType === 'ultra_premium') {
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
