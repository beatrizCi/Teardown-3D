import { useEffect, useRef } from 'react';
import { Engine } from '../engine/Engine';
import { useStore } from '../store/useStore';

/** Mounts the Three.js engine and wires its callbacks into the store. */
export function Viewport() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const st = useStore.getState;
    const engine = new Engine(ref.current!, {
      onPick: (id) => st().select(id),
      onHover: (id, x, y) => st().setTip(id ? { id, x, y } : null),
      onStatus: (s) => st().setStatus(s),
    });
    st().setEngine(engine);
    return () => {
      st().setEngine(null);
      engine.dispose();
    };
  }, []);
  return <div ref={ref} className="stage" aria-label="Interactive 3D model" />;
}
