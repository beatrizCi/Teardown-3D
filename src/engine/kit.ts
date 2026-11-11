/**
 * Building kit: tiny helpers the device builders use to create geometry, materials
 * and "parts". A build collects its output into the module-level `build` record,
 * which the engine reads once the builder returns.
 */
import * as THREE from 'three';

export interface Part {
  id: string;
  group: THREE.Group;
  base: THREE.Vector3;
  off: THREE.Vector3;
  shell: boolean;
  mats: Set<THREE.MeshStandardMaterial>;
  color: string;
  colorN: number;
  die: THREE.Mesh | null;
  /** Cached label anchor relative to the group origin. */
  lc?: THREE.Vector3;
}

export interface Spinner {
  obj: THREE.Object3D;
  axis: 'x' | 'y' | 'z';
  speed: number;
  when?: () => boolean;
}

export type ScreenKind = 'retro' | 'modern' | 'player';
export interface Screen {
  mat: THREE.MeshStandardMaterial;
  kind: ScreenKind;
  tex: THREE.CanvasTexture | null;
}

export interface FlowFx {
  update(t: number, on: boolean): void;
}

export interface LidRig {
  g: THREE.Group;
  base: THREE.Vector3;
  off: THREE.Vector3;
}

/** Shared state that animated textures read (screen contents). */
export const screenState = { lang: 'en' as 'en' | 'pt', phase: 'spin' as 'spin' | 'play', phaseT: 0 };

/** Everything a builder produced. Reset by beginBuild(). */
export const build = {
  parts: [] as Part[],
  byId: {} as Record<string, Part>,
  spinners: [] as Spinner[],
  screens: [] as Screen[],
  flowFx: null as FlowFx | null,
  lidRig: null as LidRig | null,
};

/** The cutaway plane every material clips against. */
export const clip = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 99);

let seed = 7;
/** Deterministic pseudo-random numbers, so every build looks the same. */
export const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

export function beginBuild() {
  build.parts = [];
  build.byId = {};
  build.spinners = [];
  build.screens = [];
  build.flowFx = null;
  build.lidRig = null;
  seed = 7;
}
export const spinners = {
  push: (s: Spinner) => build.spinners.push(s),
};
export function setFlowFx(f: FlowFx) {
  build.flowFx = f;
}
export function setLidRig(r: LidRig) {
  build.lidRig = r;
}

/* ---------- geometry ---------- */
export const BX = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
export const CY = (r: number, h: number, s = 32) => new THREE.CylinderGeometry(r, r, h, s);

type MatOpts = THREE.MeshStandardMaterialParameters;
/** Standard material. Colours are given as sRGB hex and converted to linear. */
export function M(color: number, o: MatOpts = {}) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color).convertSRGBToLinear(),
    roughness: 0.55,
    metalness: 0.1,
    clippingPlanes: [clip],
    clipShadows: true,
    side: THREE.DoubleSide,
    ...o,
  });
}
/** Material that glows (emissive) while the device is powered. */
export function G(color: number, glow: number, o: MatOpts = {}) {
  const m = M(color, o);
  m.userData.glow = glow;
  return m;
}
export function mesh(g: THREE.BufferGeometry, m: THREE.Material | THREE.Material[], x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(g, m);
  o.position.set(x, y, z);
  return o;
}
/** A mesh hidden at the "Chip" zoom level (e.g. a heatsink on top of the die). */
export function cover(g: THREE.Object3D, m: THREE.Mesh) {
  m.userData.cover = true;
  g.add(m);
}

