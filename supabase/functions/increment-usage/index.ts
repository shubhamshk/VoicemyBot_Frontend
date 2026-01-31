
console.log("DEPRECATED increment-usage called. Returning 410 Gone.")

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
            }
        })
    }

    return new Response(JSON.stringify({
        error: 'This endpoint is deprecated. Use generate-audio instead.',
        code: 'ENDPOINT_DEPRECATED'
    }), {
        status: 410, // Gone
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    })
})
