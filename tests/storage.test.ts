import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearHistory, deleteHistoryItem, getHistory, importHistory, readSettings, saveToHistory, writeSettings } from '../src/utils/storage';

const store = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => { store.set(key, value); },
  removeItem: (key: string) => { store.delete(key); },
});
beforeEach(() => store.clear());

describe('privacy and legacy storage', () => {
  it('does not persist prompt until explicit save', () => {
    expect(getHistory()).toEqual([]);
    expect(store.has('prompt-splitter-history')).toBe(false);
    expect(saveToHistory('secret 🔐', 2, 'tokens')).toBe(true);
    expect(getHistory()[0].text).toBe('secret 🔐');
    deleteHistoryItem(getHistory()[0].id);
    expect(getHistory()).toEqual([]);
    saveToHistory('new', 1, 'tokens');
    clearHistory();
    expect(store.has('prompt-splitter-history')).toBe(false);
  });
  it('imports old history safely without overwriting newer entries', () => {
    saveToHistory('existing', 1, 'tokens');
    const imported = [{ id: 'legacy-1', text: 'legacy\r\n💚', timestamp: 100, parts: 2, method: 'paragraphs' }];
    expect(importHistory(JSON.stringify(imported))).toBe(true);
    expect(getHistory()).toHaveLength(2);
    expect(importHistory('{"malformed":true}')).toBe(false);
    expect(getHistory()).toHaveLength(2);
  });
  it('keeps legacy and validates new settings', () => {
    store.set('cutprompt-settings-v1', JSON.stringify({ maxTokens: -4, splitMethod: 'WRONG', customDelimiter: '|||', modelId: 'gpt-4-turbo' }));
    const old = readSettings();
    expect(old.maxTokens).toBe(3000);
    expect(old.modelId).toBe('gpt-4-turbo');
    expect(old.customDelimiter).toBe('|||');
    expect(writeSettings({ ...old, maxTokens: 900, splitMethod: 'characters' })).toBe(true);
    expect(readSettings().maxTokens).toBe(900);
    expect(readSettings().splitMethod).toBe('characters');
  });
});
