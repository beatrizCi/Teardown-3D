/**
 * App state (Zustand). UI components read from here; actions update the state
 * and forward the change to the 3D engine.
 */
import { create } from 'zustand';
import { DEV, ORDER } from '../data/devices';
import type { DeviceId, Lang, Mode } from '../data/types';
import type { Engine, Status } from '../engine/Engine';

const readHash = (): DeviceId => {
  const h = window.location.hash.slice(1) as DeviceId;
  return ORDER.includes(h) ? h : ORDER[0];
};
const readLang = (): Lang => {
  try {
    const l = localStorage.getItem('td3d-lang');
    if (l === 'en' || l === 'pt') return l;
  } catch { /* storage unavailable */ }
  return navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en';
};

const SPEEDS = [1, 2, 0.5] as const;

export interface AppState {
  engine: Engine | null;
  lang: Lang;
  device: DeviceId;
  mode: Mode;
  selected: string | null;
  level: number;
  explode: number;
  cutOn: boolean;
  cut: number;
  labelsOn: boolean;
  autoRotate: boolean;
  playing: boolean;
  speed: number;
  panelMin: boolean;
  thumbs: Partial<Record<DeviceId, string>>;
  status: Status | null;
  tip: { id: string; x: number; y: number } | null;

  setEngine(e: Engine | null): void;
  setLang(l: Lang): void;
  setDevice(d: DeviceId): void;
  step(dir: 1 | -1): void;
  setMode(m: Mode): void;
  select(id: string | null, level?: number): void;
  goLevel(i: number): void;
  hoverPart(id: string | null): void;
  setExplode(v: number): void;
  toggleCut(): void;
  setCut(v: number): void;
  toggleLabels(): void;
  toggleAutoRotate(): void;
  togglePlay(): void;
  cycleSpeed(): void;
  togglePanel(): void;
  resetView(): void;
  setThumbs(t: Partial<Record<DeviceId, string>>): void;
  setStatus(s: Status): void;
  setTip(t: AppState['tip']): void;
}

export const useStore = create<AppState>((set, get) => ({
  engine: null,
  lang: readLang(),
  device: readHash(),
  mode: 'model',
  selected: null,
  level: 0,
  explode: 0,
  cutOn: false,
  cut: 0.5,
  labelsOn: false,
  autoRotate: false,
  playing: true,
  speed: 1,
  panelMin: typeof window !== 'undefined' && window.innerWidth < 860,
  thumbs: {},
  status: null,
  tip: null,

  setEngine(engine) {
    set({ engine });
    if (!engine) return;
    const s = get();
    engine.setLang(s.lang);
    engine.load(s.device);
    engine.setPlaying(s.playing);
    engine.setSpeed(s.speed);
    engine.setAutoRotate(s.autoRotate);
  },
  setLang(lang) {
    try { localStorage.setItem('td3d-lang', lang); } catch { /* ignore */ }
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
    set({ lang });
    get().engine?.setLang(lang);
  },
  setDevice(device) {
    if (device === get().device) return;
    set({ device, selected: null, level: 0, explode: 0, cutOn: false, tip: null });
    if (window.location.hash.slice(1) !== device) window.location.hash = device;
    get().engine?.load(device);
  },
  step(dir) {
    const i = ORDER.indexOf(get().device) + dir;
    if (i >= 0 && i < ORDER.length) get().setDevice(ORDER[i]);
  },
  setMode(mode) {
    set({ mode });
    if (mode === 'analogy') {
      // The analogy view reads best with labels on and the parts spread out.
      if (!get().labelsOn) set({ labelsOn: true });
      if (get().explode < 0.3) get().setExplode(0.55);
    }
  },
  select(id, level = 0) {
    set({ selected: id, level: id ? level : 0 });
    get().engine?.select(id, level);
  },
  goLevel(i) {
    const l = DEV[get().device].levels[i];
    if (i === 0 || !l.part) get().select(null);
    else get().select(l.part, l.chip ? 2 : 1);
  },
  hoverPart(id) {
    get().engine?.setHover(id);
  },
  setExplode(explode) {
    set({ explode });
    get().engine?.setExplode(explode);
  },
  toggleCut() {
    const cutOn = !get().cutOn;
    set({ cutOn });
    get().engine?.setCut(cutOn, get().cut);
  },
  setCut(cut) {
    set({ cut });
    get().engine?.setCut(get().cutOn, cut);
  },
  toggleLabels() {
    set({ labelsOn: !get().labelsOn });
  },
  toggleAutoRotate() {
    const autoRotate = !get().autoRotate;
    set({ autoRotate });
    get().engine?.setAutoRotate(autoRotate);
  },
  togglePlay() {
    const playing = !get().playing;
    set({ playing });
    get().engine?.setPlaying(playing);
  },
  cycleSpeed() {
    const speed = SPEEDS[(SPEEDS.indexOf(get().speed as (typeof SPEEDS)[number]) + 1) % SPEEDS.length];
    set({ speed });
    get().engine?.setSpeed(speed);
  },
  togglePanel() {
    set({ panelMin: !get().panelMin });
  },
  resetView() {
    set({ selected: null, level: 0 });
    get().engine?.select(null);
  },
  setThumbs(thumbs) {
    set({ thumbs });
  },
  setStatus(status) {
    const cur = get().status;
    if (cur && cur.kind === status.kind && ('pct' in cur ? cur.pct : 0) === ('pct' in status ? status.pct : 0)) return;
    set({ status });
  },
  setTip(tip) {
    set({ tip });
  },
}));

window.addEventListener('hashchange', () => {
  const h = window.location.hash.slice(1) as DeviceId;
  if (ORDER.includes(h)) useStore.getState().setDevice(h);
});
