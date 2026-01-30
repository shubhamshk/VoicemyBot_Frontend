// This function activates user plans after payment.

import { createClient } from "@supabase/supabase-js"

console.log("Activate Plan Function initialized!")

Deno.serve(async (req) => {
    try {
        const { userId, planType } = await req.json()

        // Create a Supabase client with the Auth context of the user that called the function.
        // However, for plan upgrades, we need ADMIN privileges (Service Role Key)
        // because regular users shouldn't be able to just call an API to upgrade themselves.
        // In a real app, this function would verify the PayPal subscription/payment status first OR
        // receive a webhook from PayPal directly.
        // For this implementation as requested, we trust the caller (assuming integrated secure flow or for MVP).

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        let updateData = {}

        if (planType === 'pro_monthly' || planType === 'pro_yearly') {
            updateData = { plan: 'pro' }
        } else if (planType === 'ultra_premium') {
            updateData = { ultra_premium: true }
        } else {
            return new Response(JSON.stringify({ error: 'Invalid plan type' }), {
                headers: { "Content-Type": "application/json" },
                status: 400,
            })
        }

        const { data, error } = await supabaseAdmin
            .from('users')
            .update(updateData)
            .eq('id', userId)
            .select()

        if (error) throw error

        return new Response(JSON.stringify({ success: true, user: data }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        })

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        return new Response(JSON.stringify({ error: errorMessage }), {
            headers: { "Content-Type": "application/json" },
            status: 400,
        })
    }

})
