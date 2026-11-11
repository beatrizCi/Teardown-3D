/**
 * The 3D engine. It owns the Three.js renderer, scene, camera and animation loop.
 * React never touches Three.js objects directly: it calls the small public API below,
 * and the engine reports user interaction back through callbacks.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DEV, ORDER } from '../data/devices';
import { TXT } from '../data/parts';
import type { DeviceId, Lang } from '../data/types';
import { beginBuild, build, clip, screenState, type FlowFx, type LidRig, type Part, type Screen, type Spinner } from './kit';
import { drawScreen, powerScreens } from './screens';
import { buildRetro } from './builders/retroLaptop';
import { buildModern } from './builders/modernLaptop';
import { buildPlayer } from './builders/musicPlayer';

// Colours are authored as sRGB hex and converted explicitly in the kit.
THREE.ColorManagement.enabled = false;

const BUILDERS: Record<DeviceId, (r: THREE.Group) => void> = {
  'retro-laptop': buildRetro,
  'modern-laptop': buildModern,
  'music-player': buildPlayer,
};

export const PALETTE = ['#e8949f', '#6e56cf', '#5aa9b8', '#f2b544', '#81b29a', '#e07a5f', '#3d7fd6', '#a98be8', '#4f9d69', '#d4a373', '#2e2a6b', '#c97b84', '#7d8597', '#5fa8d3', '#b56576', '#8fb339', '#e9c46a', '#2a9d8f', '#e76f51', '#264653'];
export const partOrder = (d: DeviceId) => Object.keys(TXT[d]);
export const partColor = (d: DeviceId, id: string) => PALETTE[partOrder(d).indexOf(id) % PALETTE.length];

export type Status =
  | { kind: 'paused' }
  | { kind: 'retro' }
  | { kind: 'modern' }
  | { kind: 'player-spin'; pct: number }
  | { kind: 'player-play' };

export interface EngineCallbacks {
  onPick(id: string | null): void;
  onHover(id: string | null, x: number, y: number): void;
  onStatus(s: Status): void;
}
export interface FreeArea { left: number; right: number; top: number; bottom: number }

const COOLING_PARTS = ['soc', 'heatpipe', 'cooling'];
const tmpQ = new THREE.Quaternion();
const tmpV = new THREE.Vector3();

function makeEnvironment(renderer: THREE.WebGLRenderer) {
  const es = new THREE.Scene();
  es.add(new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), new THREE.MeshBasicMaterial({ color: 0x8a8f99, side: THREE.BackSide })));
  const panel = (w: number, h: number, c: [number, number, number], x: number, y: number, z: number, ry = 0, rx = 0) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(...c), side: THREE.DoubleSide }));
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, 0);
    es.add(m);
  };
  panel(12, 5, [2.4, 2.4, 2.4], 0, 9, 0, 0, Math.PI / 2);
  panel(7, 7, [1.6, 1.5, 1.4], -9, 2, 2, Math.PI / 2);
  panel(7, 5, [1.2, 1.3, 1.5], 8, 3, -4, -Math.PI / 2);
  panel(10, 3, [1.3, 1.3, 1.3], 0, 2, 9, Math.PI);
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(es, 0.04).texture;
  pm.dispose();
  return tex;
}
function addLights(scene: THREE.Scene, shadows: boolean) {
  // Three.js now uses physical light units, hence the factors of π.
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8dce4, 0.35 * Math.PI));
  const key = new THREE.DirectionalLight(0xffffff, 1.0 * Math.PI);
  key.position.set(3, 9, 5);
  if (shadows) {
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 25 });
    key.shadow.bias = -0.0004;
  }
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xdfe8ff, 0.45 * Math.PI);
  fill.position.set(-5, 3, -4);
  scene.add(fill);
}
function disposeTree(g: THREE.Object3D) {
  g.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.geometry) m.geometry.dispose();
    if (m.material)
      ([] as THREE.Material[]).concat(m.material).forEach((mat) => {
        (mat as THREE.MeshStandardMaterial).map?.dispose();
        mat.dispose();
      });
  });
}

export class Engine {
  readonly renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(36, 1, 0.02, 100);
  private controls: OrbitControls;
  private timer = new THREE.Timer();
  private raf = 0;
  private root: THREE.Group | null = null;
  private floor: THREE.Mesh;
  private blob: THREE.Mesh;
  private cutVis = new THREE.Group();
  private env: THREE.Texture;

  private cur: DeviceId = 'retro-laptop';
  private parts: Part[] = [];
  private byId: Record<string, Part> = {};
  private spinners: Spinner[] = [];
  private screens: Screen[] = [];
  private flowFx: FlowFx | null = null;
  private lidRig: LidRig | null = null;
  private sel: Part | null = null;
  private hover: Part | null = null;
  private level = 0;
  private playing = true;
  private speed = 1;
  private explodeT = 0;
  private explodeCur = 0;
  private cutT = 1;
  private cutCur = 1;
  private cutX = 99;
  private fly: { pos: THREE.Vector3; target: THREE.Vector3 } | null = null;
  private flowT = 0;
  private T = 0;
  private scrT = 0;
  private statusT = 0;
  private modelC = new THREE.Vector3();
  private modelR = 1;
  private FA = { L: 0, R: 800, T: 0, B: 600 };
  private labels: { p: Part; el: HTMLElement; w?: number; h?: number }[] = [];
  private raycaster = new THREE.Raycaster();
  private down: [number, number] | null = null;

  constructor(private container: HTMLElement, private cb: EngineCallbacks) {
    const r = (this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }));
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    r.localClippingEnabled = true;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFShadowMap;
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.domElement.style.display = 'block';
    r.domElement.style.touchAction = 'none';
    container.appendChild(r.domElement);

    this.controls = new OrbitControls(this.camera, r.domElement);
    Object.assign(this.controls, { enableDamping: true, dampingFactor: 0.08, minDistance: 0.25, maxDistance: 16, autoRotateSpeed: 0.9 });
    this.controls.addEventListener('start', () => (this.fly = null));

    this.env = makeEnvironment(r);
    this.scene.environment = this.env;
    addLights(this.scene, true);

    this.floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.13 }));
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);

    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const x = c.getContext('2d')!;
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(30,35,50,.22)');
    g.addColorStop(1, 'rgba(30,35,50,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
    this.blob.rotation.x = -Math.PI / 2;
    this.scene.add(this.blob);

    this.cutVis.add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0x2f6fe4, transparent: true, opacity: 0.05, side: THREE.DoubleSide, depthWrite: false })));
    this.cutVis.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1)), new THREE.LineBasicMaterial({ color: 0x2f6fe4, transparent: true, opacity: 0.45 })));
    this.cutVis.rotation.y = Math.PI / 2;
    this.scene.add(this.cutVis);

    const el = r.domElement;
    el.addEventListener('pointerdown', this.onDown);
    el.addEventListener('pointerup', this.onUp);
    el.addEventListener('pointermove', this.onMove);
    el.addEventListener('pointerleave', this.onLeave);
    this.timer.connect(document);
    this.resize();
    this.tick();
  }

  /* ---------------- public API ---------------- */

  load(id: DeviceId) {
    this.cur = id;
    if (this.root) {
      this.scene.remove(this.root);
      disposeTree(this.root);
    }
    beginBuild();
    this.root = new THREE.Group();
    this.scene.add(this.root);
    BUILDERS[id](this.root);
    // Keep our own references: the shared build record is reused by later builds (e.g. thumbnails).
    this.parts = build.parts;
    this.byId = build.byId;
    this.spinners = build.spinners;
    this.screens = build.screens;
    this.flowFx = build.flowFx;
    this.lidRig = build.lidRig;
    this.register();
    screenState.phase = 'spin';
    screenState.phaseT = 0;
    powerScreens(this.screens);
    this.sel = this.hover = null;
    this.level = 0;
    this.explodeT = this.explodeCur = 0;
    this.cutT = this.cutCur = 1;
    const d = DEV[id];
    this.floor.position.y = d.floor;
    this.blob.position.y = d.floor + 0.003;
    const small = id === 'music-player';
    this.blob.scale.set(small ? 2.4 : 5, small ? 1.6 : 4, 1);
    this.measure(0);
    this.setTargets();
    this.flyHome(true);
  }

  select(id: string | null, level = 0) {
    const p = id ? this.byId[id] ?? null : null;
    this.sel = p;
    this.level = p ? level : 0;
    this.setTargets();
    this.labels.forEach((l) => l.el.classList.toggle('sel', l.p === p));
    if (!p) {
      this.measure(this.explodeT);
      this.flyHome();
    } else if (level === 2 && p.die) this.flyDie(p);
    else this.flyPart(p);
  }

  setExplode(v: number, refit = true) {
    this.explodeT = v;
    if (refit && !this.sel) {
      this.measure(v);
      this.flyHome();
    }
  }
  setCut(on: boolean, v: number) {
    this.cutT = on ? 1 - v * 0.95 : 1;
  }
  setPlaying(b: boolean) {
    this.playing = b;
    this.emitStatus();
  }
  setSpeed(s: number) {
    this.speed = s;
  }
  setAutoRotate(b: boolean) {
    this.controls.autoRotate = b;
  }
  setHover(id: string | null) {
    this.hover = id ? this.byId[id] ?? null : null;
    this.setTargets();
  }
  setLang(l: Lang) {
    screenState.lang = l;
    this.screens.forEach(drawScreen);
  }
  resetView() {
    this.measure(this.explodeT);
    this.flyHome();
  }
  /** The part of the screen not covered by panels; the model is centred and fitted in it. */
  setFreeArea(a: FreeArea) {
    this.FA = { L: a.left, R: a.right, T: a.top, B: a.bottom };
    this.resize();
    if (!this.sel && !this.fly) this.flyHome(true);
  }
  /** Register label elements; the engine positions them every frame. */
  setLabels(entries: { id: string; el: HTMLElement }[] | null) {
    this.labels = (entries ?? []).filter((e) => this.byId[e.id]).map((e) => ({ p: this.byId[e.id], el: e.el }));
    this.labels.forEach((l) => l.el.classList.toggle('sel', l.p === this.sel));
  }

  /** Render a small transparent thumbnail of every device (used for the model tiles). */
  static thumbnails(): Record<DeviceId, string> {
    const W = 528, H = 320;
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    r.setSize(W, H, false);
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.setClearColor(0xffffff, 0);
    const ts = new THREE.Scene();
    ts.environment = makeEnvironment(r);
    addLights(ts, false);
    const cam = new THREE.PerspectiveCamera(30, W / H, 0.1, 100);
    const out = {} as Record<DeviceId, string>;
    const keepLidState = { ...screenState };
    screenState.phase = 'play';
    screenState.phaseT = 8;
    ORDER.forEach((id) => {
      beginBuild();
      const g = new THREE.Group();
      BUILDERS[id](g);
      powerScreens(build.screens);
      ts.add(g);
      const d = DEV[id], Tg = new THREE.Vector3(...d.target);
      cam.position.copy(new THREE.Vector3(...d.cam).sub(Tg).multiplyScalar(id === 'music-player' ? 0.62 : 0.72).add(Tg));
      cam.lookAt(Tg);
      r.render(ts, cam);
      out[id] = r.domElement.toDataURL('image/png');
      ts.remove(g);
      disposeTree(g);
      build.screens.forEach((s) => s.tex?.dispose());
    });
    Object.assign(screenState, keepLidState);
    ts.environment?.dispose();
    r.dispose();
    r.forceContextLoss();
    return out;
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.timer.dispose();
    const el = this.renderer.domElement;
    el.removeEventListener('pointerdown', this.onDown);
    el.removeEventListener('pointerup', this.onUp);
    el.removeEventListener('pointermove', this.onMove);
    el.removeEventListener('pointerleave', this.onLeave);
    if (this.root) disposeTree(this.root);
    this.controls.dispose();
    this.env.dispose();
    this.renderer.dispose();
    el.remove();
  }

  /* ---------------- looks ---------------- */

  private register() {
    this.parts.forEach((p) => {
      p.color = partColor(this.cur, p.id);
      p.colorN = parseInt(p.color.slice(1), 16);
      p.die = (p.group.userData.die as THREE.Mesh) ?? null;
      p.group.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh || o.userData.noPick) return;
        m.castShadow = m.receiveShadow = true;
        ([] as THREE.Material[]).concat(m.material).forEach((mat) => {
          const sm = mat as THREE.MeshStandardMaterial;
          const u = sm.userData;
          if (!u.reg) {
            u.reg = true;
            u.op = sm.opacity;
            u.em = sm.emissive.getHex();
            u.tOp = sm.opacity;
            u.tEm = u.glow || u.em;
            u.tEi = 1;
          }
          p.mats.add(sm);
        });
      });
    });
  }

  private setTargets() {
    const iso = this.level === 2;
    this.parts.forEach((p) => {
      const isSel = p === this.sel, faded = !!this.sel && !isSel;
      p.mats.forEach((m) => {
        const u = m.userData;
        let op = u.op;
        if (faded) op = Math.min(op, iso ? 0 : p.shell ? 0.05 : 0.12);
        u.tOp = op;
        if (u.screen) return;
        if (isSel) { u.tEm = p.colorN; u.tEi = 0.25; }
        else if (p === this.hover) { u.tEm = 0x4d8cff; u.tEi = 0.16; }
        else if (u.glow) { u.tEm = u.glow; u.tEi = 1; }
        else { u.tEm = u.em; u.tEi = 1; }
      });
      p.group.traverse((o) => {
        if ((o as THREE.Mesh).isMesh && !o.userData.noPick) o.castShadow = !faded;
        if (o.userData.cover) o.visible = !(iso && isSel);
      });
    });
  }

  private animLooks(dt: number) {
    const k = Math.min(1, dt * 7);
    this.parts.forEach((p) => {
      let vis = false;
      p.mats.forEach((m) => { if (m.userData.tOp > 0 || m.opacity > 0.02) vis = true; });
      p.group.visible = vis;
      p.mats.forEach((m) => {
        const u = m.userData;
        m.opacity += (u.tOp - m.opacity) * k;
        m.transparent = m.opacity < 0.995;
        m.depthWrite = m.opacity > 0.55;
        if (u.screen) return;
        m.emissive.setHex(u.tEm);
        const ei = p === this.sel ? 0.17 + 0.12 * Math.sin(this.T * 3.2) : u.tEi;
        m.emissiveIntensity += (ei - m.emissiveIntensity) * k;
      });
    });
  }

  /* ---------------- camera ---------------- */

  private fitDist(r: number, frac: number) {
    const px = frac * Math.min(this.FA.R - this.FA.L, this.FA.B - this.FA.T);
    const t = Math.tan((this.camera.fov * Math.PI) / 360);
    return (r * this.container.clientHeight) / (2 * t * Math.max(px, 60));
  }
  private placeAt(at: number) {
    this.parts.forEach((p) => p.group.position.copy(p.base).addScaledVector(p.off, at));
    const lr = this.lidRig;
    if (lr) lr.g.position.copy(lr.base).addScaledVector(lr.off, at);
  }
  private measure(at: number) {
    if (!this.root) return;
    this.placeAt(at);
    this.root.updateMatrixWorld(true);
    const sp = new THREE.Box3().setFromObject(this.root).getBoundingSphere(new THREE.Sphere());
    this.modelC.copy(sp.center);
    this.modelR = sp.radius * (at > 0 ? 0.88 : 1);
    this.placeAt(this.explodeCur);
    this.root.updateMatrixWorld(true);
  }
  private flyTo(pos: THREE.Vector3, target: THREE.Vector3) {
    this.fly = { pos, target };
  }
  private flyHome(instant = false) {
    const d = DEV[this.cur];
    const dir = new THREE.Vector3(...d.cam).sub(new THREE.Vector3(...d.target)).normalize();
    const pos = this.modelC.clone().add(dir.multiplyScalar(this.fitDist(this.modelR, 0.5)));
    if (instant) {
      this.camera.position.copy(pos);
      this.controls.target.copy(this.modelC);
      this.fly = null;
      this.controls.update();
    } else this.flyTo(pos, this.modelC.clone());
  }
  private partCenter(p: Part) {
    const c = new THREE.Box3().setFromObject(p.group).getCenter(new THREE.Vector3());
    p.group.parent!.getWorldQuaternion(tmpQ);
    return c.add(p.off.clone().applyQuaternion(tmpQ).multiplyScalar(this.explodeT - this.explodeCur));
  }
  private flyPart(p: Part) {
    const sp = new THREE.Box3().setFromObject(p.group).getBoundingSphere(new THREE.Sphere());
    const c = this.partCenter(p);
    const dir = this.camera.position.clone().sub(this.controls.target).normalize();
    this.flyTo(c.clone().add(dir.multiplyScalar(Math.max(this.fitDist(Math.max(sp.radius, 0.35), 0.42), 0.5))), c);
  }
  private flyDie(p: Part) {
    const d = p.die!;
    d.updateMatrixWorld();
    const c = d.getWorldPosition(new THREE.Vector3());
    d.getWorldQuaternion(tmpQ);
    const n = new THREE.Vector3(0, 0, 1).applyQuaternion(tmpQ);
    p.group.parent!.getWorldQuaternion(tmpQ);
    c.add(p.off.clone().applyQuaternion(tmpQ).multiplyScalar(this.explodeT - this.explodeCur));
    const side = this.camera.position.clone().sub(this.controls.target).projectOnPlane(n).normalize();
    const size = (d.geometry as THREE.PlaneGeometry).parameters.width;
    this.flyTo(c.clone().add(n.multiplyScalar(0.92).add(side.multiplyScalar(0.4)).normalize().multiplyScalar(this.fitDist(size * 0.72, 0.42))), c);
  }
  private resize() {
    const W = this.container.clientWidth, H = this.container.clientHeight;
    if (!W || !H) return;
    this.renderer.setSize(W, H);
    this.camera.aspect = W / H;
    const { L, R, T, B } = this.FA;
    const dx = (L + R) / 2 - W / 2, dy = (T + B) / 2 - H / 2;
    this.camera.setViewOffset(W, H, -dx, -dy, W, H);
    this.camera.updateProjectionMatrix();
  }

  /* ---------------- picking ---------------- */

  private pick(e: PointerEvent): Part | null {
    if (!this.root) return null;
    const r = this.renderer.domElement.getBoundingClientRect();
    const ptr = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(ptr, this.camera);
    for (const h of this.raycaster.intersectObjects(this.root.children, true)) {
      if (h.point.x > this.cutX + 1e-3 || !h.object.visible || h.object.userData.noPick) continue;
      let o: THREE.Object3D | null = h.object;
      while (o && !o.userData.partId) o = o.parent;
      if (!o) continue;
      const p = this.byId[o.userData.partId];
      if (!p.group.visible) continue;
      if (this.sel && p !== this.sel && (this.level === 2 || p.shell)) continue;
      return p;
    }
    return null;
  }
  private onDown = (e: PointerEvent) => {
    this.down = [e.clientX, e.clientY];
  };
  private onUp = (e: PointerEvent) => {
    if (this.down && Math.hypot(e.clientX - this.down[0], e.clientY - this.down[1]) < 6) {
      const p = this.pick(e);
      this.cb.onPick(p && p === this.sel ? null : p?.id ?? null);
    }
    this.down = null;
  };
  private onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    const p = this.pick(e);
    if (p !== this.hover) {
      this.hover = p;
      this.setTargets();
    }
    this.renderer.domElement.style.cursor = p ? 'pointer' : 'grab';
    this.cb.onHover(p?.id ?? null, e.clientX, e.clientY);
  };
  private onLeave = () => {
    if (this.hover) {
      this.hover = null;
      this.setTargets();
    }
    this.cb.onHover(null, 0, 0);
  };

  /* ---------------- labels ---------------- */

  private placeLabels() {
    if (!this.labels.length) return;
    const W = this.container.clientWidth, H = this.container.clientHeight;
    const placed: { x: number; y: number; w: number; h: number }[] = [];
    const items = this.labels
      .map((o) => {
        const { p, el } = o;
        if (!p.lc) {
          const b = new THREE.Box3().setFromObject(p.group), gp = p.group.getWorldPosition(new THREE.Vector3());
          p.lc = b.getCenter(new THREE.Vector3()).sub(gp);
          p.lc.y = b.max.y - gp.y;
        }
        p.group.getWorldPosition(tmpV).add(p.lc);
        const hidden = tmpV.x > this.cutX || !p.group.visible || (this.sel && p !== this.sel && this.level > 0);
        tmpV.project(this.camera);
        if (hidden || tmpV.z > 1) {
          el.style.opacity = '0';
          return null;
        }
        if (!o.w) { o.w = el.offsetWidth; o.h = el.offsetHeight; }
        return { o, x: (tmpV.x * 0.5 + 0.5) * W, y: (-tmpV.y * 0.5 + 0.5) * H, pri: p === this.sel ? 0 : 1 };
      })
      .filter((v): v is NonNullable<typeof v> => !!v)
      .sort((a, b) => a.pri - b.pri || a.y - b.y);
    const minY = this.FA.T + 6, maxY = this.FA.B;
    items.forEach((it) => {
      const { o } = it, w = o.w!, h = o.h!, x = it.x, base = it.y - 14 - h;
      let y: number | null = null;
      for (let k = 0; k < 16 && y === null; k++) {
        const cy = base + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (h + 4);
        if (cy < minY || cy + h > maxY) continue;
        if (!placed.some((r) => Math.abs(r.x - x) < (r.w + w) / 2 + 4 && Math.abs(r.y - cy) < (r.h + h) / 2 + 3)) y = cy;
      }
      if (y === null) {
        o.el.style.opacity = '0';
        return;
      }
      placed.push({ x, y, w, h });
      o.el.style.setProperty('--stem', Math.max(0, it.y - (y + h)) + 'px');
      o.el.style.opacity = this.sel && o.p !== this.sel ? '0.5' : '1';
      o.el.style.transform = `translate(${x - w / 2}px,${y}px)`;
    });
  }

  /* ---------------- loop ---------------- */

  private emitStatus() {
    const s = screenState;
    let st: Status;
    if (!this.playing) st = { kind: 'paused' };
    else if (this.cur === 'music-player') st = s.phase === 'spin' ? { kind: 'player-spin', pct: Math.min(100, Math.round((s.phaseT / 4) * 100)) } : { kind: 'player-play' };
    else st = { kind: this.cur === 'retro-laptop' ? 'retro' : 'modern' };
    this.cb.onStatus(st);
  }

  private tick = (now?: number) => {
    this.raf = requestAnimationFrame(this.tick);
    this.timer.update(now);
    const dt = Math.min(this.timer.getDelta(), 0.05), ds = this.playing ? dt * this.speed : 0;
    this.T += dt;
    if (this.container.clientWidth !== this.renderer.domElement.clientWidth || this.container.clientHeight !== this.renderer.domElement.clientHeight) this.resize();
    if (!this.root) return;

    this.explodeCur += (this.explodeT - this.explodeCur) * Math.min(1, dt * 6);
    this.placeAt(this.explodeCur);

    this.cutCur += (this.cutT - this.cutCur) * Math.min(1, dt * 5);
    const d = DEV[this.cur], R = d.cut;
    this.cutX = -R + this.cutCur * 2 * R + (this.cutCur > 0.999 ? 99 : 0);
    clip.constant = this.cutX;
    this.cutVis.visible = this.cutCur < 0.995;
    this.cutVis.position.set(this.cutX, d.cv.c[0], d.cv.c[1]);
    this.cutVis.scale.set(d.cv.s[0], d.cv.s[1], 1);

    this.spinners.forEach((s) => { if (!s.when || s.when()) s.obj.rotation[s.axis] += s.speed * ds; });
    const ss = screenState;
    if (this.cur === 'music-player' && ds > 0) {
      ss.phaseT += ds;
      const was = ss.phase;
      if (ss.phase === 'spin' && ss.phaseT > 4) ss.phase = 'play';
      if (ss.phaseT > 14) { ss.phase = 'spin'; ss.phaseT = 0; }
      this.scrT += dt;
      if (this.scrT > 0.12 || was !== ss.phase) {
        this.scrT = 0;
        this.screens.forEach(drawScreen);
      }
    }
    this.statusT += dt;
    if (this.statusT > 0.25) { this.statusT = 0; this.emitStatus(); }

    this.animLooks(dt);
    this.flowT += ds;
    this.flowFx?.update(this.flowT, !!this.sel && this.cur === 'modern-laptop' && COOLING_PARTS.includes(this.sel.id));

    if (this.fly) {
      const k = Math.min(1, dt * 3.2);
      this.camera.position.lerp(this.fly.pos, k);
      this.controls.target.lerp(this.fly.target, k);
      if (this.camera.position.distanceTo(this.fly.pos) < 0.004 && this.controls.target.distanceTo(this.fly.target) < 0.004) this.fly = null;
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.placeLabels();
  };
}
