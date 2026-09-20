---
paths:
  - "**/*.{tsx,jsx,vue,svelte,astro,html,css,scss}"
---
# Frontend rules

- Load the `frontend-design` skill before writing or restyling UI. Tokens, type and spacing come from `brain/03_DESIGN.md`. Do not invent colours or fonts.
- The mockups in `design/mockups/` are the target. Match them. Do not add sections or "improve" them.
- If `design/brand_assets/` has a logo, palette or images, use them. No placeholder where a real asset exists.
- Every screen ships with loading, empty, and error states, and works at 375, 768 and 1440 px.
- Every clickable element has hover, focus-visible and active states. Keyboard focus is always visible.
- Animate only `transform` and `opacity`. Never `transition: all`. Respect `prefers-reduced-motion`. One orchestrated motion moment per page at most.
- Verify visually with `workflows/10_visual-qa.md`: `node tools/visual-diff.mjs` must pass for every screen you touched, at every viewport. Name differences in pixels or hex, fix from the tokens, run again. Never raise a threshold to pass. The owner is never asked for a screenshot.
- Mark regions whose content changes between runs with `data-dynamic` so they can be masked.
- Copy is part of the design. Buttons say what happens ("Save changes"). Errors say what went wrong and how to fix it.