function rr(p: THREE.Path, w: number, d: number, r: number, cx = 0, cy = 0) {
  r = Math.max(0.005, Math.min(r, w / 2 - 1e-3, d / 2 - 1e-3));
  const x = cx - w / 2, y = cy - d / 2;
  p.moveTo(x + r, y);
  p.lineTo(x + w - r, y);
  p.quadraticCurveTo(x + w, y, x + w, y + r);
  p.lineTo(x + w, y + d - r);
  p.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  p.lineTo(x + r, y + d);
  p.quadraticCurveTo(x, y + d, x, y + d - r);
  p.lineTo(x, y + r);
  p.quadraticCurveTo(x, y, x + r, y);
  return p;
}
export interface Hole { w: number; d: number; x?: number; y?: number; z?: number; r?: number }
/** Rounded plate in XZ, thickness h along Y, optional rounded holes. */
export function slab(w: number, h: number, d: number, r: number, holes: Hole[] = []) {
  const s = rr(new THREE.Shape(), w, d, r) as THREE.Shape;
  holes.forEach((o) => s.holes.push(rr(new THREE.Path(), o.w, o.d, o.r ?? 0.02, o.x ?? 0, -(o.z ?? 0))));
  const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 10 });
  g.rotateX(-Math.PI / 2);
  g.translate(0, -h / 2, 0);
  return g;
}
export function ring(w: number, d: number, h: number, r: number, t: number) {
  return slab(w, h, d, r, [{ w: w - 2 * t, d: d - 2 * t, r: Math.max(r - t, 0.01) }]);
}
/** Upright rounded plate in XY, thickness along Z. Holes use {w, d (height), x, y}. */
export function vslab(w: number, t: number, h: number, r: number, holes: Hole[] = []) {
  const g = slab(w, t, h, r, holes.map((o) => ({ ...o, z: -(o.y ?? 0) })));
  g.rotateX(Math.PI / 2);
  return g;
}
/** Scatter small SMD-style components on a board surface. */
export function sprinkle(g: THREE.Object3D, w: number, d: number, y: number, n: number) {
  const ms = [0x18181b, 0x2a2b30, 0xc9a24a, 0x8a9098, 0x3b3d44].map((c, i) =>
    M(c, { metalness: i === 2 || i === 3 ? 0.7 : 0.2, roughness: 0.45 }),
  );
  for (let i = 0; i < n; i++) {
    const bw = 0.03 + rnd() * 0.12, bd = 0.03 + rnd() * 0.1, bh = 0.008 + rnd() * 0.02;
    g.add(mesh(BX(bw, bh, bd), ms[i % 5], (rnd() - 0.5) * (w - bw), y + bh / 2, (rnd() - 0.5) * (d - bd)));
  }
}
/** Simple uniform key grid with a space bar (used by the retro laptop). */
export function keys(g: THREE.Object3D, cols: number, rows: number, px: number, pz: number, kw: number, kd: number, kh: number, m: THREE.Material, y: number) {
  const im = new THREE.InstancedMesh(BX(kw, kh, kd), m, (rows - 1) * cols + 8);
  const o = new THREE.Object3D();
  let k = 0;
  const x0 = (-(cols - 1) * px) / 2, z0 = (-(rows - 1) * pz) / 2;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (r === rows - 1 && c > 3 && c < cols - 4) continue;
      o.position.set(x0 + c * px, y, z0 + r * pz);
      o.updateMatrix();
      im.setMatrixAt(k++, o.matrix);
    }
  im.count = k;
  g.add(im);
  g.add(mesh(BX((cols - 8) * px - (px - kw), kh, kd), m, 0, y, z0 + (rows - 1) * pz));
}
export function fanBlades(n: number, r: number, bw: number, bh: number, m: THREE.Material, hubM: THREE.Material) {
  const b = new THREE.Group();
  b.add(mesh(CY(r * 0.45, bh * 1.2, 24), hubM));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const bl = mesh(BX(bw, bh, 0.02), m, Math.cos(a) * r, 0, Math.sin(a) * r);
    bl.rotation.y = -a;
    bl.rotation.x = 0.5;
    b.add(bl);
  }
  return b;
}

/** Create a selectable part: a group that moves by `off` when the model is exploded. */
export function part(parent: THREE.Object3D, id: string, pos: [number, number, number], off: [number, number, number], o: { shell?: boolean } = {}) {
  const g = new THREE.Group();
  g.position.set(...pos);
  g.userData.partId = id;
  parent.add(g);
  const p: Part = {
    id, group: g, base: new THREE.Vector3(...pos), off: new THREE.Vector3(...off),
    shell: !!o.shell, mats: new Set(), color: '#888888', colorN: 0x888888, die: null,
  };
  build.parts.push(p);
  build.byId[id] = p;
  return g;
}
export function screenPlane(g: THREE.Object3D, w: number, h: number, z: number, kind: ScreenKind) {
  const m = M(0x050607, { roughness: 0.22, metalness: 0 });
  m.userData.screen = true;
  g.add(mesh(new THREE.PlaneGeometry(w, h), m, 0, 0, z));
  build.screens.push({ mat: m, kind, tex: null });
}

