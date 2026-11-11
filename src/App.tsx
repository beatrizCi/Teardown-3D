import { useEffect, useLayoutEffect } from 'react';
import { Header } from './components/Header';
import { ModelTiles } from './components/ModelTiles';
import { PartsPanel } from './components/PartsPanel';
import { ScaleLadder } from './components/ScaleLadder';
import { Toolbar } from './components/Toolbar';
import { Labels, NavArrows, StatusChip, Tooltip } from './components/Overlays';
import { Viewport } from './components/Viewport';
import { Engine } from './engine/Engine';
import { useStore } from './store/useStore';

const MOBILE = 860;

/** Measure the panels and tell the engine which part of the screen the model can use. */
function useFreeArea() {
  const panelMin = useStore((s) => s.panelMin);
  const engine = useStore((s) => s.engine);
  const lang = useStore((s) => s.lang);
  const device = useStore((s) => s.device);

  useLayoutEffect(() => {
    const root = document.documentElement.style;
    const $ = (id: string) => document.getElementById(id)!;
    const compute = () => {
      const W = window.innerWidth, mob = W < MOBILE;
      const top = $('tiles').getBoundingClientRect().bottom;
      root.setProperty('--top', `${top}px`);
      let L = 0, R = W;
      if (!mob) {
        L = $('panel').getBoundingClientRect().right + 12;
        R = $('ladder').getBoundingClientRect().left - 12;
        root.setProperty('--cx', `${(L + R) / 2}px`);
      } else root.setProperty('--cx', '50%');
      const bar = $('bar').getBoundingClientRect();
      root.setProperty('--tb', `${bar.height + 20}px`);
      let B = bar.top - 16;
      const T = top + (mob ? 0 : 56);
      if (mob) B = $('panel').getBoundingClientRect().top - 8;
      engine?.setFreeArea({ left: L, right: R, top: T, bottom: Math.max(B, T + 120) });
    };
    compute();
    const ro = new ResizeObserver(compute);
    ['panel', 'bar', 'tiles', 'ladder'].forEach((id) => ro.observe($(id)));
    window.addEventListener('resize', compute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, [engine, panelMin, lang, device]);
}

export default function App() {
  const setThumbs = useStore((s) => s.setThumbs);
  const lang = useStore((s) => s.lang);
  useFreeArea();

  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
  }, [lang]);

  useEffect(() => {
    // Render the tile thumbnails once, after first paint.
    const id = requestAnimationFrame(() => setThumbs(Engine.thumbnails()));
    return () => cancelAnimationFrame(id);
  }, [setThumbs]);

  return (
    <>
      <Viewport />
      <Labels />
      <Header />
      <ModelTiles />
      <PartsPanel />
      <ScaleLadder />
      <StatusChip />
      <Toolbar />
      <NavArrows />
      <Tooltip />
    </>
  );
}
