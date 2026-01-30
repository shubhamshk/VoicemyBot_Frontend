import { createClient } from "@supabase/supabase-js"

console.log("Increment Usage Function initialized!")

Deno.serve(async (req) => {
    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'No authorization header' }), {
                headers: { "Content-Type": "application/json" },
                status: 401,
            })
        }

        // 1. Validate Session & User
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                headers: { "Content-Type": "application/json" },
                status: 401,
            })
        }

        // 2. Parse Body
        // Handle potentially empty body or invalid json
        let body
        try {
            body = await req.json()
        } catch {
            return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 })
        }
        const { type } = body

        if (!['normal', 'cinematic'].includes(type)) {
            return new Response(JSON.stringify({ error: `Invalid usage type: ${type}` }), {
                headers: { "Content-Type": "application/json" },
                status: 400,
            })
        }

        // 3. Admin Client (Service Role) - The Final Authority
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 4. Get User Plan
        const { data: userData, error: planError } = await supabaseAdmin
            .from('users')
            .select('plan, ultra_premium')
            .eq('id', user.id)
            .single()

        if (planError || !userData) {
            // If user row missing, maybe create it? Or just error?
            // For security, error out.
            return new Response(JSON.stringify({ error: 'User profile not found' }), { status: 404 })
        }

        let userPlan: 'free' | 'pro' | 'ultra' = 'free'
        if (userData.ultra_premium) userPlan = 'ultra'
        else if (userData.plan === 'pro') userPlan = 'pro'

        // 5. Get Today's Usage
        const today = new Date().toISOString().split('T')[0]

        // We use maybeSingle to gracefully handle "no row for today yet"
        const { data: currentUsage, error: usageError } = await supabaseAdmin
            .from('usage_daily')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', today)
            .maybeSingle()

        if (usageError) {
            console.error('Usage fetch error:', usageError)
            throw new Error('Database error')
        }

        // Default to 0 if no row
        const normalUsed = currentUsage?.normal_used ?? 0
        const cinematicUsed = currentUsage?.cinematic_used ?? 0

        // 6. Enforce Limits
        const LIMITS = {
            free: { normal: 50, cinematic: 10 },
            pro: { normal: Infinity, cinematic: Infinity },
            ultra: { normal: Infinity, cinematic: Infinity }
        }

        const planLimits = LIMITS[userPlan] // 'free' | 'pro' | 'ultra' -> access object

        if (type === 'normal' && normalUsed >= planLimits.normal) {
            console.log(`[EDGE] LIMIT REACHED: ${user.id} (normal: ${normalUsed}/${planLimits.normal})`)
            return new Response(JSON.stringify({ error: 'Daily limit reached for normal voices' }), {
                headers: { "Content-Type": "application/json" },
                status: 403,
            })
        }

        if (type === 'cinematic' && cinematicUsed >= planLimits.cinematic) {
            console.log(`[EDGE] LIMIT REACHED: ${user.id} (cinematic: ${cinematicUsed}/${planLimits.cinematic})`)
            return new Response(JSON.stringify({ error: 'Daily limit reached for cinematic voices' }), {
                headers: { "Content-Type": "application/json" },
                status: 403,
            })
        }

        // 7. Increment & Persist
        const newNormal = type === 'normal' ? normalUsed + 1 : normalUsed
        const newCinematic = type === 'cinematic' ? cinematicUsed + 1 : cinematicUsed

        // upsert: update if exists, insert if not. Match on (user_id, date)
        const { data: updatedData, error: updateError } = await supabaseAdmin
            .from('usage_daily')
            .upsert({
                user_id: user.id,
                date: today,
                normal_used: newNormal,
                cinematic_used: newCinematic
                // id will be generated if new, or preserved if updating? 
                // Actually for upsert on conflict, we don't need to specify id if we match the unique key. Use the existing one or make new.
            }, { onConflict: 'user_id, date' })
            .select()
            .single()

        if (updateError) {
            console.error('Update usage error:', updateError)
            throw new Error('Failed to update usage count')
        }

        // 8. Log & Return
        console.log(`[EDGE] incrementUsage: ${user.id}, ${type}, ${type === 'normal' ? newNormal : newCinematic}`)

        return new Response(JSON.stringify(updatedData), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        })

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        console.error('Internal Error:', errorMessage)
        return new Response(JSON.stringify({ error: errorMessage }), {
            headers: { "Content-Type": "application/json" },
            status: 400,
        })
    }
})
