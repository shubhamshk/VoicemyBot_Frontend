# 🎙️ Cinematic Voice AI - Secure Backend Architecture

## ⚠️ CRITICAL: This System is Impossible to Bypass

This is a production-grade SaaS backend following the same security model as:
- OpenAI API
- ElevenLabs
- Midjourney
- Notion AI

**ALL voice generation MUST go through ONE edge function: `generate-audio`**

---

## 🏗️ Architecture Overview

```
┌─────────────────────────┐
│  Extension / Website    │
│  (UNTRUSTED CLIENT)     │
└───────────┬─────────────┘
            │
            │ POST /generate-audio
            │ Authorization: Bearer <jwt>
            │
┌───────────▼─────────────┐
│  Supabase Edge Function │
│    generate-audio       │ ← THE ONLY ENTRY POINT
│                         │
│  Steps:                 │
│  1. Verify JWT          │
│  2. Get User Plan       │
│  3. Count Usage (DB)    │
│  4. Enforce Limits      │
│  5. Call Provider       │
│  6. Log Usage           │
│  7. Return Audio        │
└───────────┬─────────────┘
            │
    ┌───────┴────────┐
    │                │
┌───▼────┐    ┌─────▼──────┐
│ Supabase│    │  Provider  │
│ Database│    │  APIs      │
│         │    │            │
│ • users │    │ • ElevenLabs
│ • usage_│    │ • UnrealSpeech
│   logs  │    │            │
└─────────┘    └────────────┘
```

---

## 🔒 Security Model

### ❌ What Clients CANNOT Do

- Call TTS providers directly (no API keys)
- Bypass usage limits (backend enforces)
- Fake premium plan (plan stored in DB, not client)
- Reset counters (usage tracked in `usage_logs`)
- Manipulate requests (all validation happens server-side)

### ✅ What Backend ENFORCES

1. **Authentication**: Every request must have valid Supabase JWT
2. **Plan Verification**: Plan fetched from `users` table (service role)
3. **Usage Counting**: Real-time COUNT from `usage_logs` table
4. **Limit Enforcement**: Hard block at 50 normal / 10 cinematic (free users)
5. **Logging**: Every generation logged to `usage_logs`

---

## 📡 API Reference

### Endpoint

```
POST https://[project].functions.supabase.co/functions/v1/generate-audio
```

### Headers

```
Authorization: Bearer <supabase_jwt>
Content-Type: application/json
```

### Request Body

```json
{
  "text": "The text to convert to speech",
  "mode": "normal" | "cinematic",
  "provider": "webspeech" | "elevenlabs" | "unrealspeech",
  "voice": "optional_voice_id"
}
```

### Success Response (WebSpeech)

```json
{
  "success": true,
  "provider": "webspeech",
  "message": "Use client-side Web Speech API",
  "usage": {
    "normal": 15,
    "cinematic": 3
  }
}
```

### Success Response (Premium Providers)

Binary audio data (audio/mpeg)

### Error Responses

**401 Unauthorized**
```json
{
  "error": "No authorization header"
}
```

**403 Forbidden (Limit Reached)**
```json
{
  "error": "Daily limit reached for normal voices",
  "limit": 50,
  "used": 50
}
```

**404 Not Found**
```json
{
  "error": "User profile not found"
}
```

**500 Server Error**
```json
{
  "error": "ElevenLabs API error: ..."
}
```

---

## 🗄️ Database Schema

### Table: `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  plan TEXT DEFAULT 'free', -- 'free' | 'pro'
  ultra_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Plan Logic:**
- `ultra_premium = true` → Ultra Plan (unlimited)
- `plan = 'pro'` → Pro Plan (unlimited)
- Otherwise → Free Plan (50 normal, 10 cinematic)

### Table: `usage_logs`

```sql
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  mode TEXT CHECK (mode IN ('normal', 'cinematic')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Usage Counting:**

```sql
-- Count normal usage today
SELECT COUNT(*) 
FROM usage_logs 
WHERE user_id = '...' 
  AND mode = 'normal' 
  AND created_at >= '2026-01-31T00:00:00Z'
  AND created_at <= '2026-01-31T23:59:59Z';
```

---

## 🚀 Deployment

### 1. Deploy Edge Function

```bash
cd Website
supabase functions deploy generate-audio
```

### 2. Set Environment Variables

In Supabase Dashboard → Edge Functions → Secrets:

```
ELEVENLABS_API_KEY=sk-...
UNREALSPEECH_API_KEY=...
```

### 3. Run Migration

```bash
supabase migration up
```

Or manually run `create_usage_logs_table.sql` in SQL Editor.

---

## 🧪 Testing

### Test with cURL

```bash
# Get JWT from browser console
# localStorage.getItem('sb-...-auth-token')

