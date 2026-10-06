# Portfolio electrical introduction — design QA

final result: passed

The update retains the selected monochrome graphite portrait and full-viewport desktop composition, adds a five-second circuit reveal and matching cursor, and presents four projects grounded in the supplied resume. No actionable P0/P1/P2 findings remain after the fixes below.

## Source and comparison evidence

- Visual source: `public/assets/portfolio-hero-v2-4k.png` and the prior approved rendering, `output/qa/v2/desktop-1920.jpg`.
- Content source: `C:/Users/dell/Desktop/Bilal_Kazmi_Senior_Full_Stack_AI_Engineer_Resume.pdf`; both pages extracted. Three entries come from Selected Projects; Internal Knowledge Assistant comes from JALTech experience.
- Final desktop: `output/qa/v3/hero-final.jpg`, 1904 × 1080. CSS viewport 1920 × 1080; a vertical scrollbar accounts for the 16px content-width difference. Full-page capture was cropped to the first 1080 pixels; no UI was fabricated.
- Full-view combined input: `output/qa/v3/comparison.png`, prior rendering left / final implementation right. Reference normalized to 1904 × 1080; opened after fixes and reviewed together.
- Focused combined input: `output/qa/v3/portrait-comparison.png`, source artwork left / current portrait right; opened to review likeness, plain cap, graphite detail and circuit texture.
- Timeline: `circuits.jpg`, `reveal.jpg`, `final-intro-0.jpg` through `final-intro-2.jpg`, and `intro-storyboard.png`. Early frames show projected traces and traveling white signals before the portrait; transition frames show the portrait emerging through the light field.
- Projects: `projects-final.jpg` and `desktop-final-full.jpg`; all four entries visible. Internal systems are labeled and have no invented external links.
- Responsive: `compact-final.jpg` at 960 × 540 (944px content width), and `mobile-all-projects.jpg` at 390 × 844 (374px content width).
- Capture limitation: native viewport screenshots were truncated. Full-page captures and measured rectangles are canonical evidence. Intro storyboard frames resized only for presentation.

## Five fidelity surfaces

1. **Typography:** retained the large two-line sans-serif headline. Resume-based senior role and client-facing description are live HTML. Staggered entrances settle into readable text.
2. **Layout:** hero fills the desktop viewport. Compact header, hero and footer bounds are separated. Four project cards use two desktop columns and one phone column. No horizontal overflow in measured views.
3. **Color:** black, white and gray retained. Gray rules, dark cards, white actions and dark expertise pills preserve contrast and fit the theme.
4. **Images:** recognizable plain-cap portrait and sharp graphite detail retained. WebP loading assets remain 3840 × 2160 and 980 × 1196; downloadable PNG unchanged. Persistent light trails are clipped away from the face.
5. **Content:** Senior Full Stack Engineer / AI Applications, 5+ years, documented projects and outcomes. Approximately 82% GPU-cost reduction scoped to CloneVoicePrompt; receipt volume and Almarai review-time claims retain their resume context. No circuit-engineer title or invented metrics.

## Browser checks

- Natural intro completed at **5.01 seconds** of active animation time. Captures at 1.92s and 3.63s remained in the intro; 5.56s was ambient.
- Replay starts at the top with projected traces/cubes and disables underlying controls until complete. Pointer movement rotates the camera; clicks trigger pulses.
- Skip worked with click and Enter; early completion restored content immediately.
- Intro captions fade before the main actions appear. Final transition capture measured caption opacity 0 at 3.82s and automatic completion at 5.01s, avoiding overlapping labels.
- Explore my work navigates to the inline project section.
- Lightning cursor is visible over the scene and changes to a link state over controls. It portals inside dialogs and restores native behavior on small/touch layouts.
- Motion off pauses animation; zoom remains usable (100% → 110%, actual camera approximately 1.099). Motion on/reset restore defaults.
- Filters: All = 4, AI = 3, Web apps = 2. Escape closes the dialog and returns focus to Work.
- Both Get in touch links use the supplied email. Public project URLs match the resume; internal entries have no external link. No email sent.
- All four cards/contact visible on phone. Scroll reveals settle into visible content; no horizontal overflow at 390 × 844.
- Browser console error/warning collection returned no entries.
- TypeScript, production build and visual asset verification passed.
- Reduced-motion and no-JavaScript fallbacks inspected in code; OS preference not changed for this verification.

## Findings and repairs

- **[P2 fixed] Compact header overlap:** longer copy initially put hero top near 52px while header ended at 83px. Compact breakpoint now measures hero top approximately 112px / bottom 471px, header bottom 83px and footer top 507px at 960 × 540. Revised capture opened.
- **[P2 fixed] Expertise labels over bright foreground:** dark pills, restrained borders and brighter text now preserve readability. Final combined comparison reviewed after repair.
- **[P2 fixed] Hidden cursor in small desktop windows:** native cursor suppression restricted to large fine-pointer views; pointer handling restores native cursor for small windows/touch.
- Ambient geometry draws at 30 fps and pauses offscreen/in hidden tabs. The approximately 600 KB WebP loads the page while the 12 MB PNG remains downloadable.

## Limits

The portrait remains a raster illustration; animated 3D trace/cube coordinates are projected through a camera, without a new modeled head. The 4K PNG remains the previously disclosed upscaled export. External project reachability was not rechecked. Preview runs locally; no deployment performed.
