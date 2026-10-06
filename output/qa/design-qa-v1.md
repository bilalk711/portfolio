# Portfolio landing page — design QA

final result: passed

## Findings

No actionable P0/P1/P2 visual mismatches remain in the reference desktop state. The intentional change is removal of the cap embroidery, as requested. The original source composition, type, circuit artwork, portrait, and spacing are preserved using a lossless image plate with semantic HTML controls.

The image asset check found **0 changed pixels outside the cap repair**. Exactly 8,382 pixels changed within x=1184–1314, y=76–198. This establishes 100% source-pixel preservation outside the authorized edit; it does not claim byte equality for browser screenshots or interactive states.

## Source and capture evidence

- Original visual truth: `output/imagegen/portfolio-concept-20261005.png` — 1672 × 941 PNG.
- Cap-free visual truth: `public/assets/portfolio-hero.png` — 1672 × 941 PNG.
- Browser-rendered desktop capture: `output/qa/desktop-rest.jpg` — 1671 × 941 JPEG.
- Requested CSS viewport: 1672 × 941; browser reports DPR 1.0000000298. Stage measures 1672 × 941 CSS pixels, with fractional centering offset y=0.1667.
- State: route `/`, dialog closed, circuit canvas inactive, controls hidden, no hover or focus styling.
- Full-view comparison: `output/qa/desktop-comparison.png`, source left and browser right, opened together before this report.
- Focused comparisons: `output/qa/typography-comparison.png` and `output/qa/cap-comparison.png`, opened together with source left/browser right.
- Browser capture normalized horizontally from 1671 to 1672 pixels for comparison; no device frame or browser chrome is included.
- Capture limitation: the in-app browser emits a compressed JPEG with visible softness and rounds a fractional physical width. This compression is a capture artifact. The displayed image has no CSS blur/filter/transform in the reference state, and the served lossless PNG preserves the source pixels. A strict lossless pixel-difference assertion for the final browser framebuffer is unverified.

## Required fidelity surfaces

1. **Fonts and typography:** exact source lettering retained in the desktop art plate, including weight, line breaks, spacing, optical shape and antialiasing. Accessible headings and control names match the image. Supplemental dialogs and the phone layout use live sans-serif text. The desktop lettering is rasterized, so changing its visible copy requires updating the image.
2. **Spacing and layout:** entire 1672:941 composition is preserved without crop or stretching. Navigation and CTA interaction regions match their visible source locations. Other desktop aspect ratios letterbox the composition. Portrait phone layout checked at 390 × 844 with no horizontal overflow.
3. **Colors and tokens:** original monochrome artwork and palette retained; no colored accents introduced. Interaction panels use charcoal, white, and gray. The reference state's canvas and controls remain transparent/hidden.
4. **Image quality and fidelity:** supplied source art reused. Cap repair uses the built-in image tool and only its localized output is composited into the source. No CSS/SVG circuit approximations. Shader samples the real art for interactive depth, focus and illumination. Source copy stays lossless. Mobile uses a deliberate portrait crop rather than stretching the desktop frame.
5. **Copy and content:** original hero text, navigation and CTAs unchanged. Contact points to `bilalkazmi0711@gmail.com`. Work content describes the three themes present in the source rather than inventing projects, credentials or performance claims.

## Primary interactions checked in the in-app browser

- About opens a native dialog, applies backdrop blur, and receives focus on its close control.
- Escape closes the dialog and returns focus to the opener.
- Explore my work opens the Work panel. Work and Selected work share that action.
- Work tabs switch by click and left/right keyboard arrows, updating the associated panel and mail subject.
- Copy email displays success feedback, and the feedback resets after the panel has closed and reopened.
- Contact/Get in touch mail links have the correct supplied email. No email was sent during testing.
- Circuit pointer interaction activates the WebGL layer (`data-active=true`); the source remains visible when idle (`data-active=false`).
- Zoom changes from 100% to 120%; zoom out, reset and motion off/on operate. A magnified-circuit capture is saved in `output/qa/circuit-zoom.jpg`.
- Circuit controls are keyboard accessible and support `+`, `-`, `0`, and Escape. Reduced-motion behavior and fallback are implemented; the OS-level preference was not changed during QA.
- Mobile About/Work buttons and primary CTA operate, and the Work dialog remains within the 390 × 844 viewport. Evidence: `output/qa/mobile.jpg` and `output/qa/mobile-work.jpg`.
- Browser console error/warning inspection: no errors or warnings returned.

## Comparison / fix history

- Functional QA identified transient email-copy feedback persisting after closing the panel. The timer cleanup was separated from the dialog-dependent keyboard effect. Reopened Work panel verified the default copy button state.
- Mobile accessibility QA identified a duplicate hidden desktop heading. The desktop semantic copy is now hidden on mobile and the visible phone title is an h1. Post-fix browser accessibility snapshot confirms one main heading.
- Final desktop reference-state comparison showed no additional P0/P1/P2 visual findings. Screenshot capture softness is classified as a tool/density limitation rather than app styling drift.

## Implementation checklist

- [x] Cap text removed; original pixels preserved outside edit.
- [x] Next.js app runs locally and production build passes.
- [x] TypeScript check passes.
- [x] Source/browser full-view and focused comparisons opened.
- [x] Primary interactions and mobile overflow checked in-browser.
- [x] Browser console errors checked.
- [x] Preview left running.

## Follow-up polish / acceptance limits

- A true 100% framebuffer equality check requires a lossless capture at exact native density; this browser tool exports compressed captures. The asset itself is verified exact outside the cap edit.
- The reference defines a desktop state. The phone layout is a readable adaptation, and deliberate interactions change blur, lighting and focus while active.
- Actual project details can replace the themed Work panel once supplied.

final result: passed
