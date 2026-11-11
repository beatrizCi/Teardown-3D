export type Lang = 'en' | 'pt';
export type DeviceId = 'retro-laptop' | 'modern-laptop' | 'music-player';
export type Mode = 'model' | 'analogy';

/** Text in both languages. */
export type Bi = Record<Lang, string>;
/** [name, description] in both languages. */
export type PartText = Record<Lang, [string, string]>;

export interface AnalogySet {
  intro: Bi;
  p: Record<string, PartText>;
}

export interface ScaleLevel {
  /** Display value, e.g. "33 cm". */
  v: string;
  /** Part to focus on at this level. */
  part?: string;
  /** Zoom onto the part's chip die. */
  chip?: boolean;
}

export interface DeviceMeta {
  group: Bi;
  name: Bi;
  tile: Bi;
  intro: Bi;
  tip: Bi;
  levels: ScaleLevel[];
  /** Default camera position and look-at target (world units). */
  cam: [number, number, number];
  target: [number, number, number];
  /** Floor height for the contact shadow. */
  floor: number;
  /** Half-range of the cutaway plane along X. */
  cut: number;
  /** Size and centre of the cutaway plane helper. */
  cv: { s: [number, number]; c: [number, number] };
}

export interface DeviceGroup {
  id: string;
  name: Bi;
  items: DeviceId[];
}
