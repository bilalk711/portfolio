# Bilal Kazmi portfolio

A full-screen Next.js portfolio with live profile copy, a monochrome graphite portrait and interactive dimensional surroundings.

## Run

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000. For production, run `npm run build` and `npm start`.

## Profile content

Edit `content/profile.ts` to update the headline, biography, services, projects and email. The latest content is grounded in the supplied `Bilal_Kazmi_Senior_Full_Stack_AI_Engineer_Resume.pdf`: Senior Full Stack Engineer / AI Applications, 5+ years, production web applications and AI features. Four case studies cover CloneVoicePrompt, Dubicars Listing Flow, Receipt Scan API and an Internal Knowledge Assistant (from the JALTech experience section). Internal systems have no invented live links. Circuit artwork is a visual theme, not a professional title.

The headline, navigation, biography and buttons are real HTML text. The desktop fills the viewport without letterboxing. The image uses cover framing rather than stretching. Phones use a dedicated portrait crop and readable content flow.

## Interactions

- Five seconds of projected 3D traces, floating wireframe cubes and traveling electrical signals, followed by a radial reveal of the original portrait and staggered text entrances.
- Move the pointer during the intro to rotate the scene; click for an energy pulse. Skip is available immediately and works with the keyboard. Replay is available in scene controls and the footer.
- A lightning cursor responds to interactive elements and clicks, including inside modal dialogs. Touch devices and small windows retain their normal cursor behavior.
- Ambient signals continue at 30 fps around the portrait, with its face protected from persistent line overlays. Rendering pauses offscreen, in hidden tabs and with Motion off; reduced-motion preferences skip the intro.
- Four inline project case studies and a client contact section, with scroll reveals, card tilt, documented outcomes and technology tags. Explore my work scrolls to the projects.
- Pointer-driven scene parallax, circuit focus and illumination.
- Click the artwork for a local pulse.
- Use the scene controls, scroll wheel, or `+` / `-` keys for camera zoom.
- Drag the artwork while zoomed to pan. `0`, Escape or Reset view restores the camera.
- Adjust foreground/background focus with the depth-blur slider.
- Motion toggle and reduced-motion preference support.
- Browser fullscreen toggle; the page fills the viewport without it as well.
- Magnetic main actions, project card tilt, project filtering and keyboard-operated expertise tabs.
- Accessible About, Work and Expertise dialogs with backdrop blur, Escape dismissal and focus return.
- Contact links and email copying use `bilalkazmi0711@gmail.com`.
- Download the 4K background from the scene controls.

## Image assets and resolution

- `public/assets/portfolio-hero-v2-4k.png`: 3840 × 2160 lossless PNG export, plain cap, text-free monochrome 3D setting.
- `public/assets/portfolio-portrait-v2.png`: dedicated phone portrait crop.
- Optimized `.webp` versions of both images are used by the page (the desktop image is approximately 600 KB); the full PNG remains available as a 4K download.
- `output/imagegen/portfolio-v2-background-original.png`: original 1672 × 941 output from the built-in image generator.
- `output/imagegen/portfolio-v2-prompt.txt`: the exact generation prompt.

The built-in image tool returned a 1672 × 941 image despite the 4K prompt. The delivered UHD file is **upscaled with Lanczos3**, not natively generated at 4K. The original is preserved. Earlier v1 assets remain available for reference.

The portrait scene samples the image in WebGL. The electrical intro and ambient layer project actual 3D trace/cube coordinates through a perspective camera onto a canvas. The portrait and metallic raster surroundings remain an illustration, not separate 3D models. If WebGL is unavailable, the static background remains visible. The intro uses canvas independently, and a no-JavaScript fallback leaves the main text and links visible.

## Verification

```sh
npm run typecheck
npm run build
npm run verify:visual
```

`verify:visual` validates the UHD and optimized asset dimensions and builds visual comparisons from browser evidence. Current screenshots, asset metrics and comparisons are in `output/qa/v3/`. The desktop viewport is 1920 × 1080; content captures are 1904 pixels wide because the expanded page has a vertical scrollbar. The latest QA report is `design-qa.md`; previous reports are preserved in `output/qa/`.
