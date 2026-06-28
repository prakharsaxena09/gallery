# 💍 Roka Invite — Prakhar ❤️ Pranjali

A self-contained, mobile-first digital Roka invitation. One shareable link, no app
install. Opens with a *"Tap to unwrap your shagun"* moment, romantic music, scroll
animations, a personalized greeting, a photo jigsaw that unlocks the celebration
details, a live countdown, Add-to-Calendar, Maps, and a WhatsApp RSVP.

**Event:** Roka • Friday, 27 November 2026 • 6:00 PM onwards • Rooftop, ITC Fortune, Lucknow

---

## 🎨 Four live themes
A floating 🎨 button lets you (and guests) switch the whole look instantly. The choice
is remembered per device.
- **Starry Rooftop Night** (default — matches your venue)
- **Nawabi Lucknowi Royal**
- **Pastel Phoolon Wali**
- **Retro Bollywood Filmy**

Pick your favourite as the default in `js/main.js` → `CONFIG.defaultTheme`.

---

## ▶️ Preview locally
The invite is plain HTML/CSS/JS — no build step.

```bash
cd roka
python3 -m http.server 8000
# open http://localhost:8000
```

(Opening `index.html` directly also works, but a local server is recommended so
music and the `?to=` greeting behave exactly like in production.)

---

## ✏️ Make it yours — everything is in ONE place
Open **`js/main.js`** and edit the `CONFIG` block at the top:

| Field | What it does |
|---|---|
| `rsvpWhatsApp` | Your WhatsApp number for RSVPs — international format, digits only (e.g. `919876543210`). |
| `coupleImage`  | Path to your couple photo (used in the jigsaw + share preview). |
| `musicSrc`     | Path to your background music. |
| `event.*`      | Title, start/end time (IST), venue, Maps search query. |
| `defaultTheme` | Which theme loads first. |

### Add your photo
Replace `assets/img/couple-placeholder.svg` with a **square** photo (e.g.
`assets/img/couple.jpg`, ~800×800) and point `CONFIG.coupleImage` to it. A square
image makes the 3×3 jigsaw look perfect.

### Add music
Drop a **royalty-free** romantic instrumental at `assets/audio/romantic.mp3`
(see `assets/audio/README.txt`). If absent, the invite simply opens silently.

---

## 💌 Personalized greetings (the "aww" trick)
Add `?to=<name>` to the link and the greeting reads *"Dear &lt;name&gt;, aap toh
humare apne ho…"*. Generate one link per relative — no typing for them.

```
https://your-invite-link/?to=Chachu%20Chachi
https://your-invite-link/?to=Mausi%20ji
https://your-invite-link/?to=Rohan%20Bhaiya
```

Use `%20` for spaces. No `?to=` → a warm default ("Dear Aap") shows. Tip: keep a
small sheet mapping each relative to their personalized link before you broadcast.

---

## 🚀 Deploy (pick any — it's just static files)
- **Netlify / Vercel:** drag-and-drop the `roka/` folder. Done.
- **GitHub Pages:** push and serve the `roka/` folder.
- **Firebase Hosting (your own project):** create *your own* Firebase project and run
  `firebase init hosting` with `public: roka`, then `firebase deploy`.

> ⚠️ Do **not** deploy this onto the Flutter Gallery's Firebase project in this repo.
> This invite is intentionally separate and does not touch the Flutter app, its
> `firebase.json`, or its CI.

---

## ✅ Quick checklist before sharing
- [ ] Replaced `CONFIG.rsvpWhatsApp` with your real number
- [ ] Added couple photo + set `CONFIG.coupleImage`
- [ ] Added music file (optional)
- [ ] Picked default theme
- [ ] Generated personalized `?to=` links for close family
- [ ] Tested on a phone (tap-unwrap, jigsaw, RSVP, calendar, maps)

Made with bahut saara pyaar 💛  •  `#PrakharKiPranjali`
