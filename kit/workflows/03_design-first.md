# 03 Design first

**Goal:** an approved visual direction, reference mockups that a browser can render, and a filled `brain/03_DESIGN.md`, before any feature code. The mockups are what makes "pixel perfect" checkable by a script instead of by the owner's eyes.
**Owner input needed:** brand assets if they have any, two or three products they like, and one pick between directions. That is the only design question they get.

1. Collect logo, colours, photos into `design/brand_assets/`. Ask for references and what they like about each. If they have none, propose a direction from the subject matter of the PRD, not a generic "modern, clean" default.
2. Load the `frontend-design` skill. Write its two-pass plan: palette as named hex values, typefaces and roles, layout concept with an ASCII wireframe, three principles. Check the plan against the skill's list of generated-looking defaults and revise. Say what you changed.
3. Pick the 3 to 5 screens that carry the product: usually landing or login, the main working screen, one form or detail screen, one empty state.
4. Show two genuinely different directions for the main screen, not two colours of one layout. Use, in order of preference:
   a. `/design <brief>` in Claude Code, which publishes a canvas of artboards and prints a link for the owner.
   b. Claude Design on claude.ai with the same brief.
   c. Static HTML mockups served on localhost.
   The owner picks one. Done with questions.
5. Build the reference mockups yourself: one self-contained HTML file per screen in `design/mockups/<screen>.html`, responsive, using the exact tokens you are about to write into DESIGN, with realistic content. Use the same sample data the app's seed data will use, so later comparisons are like for like. Look at each one in the browser at 375 and 1440 and refine until it matches the chosen direction.
6. Write `design/visual.json`:
   ```json
   {
     "baseUrl": "http://localhost:3000",
     "viewports": [375, 1440],
     "thresholds": { "design": 0.03, "regression": 0.002 },
     "screens": [
       { "name": "login", "path": "/login", "reference": "design/mockups/login.html" },
       { "name": "dashboard", "path": "/dashboard", "reference": "design/mockups/dashboard.html",
         "storageState": ".tmp/auth.json", "waitFor": "main", "mask": ["[data-dynamic]"] }
     ]
   }
   ```
   `mask` hides regions that legitimately differ (timestamps, avatars). `storageState` is a saved logged-in browser session for private screens; create it with a small Playwright login script against the local test user.
7. Derive `brain/03_DESIGN.md` from the mockups: exact tokens, scale, components with states, motion, voice. From here on these are the only source of visual values.
8. Motion: decide the one moment that earns animation, write it in DESIGN, choose CSS first and a motion library only if the design needs it (ADR).
9. Send the owner the mockups as a localhost link or screenshots you took, for information. Do not ask for a second approval unless they object.

**Exit check:** mockups render at both widths, `design/visual.json` lists every key screen, no colour or font in DESIGN.md is a framework default.
