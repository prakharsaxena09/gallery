# 📋 Handoff — Prakhar ❤️ Pranjali Roka Invite

A complete handover for anyone taking over this digital Roka invite — whether to
customize it, deploy it, or maintain it. No prior context needed.

- **What it is:** a self-contained, mobile-first web invitation (one shareable link, no app install).
- **Where it lives:** the `roka/` folder of the `prakharsaxena09/gallery` repo.
- **Branch:** `claude/prakhar-pranjali-roka-invite-ity4f6`
- **Tech:** plain HTML + CSS + vanilla JavaScript. **No build step, no frameworks, no npm.**
- **Event:** Roka • Friday, 27 November 2026 • 6:00 PM onwards • Rooftop, ITC Fortune, Lucknow.

---

## 1. Status at handoff

| Area | Status |
|---|---|
| Core experience (unwrap, hero, greeting, story, families, jigsaw, details, RSVP) | ✅ Built & browser-verified |
| 4 switchable themes | ✅ Working (Rooftop default) |
| Personalized greeting via `?to=` | ✅ Working |
| Countdown / Add-to-Calendar / Maps | ✅ Working |
| WhatsApp RSVP number | ⚠️ **Placeholder** `919999999999` — must be replaced |
| Couple photo | ⚠️ **Placeholder** SVG — replace with real square photo |
| Background music | ⚠️ **Not included** — add a royalty-free track (optional) |
| Hosting / public link | ⚠️ **Not yet enabled** — see §5 |

The three ⚠️ items are the only things standing between "demo" and "send to relatives."

---

## 2. File map

```
roka/
├── index.html                     # Page structure — all 9 sections
├── css/
│   └── styles.css                 # Theming (CSS variables) + animations + responsive
├── js/
│   ├── main.js                    # ⭐ CONFIG block + all behavior (start here)
│   └── puzzle.js                  # Self-contained 3×3 jigsaw engine
├── assets/
│   ├── img/
│   │   ├── couple-placeholder.svg # Swap with real photo
│   │   └── favicon.svg
│   └── audio/
│       └── README.txt             # Where/how to add music
├── README.md                      # User-facing quick guide
└── HANDOFF.md                     # This document
```

Plus repo-root `.nojekyll` (lets GitHub Pages serve the files as-is).

---

## 3. The ONE file you edit: `js/main.js` → `CONFIG`

Everything customizable is in the `CONFIG` object at the very top of `js/main.js`:

```js
var CONFIG = {
  rsvpWhatsApp: "919999999999",                 // ← your WhatsApp number, digits only
  coupleImage:  "assets/img/couple-placeholder.svg", // ← your square photo
  musicSrc:     "assets/audio/romantic.mp3",     // ← your music file
  event: {
    title:    "Roka — Prakhar & Pranjali",
    startISO: "2026-11-27T18:00:00+05:30",       // 6 PM IST
    endISO:   "2026-11-27T22:00:00+05:30",
    location: "Rooftop, ITC Fortune, Lucknow, Uttar Pradesh",
    mapsQuery:"ITC Fortune Lucknow"
  },
  defaultTheme: "theme-rooftop"                  // rooftop | nawabi | pastel | retro
};
```

No other file needs editing for normal customization.

### To-do checklist for the owner
1. Replace `rsvpWhatsApp` with the real number (intl format, no `+`/spaces — e.g. `919876543210`).
2. Add a **square** couple photo (≈800×800) to `assets/img/`, point `coupleImage` to it.
3. (Optional) Add `assets/audio/romantic.mp3` — use a **royalty-free** track so WhatsApp doesn't mute it.
4. Pick `defaultTheme`.
5. Generate personalized links (see §4).

---

## 4. Personalized greeting links (the "aww" feature)

Append `?to=<name>` to the link — the greeting then reads *"Dear &lt;name&gt;, aap toh
humare apne ho…"*. Use `%20` for spaces. No param → a warm default shows.

```
https://<your-link>/?to=Chachu%20Chachi
https://<your-link>/?to=Mausi%20ji
https://<your-link>/?to=Rohan%20Bhaiya
```

