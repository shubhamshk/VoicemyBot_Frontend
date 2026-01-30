

import { createClient } from "@supabase/supabase-js"

console.log("Verify User Plan Function initialized!")

Deno.serve(async (req) => {
    try {
        // 1. Check for Authorization header
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'No authorization header' }), {
                headers: { "Content-Type": "application/json" },
                status: 401,
            })
        }

        // 2. Create Supabase client with Auth context to validate user
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        // 3. Get User
        const {
            data: { user },
            error: userError,
        } = await supabaseClient.auth.getUser()

        if (userError || !user) {
            return new Response(JSON.stringify({ error: 'Invalid token' }), {
                headers: { "Content-Type": "application/json" },
                status: 401,
            })
        }

        // 4. Query Plan from DB using Admin Client (Service Role) for security
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { data: userData, error: planError } = await supabaseAdmin
            .from('users')
            .select('plan, ultra_premium')
            .eq('id', user.id)
            .single()

        if (planError || !userData) {
            console.error(`[EDGE] verifyUserPlan: User ${user.id} not found in users table`)
            return new Response(JSON.stringify({ error: 'User profile not found' }), {
                headers: { "Content-Type": "application/json" },
                status: 404, // Use 404 or 400? Prompt says generic error handling usually.
            })
        }

        // Determine plan type
        let userPlan = 'free'
        if (userData.ultra_premium) {
            userPlan = 'ultra'
        } else if (userData.plan === 'pro') {
            userPlan = 'pro'
        }

        // Log per requirements
        console.log(`[EDGE] verifyUserPlan: ${user.id}, ${userPlan}`)

        // 5. Return result
        return new Response(JSON.stringify({ userId: user.id, plan: userPlan }), {
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
