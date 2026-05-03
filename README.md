# Portal Scene — Three.js Journey

Quick recap of the **Portal Scene** lesson from [Three.js Journey](https://threejsjourney.com/) by Bruno Simon, extended with Blender workflow for the environment asset.

## What this project covers

This project shows how to ship a stylized interior with a **single baked diffuse texture** for static geometry, **selective real-time materials** for hero elements (portal, emissive-style pole lights), and **particle fireflies** for atmosphere. It ties together asset compression, correct texture color space, custom GLSL, and a small debug UI.

- **Baked lighting workflow** where most of the scene is one `MeshBasicMaterial` + UV-mapped `baked.jpg` (no per-frame lights on the room).
- **Draco-compressed glTF** via `DRACOLoader` for smaller downloads and faster loads.
- **Custom portal shader** (`ShaderMaterial`) with time-based UV displacement, 3D Perlin noise, and gradient colors controlled from the CPU.
- **Points + custom shaders** for fireflies: instanced-like attributes (`aScale`), size in screen space, additive blending, and `uPixelRatio` updates on resize.
- **Named mesh targeting** after load (`getObjectByName`) to swap materials per object (baked mesh, pole lights, portal plane).
- **Debug panel** (`lil-gui`) for clear color, portal gradient colors, and firefly point size.

## What I built

- Set up a Three.js scene with `PerspectiveCamera`, damped `OrbitControls`, and `WebGLRenderer` with tuned pixel ratio.
- Integrated **Vite** with **`vite-plugin-glsl`** so vertex/fragment shaders and `#include` chunks load as ES modules.
- Loaded **`portal.glb`** with `GLTFLoader` + `DRACOLoader` (decoder in `public/draco/`).
- Applied **`baked.jpg`** to the `baked` mesh with `flipY = false` and **`SRGBColorSpace`** so colors match the bake.
- Assigned **`MeshBasicMaterial`** pole light colors to `poleLightA` and `poleLightB`.
- Replaced the portal mesh material with a **`ShaderMaterial`** wired to external GLSL and **Perlin noise** include.
- Spawned **`THREE.Points`** fireflies from buffer attributes (positions + per-point `aScale`) and a dedicated shader pair.
- Added **`lil-gui`** controls for renderer clear color, portal `uColorStart` / `uColorEnd`, and firefly size; animated `uTime` for portal and fireflies each frame.

## What I learned

### 1) Why baking fits static dioramas

- Moving lights and shadows every frame is expensive; baking diffuse (and often other channels) into a texture keeps the room cheap to render.
- `MeshBasicMaterial` + baked map is enough when lighting does not need to change at runtime.
- Correct **gamma / color space** settings matter so the baked image does not look washed out or too dark in the browser.

### 2) How to pair Blender with Three.js

- **Modeling** the scene in Blender first defines scale, naming (`baked`, `poleLightA`, `portalLight`, …), and which meshes get separate materials in code.
- **UV unwrapping** determines how the bake maps onto geometry: clean islands and sensible texel density avoid stretched or blurry areas.
- **Texture baking** captures lighting and base color into an image I can export once and reuse in Three.js without replicating the whole lighting rig on the web.

### 3) How Draco fits into the pipeline

- Compressing meshes reduces payload size for the same visual mesh data.
- The loader needs a **decoder path** and must stay in sync with the Three.js / Draco versions used in the build.

### 4) How custom shaders bring the portal to life

- **Varying UVs** plus **time uniforms** make organic motion without touching geometry.
- **Noise** (here 3D Perlin) breaks up patterns so the portal feels less like a flat gradient.
- **Double-sided** rendering and careful strength shaping control the silhouette and “outer glow” read.

### 5) How points and blending sell small VFX

- **Additive** blending and **transparent** materials with **`depthWrite: false`** help particles glow without harsh sorting artifacts in simple scenes.
- **Pixel ratio** in size-related uniforms keeps point sprites from shrinking or blowing up when the user changes display density or resizes the window.

### 6) How to keep the JavaScript side maintainable

- **One traverse or explicit `getObjectByName`** assignments are easier to reason about than magic indices in `children[]`.
- **Central tick** updates all time-based uniforms once per frame so shaders stay in sync with `Clock` elapsed time.

## Run the project

```bash
npm install
npm run dev
```

## Credits

Part of the **Three.js Journey** course by Bruno Simon.