Keep a simple sheet mapping each relative → their personalized link before broadcasting.
(Logic: `URLSearchParams.get('to')` in `js/main.js`, sanitized, 40-char cap.)

---

## 5. Deploy / get a public link

It's static files — host anywhere. Pick one:

### A) GitHub Pages (this repo, persistent) — recommended
1. Go to **Settings → Pages** of `prakharsaxena09/gallery`.
2. Source: **Deploy from a branch** → Branch `claude/prakhar-pranjali-roka-invite-ity4f6`, folder `/ (root)` → **Save**.
3. After ~1–2 min, the invite is at:
   `https://prakharsaxena09.github.io/gallery/roka/`
   (The repo-root `.nojekyll` ensures it serves correctly.)

### B) Netlify / Vercel (instant, no GitHub settings)
- Drag-and-drop the `roka/` folder at **app.netlify.com/drop**, or import the repo on Vercel.

### C) Firebase Hosting
- Use a **separate, your-own** Firebase project: `firebase init hosting` with `public: roka`, then `firebase deploy`.
- ⚠️ Do **not** deploy onto the Flutter Gallery's existing Firebase project in this repo.

> Paths in `index.html` are all relative, so the invite works at any base URL (root or `/gallery/roka/`).

---

## 6. Run & test locally

```bash
cd roka
python3 -m http.server 8000
# open http://localhost:8000   (and http://localhost:8000/?to=Test%20Name)
```

Manual smoke test:
- [ ] Tap "unwrap" → invite reveals (music starts if a track is present)
- [ ] `?to=` name shows in greeting
- [ ] 🎨 button cycles all 4 themes; choice persists on reload
- [ ] Jigsaw: drag tiles to solve (or "Skip") → event details unveil
- [ ] Countdown ticks; "Add to Calendar" downloads `.ics`; "Get Directions" opens Maps
- [ ] RSVP opens WhatsApp with the right number; Share works
- [ ] Looks good at 360px width; `prefers-reduced-motion` disables heavy animation

(Automated Playwright check was run during build — unwrap, greeting, jigsaw unlock,
countdown, calendar, RSVP, and theme switching all passed.)

---

## 7. How it works (for a developer)

- **Theming:** CSS custom properties on `:root`; `body.theme-*` classes override the
  token values (colors, fonts, motifs). `main.js` toggles the class and saves to
  `localStorage` under key `roka-theme`. Add a theme by adding one `body.theme-x {…}`
  block in `styles.css` + a swatch button in `index.html`.
- **Reveal animations:** `IntersectionObserver` adds `.in-view`; CSS transitions handle
  the rest. Guarded by `prefers-reduced-motion`.
- **Music:** single `Audio` object; browsers block autoplay, so it starts on the unwrap
  **tap** (a user gesture). Volume fades in. Missing file = silent, no error.
- **Jigsaw:** `puzzle.js` is fully standalone (`RokaPuzzle.init({board, image, size, onWin})`).
  Pointer Events for mouse+touch; swap-on-drag; `onWin` unveils the details section.
- **Calendar:** `.ics` is generated client-side as a `data:` URI (no server).
- **Greeting/RSVP/Share:** URL param + `wa.me` links + `navigator.share` with a
  clipboard+WhatsApp fallback.

---

## 8. Common gotchas

- **Fonts look like plain serif?** The cursive (Great Vibes) loads from Google Fonts CDN
  and needs internet — offline previews fall back gracefully. On real phones it's cursive.
- **Music doesn't play?** Expected until a real file exists at `CONFIG.musicSrc`; also
  mobile browsers only allow it after the unwrap tap (by design).
- **Jigsaw image looks stretched?** Use a **square** source image.
- **GitHub Pages shows 404?** Give it 1–2 min after enabling; confirm the URL ends in `/roka/`.

---

## 9. Boundaries (do not touch)

This invite is **additive and isolated**. It does **not** modify the Flutter Gallery app:
`lib/`, `pubspec.yaml`, the existing `web/`, `firebase.json`, or any CI workflow are
untouched. Keep all invite work inside `roka/` (the one exception is the repo-root
`.nojekyll`, needed only for GitHub Pages hosting).

---

Made with bahut saara pyaar 💛 • `#PrakharKiPranjali`
