// Canvas-drawn screen contents for each device (boot screen, desktop, music player LCD).
import * as THREE from 'three';
import { screenState as S, type Screen, type ScreenKind } from './kit';

const SZ: Record<ScreenKind, [number, number]> = { retro: [512, 326], modern: [512, 310], player: [320, 252] };
const MONO = '"JetBrains Mono",ui-monospace,monospace';

function rrect(x: CanvasRenderingContext2D, X: number, Y: number, w: number, h: number, r: number) {
  x.beginPath();
  x.moveTo(X + r, Y);
  x.arcTo(X + w, Y, X + w, Y + h, r);
  x.arcTo(X + w, Y + h, X, Y + h, r);
  x.arcTo(X, Y + h, X, Y, r);
  x.arcTo(X, Y, X + w, Y, r);
  x.closePath();
}

const DRAW: Record<ScreenKind, (x: CanvasRenderingContext2D, w: number, h: number) => void> = {
  retro(x, _w, h) {
    x.fillStyle = '#0a1a7a';
    x.fillRect(0, 0, 512, h);
    x.font = `bold 18px ${MONO}`;
    const P = S.lang === 'pt';
    const lines = P
      ? ['SISTEMA PORTÁTIL v4.0', '', 'Teste de memória: 131072K OK', 'CPU ............ 400 MHz', 'Disco 0 ......... 12 GB', 'CD-ROM .......... pronto', 'Tela ............ 1024×768', '', 'Iniciando…']
      : ['PORTABLE SYSTEM v4.0', '', 'Memory test: 131072K OK', 'CPU ............ 400 MHz', 'Disk 0 ......... 12 GB', 'CD-ROM ......... ready', 'Display ........ 1024×768', '', 'Booting…'];
    lines.forEach((s, i) => {
      x.fillStyle = i === 0 ? '#ffd479' : '#d7dcff';
      x.fillText(s, 28, 40 + i * 30);
    });
    x.fillStyle = '#d7dcff';
    x.fillRect(150, h - 56, 10, 22);
  },
  modern(x, w, h) {
    const g = x.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#1b1f4a');
    g.addColorStop(0.6, '#7a3a7a');
    g.addColorStop(1, '#ff8a5c');
    x.fillStyle = g;
    x.fillRect(0, 0, w, h);
    x.globalAlpha = 0.22;
    for (let i = 0; i < 4; i++) {
      x.beginPath();
      x.moveTo(0, h * 0.62 + i * 18);
      x.bezierCurveTo(w * 0.3, h * 0.42 + i * 26, w * 0.62, h * 0.92 - i * 10, w, h * 0.56 + i * 14);
      x.lineTo(w, h);
      x.lineTo(0, h);
      x.fillStyle = '#ffd1a8';
      x.fill();
    }
    x.globalAlpha = 1;
    rrect(x, 60, 46, 300, 180, 12);
    x.fillStyle = 'rgba(12,14,22,.92)';
    x.fill();
    x.fillStyle = '#8a97ad';
    x.font = `12px ${MONO}`;
    x.fillText('explore.ts', 78, 70);
    const L: [string, string][][] = [
      [['const ', '#c792ea'], ['parts = laptop.', '#e8edf6'], ['explode', '#82aaff'], ['()', '#e8edf6']],
      [['for ', '#c792ea'], ['(const p of parts) {', '#e8edf6']],
      [['  p.', '#e8edf6'], ['learn', '#82aaff'], ['()', '#e8edf6']],
      [['}', '#e8edf6']],
      [['// ', '#5c6a82'], [S.lang === 'pt' ? 'aprenda vendo' : 'learn by seeing', '#5c6a82']],
    ];
    x.font = `14px ${MONO}`;
    L.forEach((ln, i) => {
      let X = 78;
      ln.forEach(([t, c]) => {
        x.fillStyle = c;
        x.fillText(t, X, 100 + i * 24);
        X += x.measureText(t).width;
      });
    });
  },
  player(x, w, h) {
    const P = S.lang === 'pt', ink = '#13202b';
    x.fillStyle = '#b8d0e4';
    x.fillRect(0, 0, w, h);
    x.fillStyle = ink;
    x.fillRect(0, 0, w, 34);
    x.fillStyle = '#b8d0e4';
    x.font = `bold 17px ${MONO}`;
    x.fillText(S.phase === 'spin' ? (P ? 'Carregando…' : 'Buffering…') : P ? 'Tocando agora' : 'Now playing', 12, 23);
    x.strokeStyle = '#b8d0e4';
    x.lineWidth = 2;
    x.strokeRect(w - 44, 10, 28, 14);
    x.fillRect(w - 16, 14, 3, 6);
    x.fillRect(w - 41, 13, 18, 8);
    x.fillStyle = ink;
    if (S.phase === 'spin') {
      const pct = Math.min(100, (S.phaseT / 4) * 100);
      x.font = `15px ${MONO}`;
      x.fillText(P ? 'Lendo músicas' : 'Reading songs', 16, 90);
      x.fillText(P ? 'do disco para a RAM' : 'from disk into RAM', 16, 114);
      x.lineWidth = 2;
      x.strokeStyle = ink;
      x.strokeRect(16, 150, w - 32, 22);
      x.fillRect(19, 153, ((w - 38) * pct) / 100, 16);
      x.font = `bold 15px ${MONO}`;
      x.fillText(Math.round(pct) + '%', 16, 205);
    } else {
      x.font = `bold 22px ${MONO}`;
      x.fillText(P ? 'Faixa 07' : 'Track 07', 16, 74);
      x.font = `14px ${MONO}`;
      x.fillText(P ? 'Artista Demo' : 'Demo Artist', 16, 98);
      const t = performance.now() / 1000;
      for (let i = 0; i < 14; i++) {
        const v = 0.25 + 0.75 * Math.abs(Math.sin(t * 3.1 + i * 1.7) * Math.cos(t * 1.3 + i * 0.6));
        const bh = v * 70;
        x.fillRect(16 + i * 20, 190 - bh, 14, bh);
      }
      const pr = (S.phaseT - 4) / 10;
      x.fillRect(16, 214, (w - 32) * Math.min(1, pr), 6);
      x.strokeRect(16, 214, w - 32, 6);
    }
  },
};

export function drawScreen(s: Screen) {
  const [w, h] = SZ[s.kind];
  if (!s.tex) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    s.tex = new THREE.CanvasTexture(c);
    s.tex.colorSpace = THREE.SRGBColorSpace;
    s.tex.anisotropy = 4;
  }
  const c = s.tex.image as HTMLCanvasElement;
  const x = c.getContext('2d')!;
  x.clearRect(0, 0, w, h);
  DRAW[s.kind](x, w, h);
  s.tex.needsUpdate = true;
}

/** Turn screens on: the canvas becomes the emissive image. */
export function powerScreens(list: Screen[]) {
  list.forEach((s) => {
    const m = s.mat;
    drawScreen(s);
    m.map = s.tex;
    m.emissiveMap = s.tex;
    m.emissive.setHex(0xffffff);
    m.emissiveIntensity = 1;
    m.color.setHex(0);
    m.needsUpdate = true;
  });
}
