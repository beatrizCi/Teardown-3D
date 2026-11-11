import { describe, expect, it } from 'vitest';
import { ANA } from './analogies';
import { DEV, GROUPS, ORDER } from './devices';
import { TXT } from './parts';
import { UI } from './ui';

const LANGS = ['en', 'pt'] as const;

describe('content', () => {
  it('lists every device in exactly one group', () => {
    const grouped = GROUPS.flatMap((g) => g.items);
    expect(grouped.sort()).toEqual([...ORDER].sort());
  });

  it.each(ORDER)('%s: every part has a name and description in both languages', (d) => {
    for (const [id, t] of Object.entries(TXT[d])) {
      for (const l of LANGS) {
        expect(t[l][0], `${d}/${id}/${l} name`).toBeTruthy();
        expect(t[l][1].length, `${d}/${id}/${l} description`).toBeGreaterThan(20);
      }
    }
  });

  it.each(ORDER)('%s: the analogy covers exactly the same parts', (d) => {
    expect(Object.keys(ANA[d].p).sort()).toEqual(Object.keys(TXT[d]).sort());
    for (const l of LANGS) expect(ANA[d].intro[l]).toBeTruthy();
  });

  it.each(ORDER)('%s: scale-ladder levels point at real parts', (d) => {
    const levels = DEV[d].levels;
    expect(levels).toHaveLength(UI.en.lv.length);
    for (const lv of levels) if (lv.part) expect(TXT[d]).toHaveProperty(lv.part);
  });

  it('has the same interface strings in both languages', () => {
    expect(Object.keys(UI.pt).sort()).toEqual(Object.keys(UI.en).sort());
  });
});
