import { describe, expect, it } from 'vitest';
import { estimateTokens, getSplitMethod, graphemeCount, validBudget } from '../src/utils/tokenCounter';

const scenarios = [
  '', ' ', '\t\r\n', '\r\n\r\nHello\n\tworld\r\n',
  'Tiếng Việt có dấu: ă â đ ê ơ ư 👩🏽‍🚀 🏳️‍🌈 e\u0301 🇻🇳',
  '# Markdown\n\n```js\nconsole.log(`hello`);\n```\n\nNext.',
  '{"name":"a\\nb","nested":{"emoji":"👨‍👩‍👧‍👦"}}',
  '<xml>\n  <tag a="&amp;">a\tb</tag>\n</xml>',
  'a'.repeat(1000), '🔥'.repeat(250), 'word and spaces. '.repeat(110),
  'abc<SECTION>def<SECTION>xyz',
  '\r\n'.repeat(500),
];

describe('lossless chunking', () => {
  for (const method of ['tokens', 'characters', 'paragraphs', 'sentences']) {
    for (const text of scenarios) {
      it(`${method} restores ${JSON.stringify(text.slice(0, 18))}`, () => {
        const chunks = getSplitMethod(method, text, 100);
        expect(chunks.join('')).toBe(text);
        expect(chunks.every(Boolean)).toBe(true);
        for (const part of chunks) {
          if (method === 'characters') expect(graphemeCount(part)).toBeLessThanOrEqual(100);
          else expect(estimateTokens(part)).toBeLessThanOrEqual(100);
        }
      });
    }
  }
  it('uses exact delimiter boundaries and keeps delimiter bytes', () => {
    const text = ('A'.repeat(210) + '::DIV::').repeat(5);
    const parts = getSplitMethod('characters', text, 100, '::DIV::');
    expect(parts.join('')).toBe(text);
    expect(parts.every(p => graphemeCount(p) <= 100)).toBe(true);
  });
  it('retains text when requested delimiter is absent', () => {
    const text = 'abc'.repeat(500);
    expect(getSplitMethod('tokens', text, 100, 'not-present').join('')).toBe(text);
  });
  it('rejects invalid budgets', () => {
    for (const budget of [-1, 0, 0.3, Number.NaN, Number.POSITIVE_INFINITY, 99, 1000001]) {
      expect(validBudget(budget)).toBe(false);
      expect(() => getSplitMethod('tokens', 'hello', budget)).toThrow();
    }
    expect(validBudget(100)).toBe(true);
  });
  it('restores random Unicode samples across methods', () => {
    const alphabet = ['👩🏽‍💻', 'ă', '\r\n', '\n', '\t', ' ', 'a', '🇻🇳', '💚', '[START PART 1/2]', 'é', '中'];
    let seed = 12345678;
    const rand = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed; };
    for (let k = 0; k < 75; k++) {
      const text = Array.from({ length: rand() % 550 + 100 }, () => alphabet[rand() % alphabet.length]).join('');
      for (const method of ['tokens', 'characters', 'paragraphs', 'sentences']) {
        const parts = getSplitMethod(method, text, 100, '💚');
        expect(parts.join('')).toBe(text);
        expect(parts.every(p => method === 'characters' ? graphemeCount(p) <= 100 : estimateTokens(p) <= 100)).toBe(true);
      }
    }
  });
});
