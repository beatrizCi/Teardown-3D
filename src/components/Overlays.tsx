import { useEffect, useRef } from 'react';
import { ORDER } from '../data/devices';
import { partName, statusText } from '../data/text';
import { partColor, partOrder } from '../engine/Engine';
import { useStore } from '../store/useStore';
import { Chevron } from './icons';

/** Live status chip, e.g. "Drive spinning · buffering 63%". */
export function StatusChip() {
  const { status, lang } = useStore();
  if (!status) return null;
  const busy = status.kind === 'retro' || status.kind === 'player-spin';
  return (
    <div className={`status pill${busy ? ' busy' : ''}`} role="status">
      <i />
      <span>{statusText(status, lang)}</span>
    </div>
  );
}

/** Previous / next model. */
export function NavArrows() {
  const { device, step } = useStore();
  const i = ORDER.indexOf(device);
  return (
    <>
      <button className="nav prev" disabled={i === 0} onClick={() => step(-1)} aria-label="Previous model"><Chevron dir="left" width={26} height={26} /></button>
      <button className="nav next" disabled={i === ORDER.length - 1} onClick={() => step(1)} aria-label="Next model"><Chevron width={26} height={26} /></button>
    </>
  );
}

/** Numbered floating labels. The engine positions them each frame via their DOM nodes. */
export function Labels() {
  const { engine, device, mode, lang, labelsOn } = useStore();
  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const ids = partOrder(device);

  useEffect(() => {
    if (!engine) return;
    engine.setLabels(labelsOn ? ids.map((id) => ({ id, el: refs.current[id]! })).filter((e) => e.el) : null);
  }, [engine, device, mode, lang, labelsOn]);

  if (!labelsOn) return null;
  return (
    <div className="labels" aria-hidden>
      {ids.map((id, i) => (
        <div key={device + id} className="lbl" ref={(el) => { refs.current[id] = el; }} style={{ opacity: 0 }}>
          <b style={{ background: partColor(device, id) }}>{i + 1}</b>
          {partName(device, id, mode, lang)[0]}
        </div>
      ))}
    </div>
  );
}

/** Tooltip that follows the pointer over the 3D model. */
export function Tooltip() {
  const { tip, device, mode, lang } = useStore();
  if (!tip) return <div className="tip" style={{ opacity: 0 }} />;
  return (
    <div className="tip" style={{ opacity: 1, left: tip.x + 16, top: tip.y + 16 }}>
      <i style={{ background: partColor(device, tip.id) }} />
      {partName(device, tip.id, mode, lang)[0]}
    </div>
  );
}
