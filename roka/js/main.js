/* ============================================================
   Prakhar ❤️ Pranjali — Roka Invite — main.js
   Unwrap • music • themes • greeting • reveal • countdown •
   calendar • maps • RSVP • share • jigsaw.
   ------------------------------------------------------------
   👇 EDIT EVERYTHING YOU NEED IN THIS CONFIG BLOCK 👇
   ============================================================ */
var CONFIG = {
  // WhatsApp number for RSVP (international format, no +, no spaces). e.g. "919876543210"
  rsvpWhatsApp: "919999999999",

  // Couple photo used in the jigsaw + share preview. Swap with your real photo.
  coupleImage: "assets/img/couple-placeholder.svg",

  // Background music (royalty-free). Drop your file at assets/audio/romantic.mp3
  musicSrc: "assets/audio/romantic.mp3",

  // Event details
  event: {
    title: "Roka — Prakhar & Pranjali",
    startISO: "2026-11-27T18:00:00+05:30",   // 27 Nov 2026, 6:00 PM IST
    endISO:   "2026-11-27T22:00:00+05:30",
    location: "Rooftop, ITC Fortune, Lucknow, Uttar Pradesh",
    mapsQuery: "ITC Fortune Lucknow"
  },

  // Default theme: theme-rooftop | theme-nawabi | theme-pastel | theme-retro
  defaultTheme: "theme-rooftop"
};

