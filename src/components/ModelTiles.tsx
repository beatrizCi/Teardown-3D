import { DEV, GROUPS } from '../data/devices';
import { UI } from '../data/ui';
import { useStore } from '../store/useStore';

export function ModelTiles() {
  const { lang, device, thumbs, setDevice } = useStore();
  return (
    <nav id="tiles" className="tiles" aria-label="Models">
      {GROUPS.map((g) => (
        <div className="grp" key={g.id}>
          <h4>{g.name[lang]}</h4>
          <div className="row">
            {g.items.map((id) => (
              <button key={id} className="tile" aria-current={id === device} onClick={() => setDevice(id)}>
                {thumbs[id] ? <img alt="" src={thumbs[id]} /> : <span className="ph-img" />}
                <b>{DEV[id].tile[lang]}</b>
                <small>{UI[lang].analogy}</small>
              </button>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
