# Teardown 3D

**Learn how portable tech works by taking it apart, in 3D, in your browser.**

Teardown 3D is an interactive learning site. Instead of reading about a laptop, you explode it into its parts, slice it open, zoom down to the chip, and watch heat flow from the CPU through the heat pipes and out of the fan.

Available in **English** and **Brazilian Portuguese**.

## Models

| Model | Highlights |
| --- | --- |
| **Retro laptop** (c. 1999) | Spinning hard disk and CD, swappable battery and RAM modules, fluorescent-tube backlight |
| **Modern laptop** (2020s) | 19 parts: full keyboard with legends, motherboard with traces and voltage regulators, M.2 SSD, RAM, Wi-Fi card with antenna cables, blower fan and copper heat pipes with an animated heat-flow path |
| **Pocket music player** (c. 2002) | Tiny hard drive that spins up, fills the RAM buffer and stops, shown live on the player's screen |

## Features

- **Explode** the model into layers and **cut it open** with a moving clipping plane
- **Click any part** for an explanation. The camera flies to it while everything else fades
- **Scale ladder**: jump from the whole device to a component, then to the chip's floor plan
- **Model / Analogy** toggle: every part re-explained as something familiar (a restaurant kitchen, a library)
- Numbered **floating labels** that avoid overlapping
- Live animations with **play / pause and speed**, plus a status line ("Drive spinning · buffering 63%")
- Responsive layout for desktop and mobile, accessible controls, `prefers-reduced-motion` support

## Tech stack

Frontend only, with no backend.

| Layer | Choice |
| --- | --- |
| UI | **React 19** + **TypeScript** (strict) |
| 3D | **Three.js** (WebGL): procedural geometry, PBR materials, clipping planes, instancing, canvas textures |
| State | **Zustand** |
| Build | **Vite** |
| Tests | **Vitest** (content integrity: every part has text in both languages, analogies match, scale levels point at real parts) |
| CI / hosting | **GitHub Actions** → **GitHub Pages** |

Every model is built in code (no downloaded 3D files), so the whole app is about 250 kB gzipped.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript only |
| `npm test` | Run the unit tests |

Requires Node 20 or newer.

## Deploying to GitHub Pages

1. Push this repository to GitHub (branch `main`).
2. In the repository go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Every push to `main` runs type-check, tests and build, then publishes the site to `https://<your-user>.github.io/<repo-name>/`.

Pull requests run the same checks without deploying. The build uses relative paths (`base: './'`), so it works under any repository name.

## Project structure

```
src/
├── App.tsx                 # Layout; measures the panels so the model is centred in the free space
├── components/             # React UI: header, model tiles, parts panel, scale ladder, toolbar, labels…
├── store/useStore.ts       # Zustand store: UI state + actions that drive the engine
├── data/                   # All copy (EN/PT): devices, parts, analogies, UI strings, types + tests
└── engine/
    ├── Engine.ts           # Three.js renderer, camera, animation loop, picking, labels, thumbnails
    ├── kit.ts              # Geometry/material helpers and the part system used by the builders
    ├── screens.ts          # Canvas-drawn screen contents (boot screen, desktop, music player LCD)
    └── builders/           # One file per device, building it from primitives
```

**How it fits together:** React owns the interface and the Zustand store. The 3D engine is a plain TypeScript class that React creates once. Store actions call the engine's small API (`load`, `select`, `setExplode`, `setCut`…), and the engine reports clicks, hovers and status back through callbacks. Floating labels are React elements that the engine moves every frame, so they never trigger React re-renders.

## Adding a new model

1. Add a builder in `src/engine/builders/` using the helpers in `kit.ts`. Each `part(parent, id, position, explodeOffset)` becomes a selectable part.
2. Register it in `BUILDERS` in `Engine.ts` and add its metadata to `src/data/devices.ts`.
3. Add the part texts to `parts.ts` and `analogies.ts`, in both languages.
4. Run `npm test`. It checks that every part is described and translated.
