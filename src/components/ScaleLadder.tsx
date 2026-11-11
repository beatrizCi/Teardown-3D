import { DEV } from '../data/devices';
import { UI } from '../data/ui';
import { useStore } from '../store/useStore';

export function ScaleLadder() {
  const { lang, device, level, goLevel } = useStore();
  return (
    <aside id="ladder" className="ladder" aria-label="Scale">
      {DEV[device].levels.map((l, i) => (
        <button key={i} className={`lv${i === level ? ' on' : ''}`} onClick={() => goLevel(i)} aria-pressed={i === level}>
          <i />
          <div>
            <b>{l.v}</b>
            <span>{UI[lang].lv[i]}</span>
          </div>
        </button>
      ))}
    </aside>
  );
}
