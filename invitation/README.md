# Prakhar ❤️ Pranjali — Digital Roka Experience

A handcrafted, cinematic, mobile-first digital Roka invitation — built to feel
like opening a Lucknowi heirloom rather than browsing a website.

Ten chapters, one continuous story: lift a velvet box, break a wax seal, read a
greeting written in your name, walk through the couple's story, meet the families,
explore the rooftop, find the details, RSVP, and release a lantern into the night.

Built with **Astro + TypeScript + GSAP + Howler**, SVG-first, statically
deployable. Implemented from the 12-document creative bible (Master Spec, Creative
Director Notes, Design System, Screen Book, Pixel Spec, Asset Book, Illustration
Guide, AI Asset Prompts, Motion Book, Scene Implementation Spec, Engineering Spec,
QA Book) and the Asset Library board.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
```

Build & preview the production bundle:

```bash
npm run build
npm run preview
```

Type-check:

```bash
npm run check
```

> Requires Node 18+ (developed on Node 22).

---

## Personalising a guest's link

Add `?to=` to address a guest by name — it is written in ink on the greeting and
prefilled into the WhatsApp RSVP:

```
https://your-domain/?to=Aanya%20%26%20Family
```

No parameter falls back to a gracious generic greeting.

---

## Editing the content (no code required)

Everything the couple may want to change lives in **one file**:
[`src/config/content.ts`](src/config/content.ts) — names, parents, the six story
memories, venue + hotspots, event details, dress code, the WhatsApp number, share
text and the farewell message.

The most important fields to confirm before sharing:

| Field | Where | Notes |
| --- | --- | --- |
| `rsvp.whatsappNumber` | `content.ts` | **Placeholder** — set the real number (country code + number, digits only). Until then the RSVP button shows a gentle "contact coming soon" note instead of opening a broken chat. |
| `event.dateISO` / `endISO` | `content.ts` | Drives the calendar (`.ics`) file. |
| `event.mapsQuery` | `content.ts` | Drives the Google Maps "Directions" link. |
| `event.details` | `content.ts` | The rows shown on the details scene. |

Visual tokens (colour, type, spacing, motion) live in
[`src/styles/tokens.css`](src/styles/tokens.css); per-scene lighting in
[`src/config/theme.ts`](src/config/theme.ts).

---

## Architecture

```
src/
  config/    content.ts · theme.ts (per-scene lighting) · routes.ts (deep links)
  styles/    tokens.css · fonts.css · global.css
  lib/       scene-controller (single master timeline) · motion (GSAP helpers)
             audio (Howler) · particles (canvas) · store · personalize · ics · share · haptics
  components/
    art/     handcrafted SVG: velvet box, wax seal, paper, envelope, lantern,
             couple, family frame, venue, florals, dividers, icons, monogram
    ui/      SceneShell · PaperCard · GoldText · ParticleField · ProgressDots · AudioToggle · ContinueCue
    scenes/  Scene01…Scene10 (each self-registers init/enter/idle/exit/destroy)
  layouts/   Base.astro (SEO/OG, font preloads, desktop framing)
  pages/     index.astro (assembles chrome + scenes, boots the controller)
```

- **One controller, one timeline.** `lib/scene-controller.ts` owns scene order,
  lifecycle, transitions, lazy init, neighbour preloading, music beds and progress
  persistence. Scenes never reach into each other.
- **Separation of concerns.** Content, layout, motion, assets, configuration and
  logic are kept apart, per the Engineering Spec.
- **Reduced motion.** A first-class path: rich timelines collapse to ≤300 ms fades,
  delays/staggers collapse, particles switch off — content still appears at once.
- **Accessibility.** Semantic HTML, ARIA roles/labels, keyboard navigation (← →,
  chapter dots, Esc to close overlays), focus management, 44 px targets, AA+
  contrast, a skip link, and audio off by default.

---

## Regenerating assets

Two build tools (run with Node, output committed to `public/`):

```bash
node tools/generate-audio.mjs   # synthesises the royalty-free ambient + interaction WAVs
node tools/generate-og.mjs      # renders the 1200×630 OpenGraph share image (needs playwright-core)
```

The audio is self-synthesised (additive drones tuned for seamless loops) and fully
royalty-free; swap in a richer pack later by replacing the files in `public/audio/`
and updating the paths in `src/lib/audio.ts`.

---

## Live preview on GitHub Pages (no credentials needed)

A workflow ([`.github/workflows/deploy-invitation.yml`](../.github/workflows/deploy-invitation.yml))
builds this folder and publishes it to GitHub Pages on every push to the build
branch. **One-time setup** (repo owner, ~10 seconds):

1. GitHub → **Settings → Pages → Build and deployment → Source: “GitHub Actions”**.
2. Then **Actions** tab → run **“Deploy invitation to GitHub Pages”** (or push any
   change); if the first run happened before step 1, just re-run it.

The site goes live at **`https://<owner>.github.io/gallery/`**
(here: `https://prakharsaxena09.github.io/gallery/`). Try a personalised link:
`https://prakharsaxena09.github.io/gallery/?to=Aanya`.

The build is base-path aware (`SITE_BASE=/gallery/`), so all fonts, audio and
images resolve correctly under the project sub-path.

---

## Deployment (static)

`npm run build` emits a fully static site to `dist/` — host it anywhere:

- **Netlify / Vercel / Cloudflare Pages:** set the project base directory to
  `invitation/`, build command `npm run build`, publish directory `dist`.
- **GitHub Pages / any static host:** upload the contents of `dist/`.
- Set the production URL in `astro.config.mjs` (`site`) so canonical/OG URLs are
  absolute.

Recommended hosting config: HTTPS, gzip/brotli compression, long-cache the
`_assets/` and `fonts/` directories (content-hashed), and let `index.html` revalidate.

---

## Credits

Design language: Lucknow chikankari, Mughal proportions, Awadhi evening hospitality
— expressed through craftsmanship, never stereotype. Fonts: Cormorant Garamond,
EB Garamond, Pinyon Script (self-hosted). Built to a luxury bar: every pixel,
animation and transition in service of the moment.
