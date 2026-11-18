/**
 * Vercel Node function. Counts one visit per random tab-session ID in Redis.
 * No prompt data, IP addresses, or user identifiers are written to Redis.
 */
const script = `
  if redis.call('SET', KEYS[1], '1', 'EX', ARGV[1], 'NX') then
    return redis.call('INCR', KEYS[2])
  end
  return tonumber(redis.call('GET', KEYS[2]) or '0')
`;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Browsers cannot submit cross-origin JSON requests without preflight/CORS.
  const origin = req.headers?.origin;
  const host = req.headers?.host;
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) return res.status(403).json({ error: 'Origin not allowed' });
    } catch {
      return res.status(403).json({ error: 'Origin not allowed' });
    }
  }

  const body = typeof req.body === 'string' ? (() => {
    try { return JSON.parse(req.body); } catch { return null; }
  })() : req.body;
  const sessionId = body?.sessionId;
  if (typeof sessionId !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(sessionId)) {
    return res.status(400).json({ error: 'Invalid session' });
  }

  // Support both Vercel Upstash Integration (KV_*) and standard Upstash SDK (UPSTASH_*) env vars.
  // Priority: KV_REST_API_* (Vercel Integration) > UPSTASH_REDIS_REST_* (standard SDK).
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || !/^https:\/\//i.test(url)) {
    return res.status(503).json({ error: 'Visit counter unavailable' });
  }

  try {
    const reply = await fetch(url.replace(/\/$/, ''), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['EVAL', script, 2, `cutprompts:visit:${sessionId}`, 'cutprompts:visits:total', 1800]),
      signal: AbortSignal.timeout(6000),
    });
    if (!reply.ok) throw new Error('Counter storage request failed');
    const payload = await reply.json();
    const count = Number(payload.result);
    if (payload.error || !Number.isSafeInteger(count) || count < 0) throw new Error('Invalid counter response');
    return res.status(200).json({ count });
  } catch {
    return res.status(503).json({ error: 'Visit counter unavailable' });
  }
}
