import { useEffect, useRef } from 'react';
import { ANA } from '../data/analogies';
import { DEV } from '../data/devices';
import { TXT } from '../data/parts';
import { UI } from '../data/ui';
import { partName } from '../data/text';
import { partColor, partOrder } from '../engine/Engine';
import { useStore } from '../store/useStore';
import { Chevron } from './icons';

export function PartsPanel() {
  const { lang, device, mode, selected, panelMin, select, hoverPart, togglePanel } = useStore();
  const d = DEV[device], U = UI[lang], an = mode === 'analogy';
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selected) return;
    const t = setTimeout(() => listRef.current?.querySelector('.ar.open')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 320);
    return () => clearTimeout(t);
  }, [selected]);

  return (
    <section id="panel" className={`panel${panelMin ? ' min' : ''}`} aria-live="polite">
      <div className="ph">
        <div>
          <div className="eb">{d.group[lang]}</div>
          <h1>{d.name[lang]}</h1>
        </div>
        <button className="cbtn" onClick={togglePanel} aria-label={panelMin ? 'Expand' : 'Collapse'} aria-expanded={!panelMin}>
          <Chevron dir="up" />
        </button>
      </div>
      <div className="pbody" ref={listRef}>
        <p className="intro">{an ? ANA[device].intro[lang] : d.intro[lang]}</p>
        <div className="tipcard">
          <b>💡 {U.dyk}</b>
          {d.tip[lang]}
        </div>
        <h3>{an ? U.inAna : U.inModel}</h3>
        <div className="acc">
          {partOrder(device).map((id) => {
            const [name, desc] = partName(device, id, mode, lang);
            const open = selected === id;
            return (
              <div key={id} className={`ar${open ? ' open' : ''}`}>
                <button
                  className="rh"
                  aria-expanded={open}
                  onClick={() => select(open ? null : id)}
                  onMouseEnter={() => hoverPart(id)}
                  onMouseLeave={() => hoverPart(null)}
                >
                  <i style={{ background: partColor(device, id) }} />
                  <span>{name}</span>
                  <Chevron />
                </button>
                <div className="rd">
                  <div>
                    <p>{desc}</p>
                    {an ? (
                      <span className="x m">{U.realPart}: {TXT[device][id][lang][0]}</span>
                    ) : (
                      <span className="x">{U.anaIs}: {ANA[device].p[id][lang][0]}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
