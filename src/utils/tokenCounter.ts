/** Browser-only estimate, NOT the tokenizer of any AI provider. */
const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

export function graphemes(text: string): string[] {
  return Array.from(segmenter.segment(text), part => part.segment);
}

export function graphemeCount(text: string): number {
  let count = 0;
  for (const item of segmenter.segment(text)) { if (item.segment) count++; }
  return count;
}

/** Count based on grapheme clusters; this is only a rough, locally calculated estimate. */
export function estimateTokens(text: string): number {
  return text.length === 0 ? 0 : Math.ceil(graphemeCount(text) / 3);
}

export function validBudget(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 100 && value <= 1000000;
}

/**
 * Lossless splits. Every delimiter, line ending, tab and combining character is retained.
 * 'characters' budgets count extended grapheme clusters; all other methods budget
 * the browser's estimated tokens (3 graphemes per estimated token).
 */
export function getSplitMethod(method: string, text: string, budget: number, delimiter = ''): string[] {
  if (!validBudget(budget)) throw new RangeError('The part budget must be an integer between 100 and 1,000,000.');
  if (!text) return [];
  const units = graphemes(text);
  const maxUnits = method === 'characters' ? budget : budget * 3;
  const parts: string[] = [];
  let cursor = 0;
  const boundaries = new Set<number>();
  const offsets: number[] = [0];
  for (const unit of units) offsets.push(offsets[offsets.length - 1] + unit.length);

  if (delimiter) {
    let searchFrom = 0;
    while (true) {
      const offset = text.indexOf(delimiter, searchFrom);
      if (offset < 0) break;
      const start = lowerBound(offsets, offset);
      if (offsets[start] === offset && start > 0) boundaries.add(start);
      searchFrom = offset + delimiter.length;
    }
  } else {
    for (let i = 1; i < units.length; i++) {
      const prev = units[i - 1];
      const current = units[i];
      if (method === 'paragraphs' && /[\r\n]/u.test(prev) && /[\r\n]/u.test(current)) boundaries.add(i);
      else if (method === 'sentences' && /[.!?。！？]/u.test(prev) && /\s/u.test(current)) boundaries.add(i);
      else if (method === 'tokens' && /\s/u.test(prev)) boundaries.add(i);
    }
  }

  while (cursor < units.length) {
    const cap = Math.min(cursor + maxUnits, units.length);
    let end = cap;
    // Prefer a natural boundary if it uses at least 60% of the available space.
    if (cap < units.length) {
      for (let i = cap; i > cursor + Math.floor((cap - cursor) * 0.6); i--) {
        if (boundaries.has(i)) { end = i; break; }
      }
    }
    // On extremely long words/code, fall back to grapheme boundaries.
    if (end <= cursor) end = cap;
    parts.push(text.slice(offsets[cursor], offsets[end]));
    cursor = end;
  }
  return parts;
}

function lowerBound(values: number[], target: number): number {
  let lo = 0;
  let hi = values.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (values[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** Legacy import compatibility for old formatted chunks. Prefer raw parts for all new exports. */
export function extractOriginalContent(part: string, index: number, totalParts: number): string {
  const start = `[START PART ${index + 1}/${totalParts}]\n`;
  const end = `\n[END PART ${index + 1}/${totalParts}]`;
  const a = part.indexOf(start);
  const b = part.indexOf(end, a + start.length);
  return a >= 0 && b >= 0 ? part.slice(a + start.length, b) : part;
}
