import { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

type CounterState = { status: 'loading' } | { status: 'unavailable' } | { status: 'ready'; count: number };
let inFlight: Promise<number> | null = null;

function getVisitId() {
  const storageKey = 'cutprompts-visit-session-v1';
  const now = Date.now();
  try {
    const previous = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
    if (
      typeof previous?.id === 'string' &&
      typeof previous?.created === 'number' &&
      previous.created <= now &&
      now - previous.created < 30 * 60 * 1000
    ) return previous.id as string;
  } catch { /* Storage may be disabled. The API still deduplicates its tokens. */ }
  const id = crypto.randomUUID();
  try { sessionStorage.setItem(storageKey, JSON.stringify({ id, created: now })); } catch { /* optional */ }
  return id;
}

function countVisit() {
  if (!inFlight) {
    inFlight = fetch('/api/visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: getVisitId() }),
      cache: 'no-store',
    }).then(async (response) => {
      if (!response.ok) throw new Error('Visit counter unavailable');
      const payload: unknown = await response.json();
      if (
        !payload || typeof payload !== 'object' || !('count' in payload) ||
        typeof payload.count !== 'number' || !Number.isSafeInteger(payload.count) || payload.count < 0
      ) throw new Error('Invalid visit count');
      return payload.count;
    });
  }
  return inFlight;
}

export default function VisitCounter() {
  const { t, language } = useLanguage();
  const [counter, setCounter] = useState<CounterState>({ status: 'loading' });

  useEffect(() => {
    let mounted = true;
    countVisit().then(
      (value) => { if (mounted) setCounter({ status: 'ready', count: value }); },
      () => { if (mounted) setCounter({ status: 'unavailable' }); },
    );
    return () => { mounted = false; };
  }, []);

  if (counter.status === 'loading') return <span>{t('footer.visitsLoading')}</span>;
  if (counter.status === 'unavailable') return <span>{t('footer.visitsUnavailable')}</span>;
  return <span>{t('footer.visits')}: {counter.count.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}</span>;
}
