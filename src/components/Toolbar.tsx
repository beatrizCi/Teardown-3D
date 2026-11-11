import type { CSSProperties } from 'react';
import { UI } from '../data/ui';
import { useStore } from '../store/useStore';
import { Explode, Focus, Pause, Play, Rotate, Scissors, Tag } from './icons';

const pct = (v: number) => ({ '--p': `${Math.round(v * 100)}%` }) as CSSProperties;

export function Toolbar() {
  const s = useStore();
  const U = UI[s.lang];
  return (
    <div id="bar" className="bar pill">
      <div className="play">
        <button className="ib" onClick={s.togglePlay} aria-label={s.playing ? U.pause : U.play} title={s.playing ? U.pause : U.play}>
          {s.playing ? <Pause /> : <Play />}
        </button>
        <button className="spd" onClick={s.cycleSpeed} aria-label="Speed">
          {s.speed === 0.5 ? '½' : s.speed}×
        </button>
      </div>
      <div className="sep" />
      <div className="seg" role="group">
        <button aria-pressed={s.mode === 'model'} onClick={() => s.setMode('model')}>{U.model}</button>
        <button aria-pressed={s.mode === 'analogy'} onClick={() => s.setMode('analogy')}>{U.analogy}</button>
      </div>
      <div className="sep" />
      <label className="ex">
        <Explode />
        <span>{U.explode}</span>
        <input type="range" min={0} max={100} value={Math.round(s.explode * 100)} style={pct(s.explode)} onChange={(e) => s.setExplode(+e.target.value / 100)} />
      </label>
      <div className="sep" />
      <button className="ib" aria-pressed={s.labelsOn} onClick={s.toggleLabels} title={U.labels} aria-label={U.labels}><Tag /></button>
      <button className="ib" aria-pressed={s.cutOn} onClick={s.toggleCut} title={U.cut} aria-label={U.cut}><Scissors /></button>
      <div className={`cutw${s.cutOn ? ' on' : ''}`}>
        <input type="range" min={0} max={100} value={Math.round(s.cut * 100)} style={pct(s.cut)} onChange={(e) => s.setCut(+e.target.value / 100)} aria-label={U.cut} tabIndex={s.cutOn ? 0 : -1} />
      </div>
      <button className="ib" aria-pressed={s.autoRotate} onClick={s.toggleAutoRotate} title={U.rotate} aria-label={U.rotate}><Rotate /></button>
      <button className="ib" onClick={s.resetView} title={U.fit} aria-label={U.fit}><Focus /></button>
    </div>
  );
}
