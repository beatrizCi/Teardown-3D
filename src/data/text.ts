// Small helpers for looking up localized text.
import { ANA } from './analogies';
import { TXT } from './parts';
import { UI } from './ui';
import type { DeviceId, Lang, Mode } from './types';
import type { Status } from '../engine/Engine';

export const partName = (d: DeviceId, id: string, mode: Mode, lang: Lang) => (mode === 'analogy' ? ANA[d].p[id][lang] : TXT[d][id][lang]);

export function statusText(s: Status, lang: Lang) {
  const P = lang === 'pt';
  switch (s.kind) {
    case 'paused':
      return UI[lang].paused;
    case 'retro':
      return P ? 'Disco e CD girando · ventoinha ligada' : 'Disk + CD spinning · fan on';
    case 'modern':
      return P ? 'Ventoinha ligada · sem partes móveis no SSD' : 'Fan on · no moving parts in the SSD';
    case 'player-spin':
      return (P ? 'Disco girando · carregando ' : 'Drive spinning · buffering ') + s.pct + '%';
    case 'player-play':
      return P ? 'Disco parado · tocando da RAM' : 'Drive stopped · playing from RAM';
  }
}