/* ---------- chip die floor plans ---------- */
type Block = [string, number, number, number, number, string];
const DIES: Record<ScreenKind, { bg: string; b: Block[] }> = {
  retro: { bg: '#3a3328', b: [['CORE', 0, 0, 0.56, 0.58, '#6a7fb5'], ['L1 I', 0.56, 0, 0.44, 0.29, '#5aa38a'], ['L1 D', 0.56, 0.29, 0.44, 0.29, '#4f9580'], ['L2 CACHE', 0, 0.58, 0.68, 0.42, '#b59a5a'], ['FPU', 0.68, 0.58, 0.32, 0.42, '#a5677a']] },
  modern: { bg: '#26282e', b: [['P-CORES', 0, 0, 0.4, 0.44, '#5b7fd6'], ['E-CORES', 0.4, 0, 0.2, 0.44, '#6fb0d6'], ['GPU', 0.6, 0, 0.4, 0.56, '#9a6fd6'], ['CACHE', 0, 0.44, 0.6, 0.2, '#c9a050'], ['NEURAL', 0, 0.64, 0.34, 0.36, '#d66f8f'], ['MEDIA', 0.34, 0.64, 0.26, 0.36, '#5aa38a'], ['MEM CTRL', 0.6, 0.56, 0.4, 0.44, '#8a8f99']] },
  player: { bg: '#2c2a26', b: [['CPU', 0, 0, 0.5, 0.5, '#5b7fd6'], ['MP3 DSP', 0.5, 0, 0.5, 0.5, '#d68a4f'], ['SRAM', 0, 0.5, 0.42, 0.5, '#c9a050'], ['DAC', 0.42, 0.5, 0.3, 0.5, '#5aa38a'], ['USB/FW', 0.72, 0.5, 0.28, 0.5, '#8a8f99']] },
};
export function ctex(w: number, h: number, draw: (x: CanvasRenderingContext2D, w: number, h: number) => void) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
function dieTex(kind: ScreenKind) {
  const S = 512, d = DIES[kind];
  return ctex(S, S, (x) => {
    x.fillStyle = d.bg;
    x.fillRect(0, 0, S, S);
    const P = 18, I = S - 2 * P;
    d.b.forEach(([n, bx, by, bw, bh, col]) => {
      const X = P + bx * I + 3, Y = P + by * I + 3, W = bw * I - 6, H = bh * I - 6;
      x.fillStyle = col;
      x.globalAlpha = 0.85;
      x.fillRect(X, Y, W, H);
      x.globalAlpha = 1;
      x.strokeStyle = 'rgba(255,255,255,.18)';
      x.lineWidth = 1;
      const step = n.includes('CACHE') || n === 'SRAM' ? 8 : 14;
      for (let i = X + step; i < X + W; i += step) { x.beginPath(); x.moveTo(i, Y); x.lineTo(i, Y + H); x.stroke(); }
      for (let j = Y + step; j < Y + H; j += step) { x.beginPath(); x.moveTo(X, j); x.lineTo(X + W, j); x.stroke(); }
      x.fillStyle = 'rgba(0,0,0,.55)';
      x.font = 'bold 30px Inter,sans-serif';
      const tw = x.measureText(n).width;
      x.fillRect(X + W / 2 - tw / 2 - 8, Y + H / 2 - 22, tw + 16, 40);
      x.fillStyle = '#fff';
      x.textAlign = 'center';
      x.fillText(n, X + W / 2, Y + H / 2 + 10);
      x.textAlign = 'left';
    });
    x.strokeStyle = '#d4b25a';
    x.lineWidth = 6;
    x.strokeRect(5, 5, S - 10, S - 10);
  });
}
/** A chip die with a printed floor plan, shown when zooming to the "Chip" level. */
export function die(g: THREE.Object3D, size: number, kind: ScreenKind, x: number, y: number, z: number, rx: number) {
  const t = dieTex(kind);
  const m = M(0xffffff, { roughness: 0.35, metalness: 0.2, map: t, emissiveMap: t, emissive: new THREE.Color(0x777777) });
  m.userData.screen = true;
  const pl = mesh(new THREE.PlaneGeometry(size, size), m, x, y, z);
  pl.rotation.x = rx;
  g.add(pl);
  g.userData.die = pl;
}