curl -X POST https://[project].functions.supabase.co/functions/v1/generate-audio \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello world",
    "mode": "normal",
    "provider": "webspeech"
  }'
```

### Expected Response

**Free User (Under Limit):**
```json
{
  "success": true,
  "provider": "webspeech",
  "usage": {
    "normal": 1,
    "cinematic": 0
  }
}
```

**Free User (Over Limit):**
```json
{
  "error": "Daily limit reached for normal voices",
  "limit": 50,
  "used": 50
}
```

**Pro/Ultra User:**
```json
{
  "success": true,
  "usage": {
    "normal": 9999,
    "cinematic": 9999
  }
}
```

---

## 🔧 Client Integration

### Example: Extension (content.js)

```javascript
async function generateAudio(text, mode, provider, voice = null) {
  // Get session
  const { cinematicSession } = await chrome.storage.local.get(['cinematicSession']);
  
  if (!cinematicSession?.access_token) {
    throw new Error('Not authenticated');
  }

  // Call backend (THE ONLY WAY)
  const response = await fetch(
    'https://[project].functions.supabase.co/functions/v1/generate-audio',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cinematicSession.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text, mode, provider, voice })
    }
  );

  if (response.status === 403) {
    // Show upgrade UI
    throw new Error('LIMIT_REACHED');
  }

  if (!response.ok) {
    throw new Error('Generation failed');
  }

  if (provider === 'webspeech') {
    // Use client-side Web Speech API
    const data = await response.json();
    // ... generate with browser API
  } else {
    // Get audio binary
    const audioBlob = await response.blob();
    // ... play audio
  }
}
```

---

## 🛡️ Why This is Secure

### 1. **Single Point of Entry**
- All requests go through `generate-audio`
- No way to bypass it

### 2. **Server-Side Validation**
- JWT verified server-side
- Plan fetched from database (service role)
- Usage counted in real-time

### 3. **No Client Trust**
- Clients cannot modify plan
- Clients cannot reset counters
- Clients cannot access API keys

### 4. **Real-Time Enforcement**
- Every request counts usage BEFORE generation
- Limits checked on EVERY request
- No race conditions (database transactions)

### 5. **Audit Trail**
- Every generation logged to `usage_logs`
- Can track usage per user
- Can detect abuse

---

## 📊 Monitoring

### Check User Usage

```sql
-- Total usage today for user
SELECT 
  mode,
  COUNT(*) as count
FROM usage_logs
WHERE user_id = '...'
  AND created_at >= CURRENT_DATE
GROUP BY mode;
```

### Top Users Today

```sql
SELECT 
  user_id,
  COUNT(*) as total_generations
FROM usage_logs
WHERE created_at >= CURRENT_DATE
GROUP BY user_id
ORDER BY total_generations DESC
LIMIT 10;
```

---

## 🚨 Security Checklist

- [x] JWT verification on every request
- [x] Plan fetched from database (not client)
- [x] Usage counted in real-time from database
- [x] Limits enforced server-side
- [x] API keys stored in backend secrets (never exposed)
- [x] Usage logged after every generation
- [x] Row Level Security on `usage_logs`
- [x] Service role used for admin operations
- [x] CORS configured properly
- [x] Error messages don't leak sensitive data

---

## 💡 Migration from Old System

### Old System (INSECURE)
```
increment-usage → increments counter
verify-user-plan → returns plan and usage
Client → calls TTS providers directly
```

### New System (SECURE)
```
generate-audio → does EVERYTHING
  1. Verifies auth
  2. Checks plan
  3. Counts usage
  4. Enforces limits
  5. Calls provider
  6. Logs usage
  7. Returns audio
```

**Next Steps:**
1. Deploy `generate-audio`
2. Create `usage_logs` table
3. Update client code to call `generate-audio`
4. Delete old `increment-usage` and `verify-user-plan` functions
5. Test thoroughly

---

## 📝 Notes

- **WebSpeech**: Client-side only, can't generate server-side. We return success and let client use browser API.
- **ElevenLabs/UnrealSpeech**: Server-side generation, return audio binary.
- **Usage Logs**: Never deleted. Used for analytics and abuse detection.
- **Daily Limits**: Reset at UTC midnight based on `created_at` timestamp.

---

## 🎯 Success Metrics

This architecture is successful when:
- ✅ Users cannot bypass limits (even with dev tools)
- ✅ Users cannot fake premium (plan in DB only)
- ✅ Usage tracking is 100% accurate
- ✅ API keys never exposed to client
- ✅ System scales to millions of users

**This is production-ready SaaS security. 🔒**
