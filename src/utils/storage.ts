export interface HistoryItem {
  id: string;
  text: string;
  timestamp: number;
  parts: number;
  method: string;
  legacyTruncated?: boolean;
}

const HISTORY_KEY = 'prompt-splitter-history'; // Preserve existing local records.
const MAX_HISTORY = 50;
const MAX_HISTORY_TEXT = 500_000;
const SETTINGS_KEY = 'cutprompt-settings-v1';

function isHistoryItem(item: unknown): item is HistoryItem {
  if (!item || typeof item !== 'object') return false;
  const x = item as Record<string, unknown>;
  return typeof x.id === 'string' && typeof x.text === 'string' && x.text.length <= MAX_HISTORY_TEXT &&
    typeof x.timestamp === 'number' && Number.isFinite(x.timestamp) &&
    typeof x.parts === 'number' && Number.isFinite(x.parts) && x.parts >= 0 &&
    typeof x.method === 'string';
}

export function getHistory(): HistoryItem[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isHistoryItem).slice(0, MAX_HISTORY);
  } catch { return []; }
}

/** Called only on an explicit user action. Never silently store prompt text. */
export function saveToHistory(text: string, parts: number, method: string): boolean {
  if (!text || text.length > MAX_HISTORY_TEXT) return false;
  try {
    const item: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text, timestamp: Date.now(), parts, method,
    };
    localStorage.setItem(HISTORY_KEY, JSON.stringify([item, ...getHistory()].slice(0, MAX_HISTORY)));
    return true;
  } catch { return false; }
}

export function deleteHistoryItem(id: string): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(getHistory().filter(item => item.id !== id)));
}
export function clearHistory(): void { localStorage.removeItem(HISTORY_KEY); }
export function exportHistory(): string { return JSON.stringify(getHistory(), null, 2); }
export function importHistory(data: string): boolean {
  try {
    if (data.length > 26_000_000) return false;
    const parsed: unknown = JSON.parse(data);
    if (!Array.isArray(parsed) || !parsed.every(isHistoryItem)) return false;
    const map = new Map<string, HistoryItem>();
    for (const item of [...parsed, ...getHistory()]) map.set(item.id, map.get(item.id) || item);
    const merged = [...map.values()].sort((a, b) => b.timestamp - a.timestamp).slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(merged));
    return true;
  } catch { return false; }
}

export interface SavedSettings { maxTokens: number; splitMethod: string; customDelimiter: string; modelId: string }
export const defaultSettings: SavedSettings = { maxTokens: 3000, splitMethod: 'tokens', customDelimiter: '', modelId: 'general-safe' };
export function readSettings(): SavedSettings {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    const x = parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {};
    return {
      maxTokens: typeof x.maxTokens === 'number' && Number.isSafeInteger(x.maxTokens) && x.maxTokens >= 100 && x.maxTokens <= 1_000_000 ? x.maxTokens : defaultSettings.maxTokens,
      splitMethod: typeof x.splitMethod === 'string' && ['tokens', 'characters', 'paragraphs', 'sentences'].includes(x.splitMethod) ? x.splitMethod : defaultSettings.splitMethod,
      customDelimiter: typeof x.customDelimiter === 'string' ? x.customDelimiter.slice(0, 500) : defaultSettings.customDelimiter,
      modelId: typeof x.modelId === 'string' ? x.modelId : defaultSettings.modelId,
    };
  } catch { return defaultSettings; }
}
export function writeSettings(value: SavedSettings): boolean {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(value)); return true; }
  catch { return false; }
}