/* ============================================================ */
(function () {
  'use strict';
  var qs = function (s) { return document.querySelector(s); };
  var body = document.body;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Audio ---------- */
  var audio = new Audio(CONFIG.musicSrc);
  audio.loop = true; audio.volume = 0.0;
  var musicWanted = true;
  var muteBtn = qs('#muteBtn');

  function fadeTo(target) {
    var step = (target > audio.volume) ? 0.04 : -0.04;
    clearInterval(audio._fade);
    audio._fade = setInterval(function () {
      audio.volume = Math.min(1, Math.max(0, audio.volume + step));
      if (Math.abs(audio.volume - target) < 0.05) { audio.volume = target; clearInterval(audio._fade); }
    }, 60);
  }
  function startMusic() {
    audio.play().then(function () { if (musicWanted) fadeTo(0.55); })
      .catch(function () {/* autoplay blocked until gesture — fine */});
  }
  muteBtn.addEventListener('click', function () {
    musicWanted = !musicWanted;
    if (musicWanted) { audio.play(); fadeTo(0.55); muteBtn.textContent = '🔊'; }
    else { fadeTo(0); muteBtn.textContent = '🔇'; }
  });

  /* ---------- Theme switcher ---------- */
  var themeBtn = qs('#themeBtn'), tray = qs('#themeTray');
  var saved = localStorage.getItem('roka-theme');
  if (saved) setTheme(saved); else setTheme(CONFIG.defaultTheme);

  function setTheme(t) {
    body.classList.remove('theme-rooftop', 'theme-nawabi', 'theme-pastel', 'theme-retro');
    body.classList.add(t);
    localStorage.setItem('roka-theme', t);
  }
  themeBtn.addEventListener('click', function () { tray.hidden = !tray.hidden; });
  Array.prototype.forEach.call(document.querySelectorAll('.theme-swatch'), function (sw) {
    sw.addEventListener('click', function () { setTheme(sw.dataset.theme); tray.hidden = true; });
  });
  document.addEventListener('click', function (e) {
    if (!tray.hidden && !tray.contains(e.target) && e.target !== themeBtn) tray.hidden = true;
  });

  /* ---------- Personalized greeting (?to=Name) ---------- */
  (function () {
    var to = new URLSearchParams(location.search).get('to');
    if (to) {
      to = to.replace(/[<>]/g, '').trim().slice(0, 40);   // sanitize
      if (to) qs('#guestName').textContent = to;
    }
  })();

  /* ---------- Unwrap ---------- */
  var unwrap = qs('#unwrap'), invite = qs('#invite');
  var unwrapBtn = qs('#unwrapBtn'), shagunBox = qs('#shagunBox');

  function doUnwrap() {
    shagunBox.classList.add('open');
    startMusic();
    setTimeout(function () {
      unwrap.classList.add('gone');
      body.classList.remove('is-locked');
      invite.setAttribute('aria-hidden', 'false');
      invite.classList.add('shown');
      revealVisible();
      setTimeout(function () { unwrap.style.display = 'none'; }, 900);
    }, 650);
  }
  unwrapBtn.addEventListener('click', doUnwrap);
  shagunBox.addEventListener('click', doUnwrap);

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  var io;
  if ('IntersectionObserver' in window && !reduceMotion) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in-view'); io.unobserve(en.target); } });
    }, { threshold: 0.18 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }
  function revealVisible() { // make sure hero shows immediately after unwrap
    revealEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9) el.classList.add('in-view');
    });
  }

  /* ---------- Countdown ---------- */
  var target = new Date(CONFIG.event.startISO).getTime();
  var cd = { d: qs('#cd-days'), h: qs('#cd-hrs'), m: qs('#cd-min'), s: qs('#cd-sec') };
  function tick() {
    var diff = target - Date.now();
    if (diff < 0) diff = 0;
    var d = Math.floor(diff / 864e5);
    var h = Math.floor(diff % 864e5 / 36e5);
    var m = Math.floor(diff % 36e5 / 6e4);
    var s = Math.floor(diff % 6e4 / 1e3);
    if (cd.d) { cd.d.textContent = d; cd.h.textContent = h; cd.m.textContent = m; cd.s.textContent = s; }
  }
  tick(); setInterval(tick, 1000);

  /* ---------- Add to Calendar (.ics) ---------- */
  (function () {
    function z(n) { return (n < 10 ? '0' : '') + n; }
    function ics(iso) { var d = new Date(iso);
      return d.getUTCFullYear() + z(d.getUTCMonth() + 1) + z(d.getUTCDate()) + 'T' +
             z(d.getUTCHours()) + z(d.getUTCMinutes()) + '00Z'; }
    var e = CONFIG.event;
    var body = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Roka//EN', 'BEGIN:VEVENT',
      'UID:roka-prakhar-pranjali@invite',
      'DTSTAMP:' + ics(new Date().toISOString()),
      'DTSTART:' + ics(e.startISO), 'DTEND:' + ics(e.endISO),
      'SUMMARY:' + e.title, 'LOCATION:' + e.location,
      'DESCRIPTION:With love\\, Prakhar & Pranjali. Aapka aana zaroori hai!',
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    var url = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(body);
    var btn = qs('#calBtn'); if (btn) btn.href = url;
    var map = qs('#mapBtn');
    if (map) map.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(e.mapsQuery);
  })();

  /* ---------- RSVP + Share ---------- */
  (function () {
    var rsvpMsg = "Hi! 💛 Prakhar & Pranjali ke Roka ke liye — main zaroor aaunga/aaungi. Bahut bahut badhai!";
    var rsvp = qs('#rsvpBtn');
    if (rsvp) rsvp.href = 'https://wa.me/' + CONFIG.rsvpWhatsApp + '?text=' + encodeURIComponent(rsvpMsg);

    var shareBtn = qs('#shareBtn');
    var shareData = {
      title: 'Prakhar ❤️ Pranjali — Roka',
      text: 'Aapko pyaar bhara nyota 💌 Prakhar & Pranjali ke Roka par — 27 Nov 2026, Lucknow. Tap to unwrap:',
      url: location.href.split('?')[0]
    };
    shareBtn.addEventListener('click', function () {
      if (navigator.share) { navigator.share(shareData).catch(function () {}); }
      else {
        var wa = 'https://wa.me/?text=' + encodeURIComponent(shareData.text + ' ' + shareData.url);
        navigator.clipboard && navigator.clipboard.writeText(shareData.url);
        toast('Link copied! WhatsApp khul raha hai…');
        window.open(wa, '_blank');
      }
    });
  })();

  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('show'); });
    setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 400); }, 2600);
  }

  /* ---------- Jigsaw ---------- */
  var details = qs('#details');
  function unlockDetails() {
    details.classList.remove('is-veiled');
    qs('#puzzleWin').hidden = false;
    setTimeout(function () { details.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); }, 500);
  }
  var game = window.RokaPuzzle.init({
    board: qs('#puzzleBoard'),
    image: CONFIG.coupleImage,
    size: 3,
    onWin: unlockDetails
  });
  qs('#shuffleBtn').addEventListener('click', function () { game.shuffle(); });
  qs('#skipPuzzleBtn').addEventListener('click', function () { game.solve(); });
})();
