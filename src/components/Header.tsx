import { useStore } from '../store/useStore';
import type { Lang } from '../data/types';
import { Logo } from './icons';

export function Header() {
  const lang = useStore((s) => s.lang);
  const setLang = useStore((s) => s.setLang);
  return (
    <header className="header">
      <div className="brand">
        <Logo />
        Teardown 3D
      </div>
      <select className="langsel" aria-label="Language" value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
        <option value="en">English</option>
        <option value="pt">Português</option>
      </select>
    </header>
  );
}
