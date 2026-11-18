import { afterEach, describe, expect, it, vi } from 'vitest';
import handler from '../api/visits.js';

const sessionId = 'a1b2c3d4-1234-4567-8abc-0123456789ab';
const nextId = 'b1b2c3d4-1234-4567-8abc-0123456789ab';

function response() {
  const res = {
    setHeader: vi.fn(),
    status: vi.fn(),
    json: vi.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
}

async function invoke(method = 'POST', body: unknown = { sessionId }, origin = 'https://cutprompts.test') {
  const res = response();
  await handler({ method, body, headers: { origin, host: 'cutprompts.test' } } as never, res as never);
  return res;
}

function setupEnv(vars: Record<string, string>) {
  for (const [key, value] of Object.entries(vars)) {
    vi.stubEnv(key, value);
  }
}

function cleanupEnv() {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
}

describe('Vercel visit counter', () => {
  afterEach(() => {
    cleanupEnv();
  });

  it('rejects other methods and malformed visit IDs', async () => {
    setupEnv({
      KV_REST_API_URL: 'https://redis.example.test',
      KV_REST_API_TOKEN: 'fake-test-token',
    });
    const method = await invoke('GET');
    expect(method.status).toHaveBeenCalledWith(405);
    expect(method.setHeader).toHaveBeenCalledWith('Allow', 'POST');

    const invalid = await invoke('POST', { sessionId: 'bad' });
    expect(invalid.status).toHaveBeenCalledWith(400);

    const foreign = await invoke('POST', { sessionId }, 'https://untrusted.example');
    expect(foreign.status).toHaveBeenCalledWith(403);
  });

  it('does not invent a count when Redis is not configured', async () => {
    setupEnv({
      KV_REST_API_URL: 'https://redis.example.test',
      KV_REST_API_TOKEN: '',
    });
    const res = await invoke();
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({ error: 'Visit counter unavailable' });
  });

  it('uses KV_REST_API_* environment variables (Vercel Upstash Integration)', async () => {
    setupEnv({
      KV_REST_API_URL: 'https://redis.example.test',
      KV_REST_API_TOKEN: 'kv-test-token',
    });
    const seen = new Set<string>();
    let total = 21;
    const redis = vi.fn(async (url: string, options: { headers: Record<string, string>; body: string }) => {
      expect(url).toBe('https://redis.example.test');
      const command = JSON.parse(options.body) as [string, string, number, string, string, number];
      expect(command[0]).toBe('EVAL');
      expect(command[2]).toBe(2);
      expect(command[4]).toBe('cutprompts:visits:total');
      expect(command[5]).toBe(1800);
      expect(command[1]).toContain("redis.call('SET'");
      expect(options.headers.Authorization).toBe('Bearer kv-test-token');
      if (!seen.has(command[3])) {
        seen.add(command[3]);
        total += 1;
      }
      return { ok: true, json: async () => ({ result: total }) };
    });
    vi.stubGlobal('fetch', redis);

    const first = await invoke();
    const repeat = await invoke();
    const next = await invoke('POST', { sessionId: nextId });

    expect(first.json).toHaveBeenCalledWith({ count: 22 });
    expect(repeat.json).toHaveBeenCalledWith({ count: 22 });
    expect(next.json).toHaveBeenCalledWith({ count: 23 });
    expect(redis).toHaveBeenCalledTimes(3);
  });

  it('falls back to UPSTASH_REDIS_REST_* environment variables (standard Upstash SDK)', async () => {
    setupEnv({
      UPSTASH_REDIS_REST_URL: 'https://redis-legacy.example.test',
      UPSTASH_REDIS_REST_TOKEN: 'upstash-test-token',
    });
    const seen = new Set<string>();
    let total = 21;
    const redis = vi.fn(async (url: string, options: { headers: Record<string, string>; body: string }) => {
      expect(url).toBe('https://redis-legacy.example.test');
      const command = JSON.parse(options.body) as [string, string, number, string, string, number];
      expect(command[0]).toBe('EVAL');
      expect(command[2]).toBe(2);
      expect(command[4]).toBe('cutprompts:visits:total');
      expect(command[5]).toBe(1800);
      expect(command[1]).toContain("redis.call('SET'");
      expect(options.headers.Authorization).toBe('Bearer upstash-test-token');
      if (!seen.has(command[3])) {
        seen.add(command[3]);
        total += 1;
      }
      return { ok: true, json: async () => ({ result: total }) };
    });
    vi.stubGlobal('fetch', redis);

    const first = await invoke();
    const repeat = await invoke();
    const next = await invoke('POST', { sessionId: nextId });

    expect(first.json).toHaveBeenCalledWith({ count: 22 });
    expect(repeat.json).toHaveBeenCalledWith({ count: 22 });
    expect(next.json).toHaveBeenCalledWith({ count: 23 });
    expect(redis).toHaveBeenCalledTimes(3);
  });

  it('prioritizes KV_REST_API_* over UPSTASH_REDIS_REST_* when both are set', async () => {
    setupEnv({
      KV_REST_API_URL: 'https://kv-priority.example.test',
      KV_REST_API_TOKEN: 'kv-priority-token',
      UPSTASH_REDIS_REST_URL: 'https://upstash-fallback.example.test',
      UPSTASH_REDIS_REST_TOKEN: 'upstash-fallback-token',
    });
    const redis = vi.fn(async (url: string, options: { headers: Record<string, string>; body: string }) => {
      expect(url).toBe('https://kv-priority.example.test');
      expect(options.headers.Authorization).toBe('Bearer kv-priority-token');
      return { ok: true, json: async () => ({ result: 42 }) };
    });
    vi.stubGlobal('fetch', redis);

    const res = await invoke();
    expect(res.json).toHaveBeenCalledWith({ count: 42 });
    expect(redis).toHaveBeenCalledTimes(1);
  });

  it('does not use READ_ONLY token or non-REST URLs', async () => {
    setupEnv({
      KV_REST_API_READ_ONLY_TOKEN: 'readonly-token',
      KV_URL: 'redis://localhost:6379',
      REDIS_URL: 'redis://localhost:6379',
      KV_REST_API_URL: 'https://redis.example.test',
      KV_REST_API_TOKEN: 'writable-token',
    });
    const redis = vi.fn(async (url: string, options: { headers: Record<string, string>; body: string }) => {
      expect(url).toBe('https://redis.example.test');
      expect(options.headers.Authorization).toBe('Bearer writable-token');
      return { ok: true, json: async () => ({ result: 1 }) };
    });
    vi.stubGlobal('fetch', redis);

    const res = await invoke();
    expect(res.json).toHaveBeenCalledWith({ count: 1 });
    expect(redis).toHaveBeenCalledTimes(1);
  });

  it('uses one atomic Redis command to deduplicate a session', async () => {
    setupEnv({
      KV_REST_API_URL: 'https://redis.example.test',
      KV_REST_API_TOKEN: 'fake-test-token',
    });
    const seen = new Set<string>();
    let total = 21;
    const redis = vi.fn(async (_url: string, options: { headers: Record<string, string>; body: string }) => {
      const command = JSON.parse(options.body) as [string, string, number, string, string, number];
      expect(command[0]).toBe('EVAL');
      expect(command[2]).toBe(2);
      expect(command[4]).toBe('cutprompts:visits:total');
      expect(command[5]).toBe(1800);
      expect(command[1]).toContain("redis.call('SET'");
      expect(options.headers.Authorization).toBe('Bearer fake-test-token');
      if (!seen.has(command[3])) {
        seen.add(command[3]);
        total += 1;
      }
      return { ok: true, json: async () => ({ result: total }) };
    });
    vi.stubGlobal('fetch', redis);

    const first = await invoke();
    const repeat = await invoke();
    const next = await invoke('POST', { sessionId: nextId });

    expect(first.json).toHaveBeenCalledWith({ count: 22 });
    expect(repeat.json).toHaveBeenCalledWith({ count: 22 });
    expect(next.json).toHaveBeenCalledWith({ count: 23 });
    expect(redis).toHaveBeenCalledTimes(3);
  });

  it('reports storage failures instead of displaying a fake total', async () => {
    setupEnv({
      KV_REST_API_URL: 'https://redis.example.test',
      KV_REST_API_TOKEN: 'fake-test-token',
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    const res = await invoke();
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({ error: 'Visit counter unavailable' });
  });

  it('handles Redis connection failures', async () => {
    setupEnv({
      KV_REST_API_URL: 'https://redis.example.test',
      KV_REST_API_TOKEN: 'fake-test-token',
    });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    const res = await invoke();
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({ error: 'Visit counter unavailable' });
  });

  it('handles invalid Redis response', async () => {
    setupEnv({
      KV_REST_API_URL: 'https://redis.example.test',
      KV_REST_API_TOKEN: 'fake-test-token',
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ error: 'Redis error' }) }));
    const res = await invoke();
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({ error: 'Visit counter unavailable' });
  });

  it('handles non-integer Redis response', async () => {
    setupEnv({
      KV_REST_API_URL: 'https://redis.example.test',
      KV_REST_API_TOKEN: 'fake-test-token',
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ result: 'invalid' }) }));
    const res = await invoke();
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({ error: 'Visit counter unavailable' });
  });
});
