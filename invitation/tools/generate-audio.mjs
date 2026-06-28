/**
 * generate-audio.mjs — synthesises the ambient + interaction audio as royalty-free
 * WAV files (no external encoder needed). Beds are additive drones tuned so every
 * partial and LFO completes whole cycles over the loop length → click-free loops.
 * Run: node tools/generate-audio.mjs
 *
 * The palette is intentionally serene and low: music supports emotion, never
 * overpowers (MOTION_BOOK §Audio). Everything is off by default in the app.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SR = 22050; // mono, 22.05 kHz keeps files small for optional audio
const OUT = fileURLToPath(new URL('../public/audio/', import.meta.url));
mkdirSync(OUT, { recursive: true });

function writeWav(name, samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE((s * 32767) | 0, 44 + i * 2);
  }
  writeFileSync(OUT + name, buf);
  console.log('  wrote', name, (buf.length / 1024).toFixed(0) + 'kb');
}

/** Quantise a frequency so it completes whole cycles across `loopSec`. */
const q = (f, loopSec) => Math.max(1, Math.round(f * loopSec)) / loopSec;

/** Build a seamless drone bed from partials [{f, a}] with a gentle shimmer. */
function drone(loopSec, partials, opts = {}) {
  const n = Math.floor(SR * loopSec);
  const out = new Float32Array(n);
  const beat = q(opts.beat ?? 0.5, loopSec); // slow amplitude shimmer (jivari)
  const air = opts.air ?? 0.0;
  let airState = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let s = 0;
    for (const p of partials) {
      const f = q(p.f, loopSec);
      // a touch of detune partner for a living, beating drone
      s += p.a * Math.sin(2 * Math.PI * f * t);
      if (p.d) s += p.a * 0.5 * Math.sin(2 * Math.PI * q(p.f + p.d, loopSec) * t);
    }
    // slow shimmer
    s *= 0.82 + 0.18 * Math.sin(2 * Math.PI * beat * t);
    if (air > 0) {
      // soft filtered noise for breath
      airState = airState * 0.96 + (Math.random() * 2 - 1) * 0.04;
      s += airState * air;
    }
    out[i] = s;
  }
  // normalise to a calm peak
  let peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(out[i]));
  const g = (opts.gain ?? 0.5) / (peak || 1);
  for (let i = 0; i < n; i++) out[i] *= g;
  return out;
}

/** One-shot noise/tone gesture with an envelope. */
function gesture(durSec, fn) {
  const n = Math.floor(SR * durSec);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = fn(i / SR, i / n);
  return out;
}

const TAU = Math.PI * 2;
const noise = () => Math.random() * 2 - 1;

console.log('Synthesising audio →', OUT);

// ---- Music beds (seamless loops) ----
// Sa = C3 (130.81). Tanpura: Sa, Pa(196), Sa'(261.63) with shimmer.
writeWav('tanpura.wav', drone(8, [
  { f: 130.81, a: 1.0, d: 0.12 },
  { f: 196.0, a: 0.5 },
  { f: 261.63, a: 0.35, d: 0.1 },
  { f: 392.0, a: 0.12 },
], { gain: 0.5, beat: 0.25, air: 0.05 }));

// Sitar bed: brighter, adds the third (Ga) shimmer.
writeWav('sitar.wav', drone(8, [
  { f: 146.83, a: 0.9, d: 0.14 },
  { f: 220.0, a: 0.5 },
  { f: 293.66, a: 0.4, d: 0.12 },
  { f: 440.0, a: 0.16 },
], { gain: 0.46, beat: 0.3, air: 0.04 }));

// Strings pad: warm, lower, slow.
writeWav('strings.wav', drone(8, [
  { f: 110.0, a: 1.0, d: 0.1 },
  { f: 164.81, a: 0.55 },
  { f: 220.0, a: 0.4, d: 0.08 },
  { f: 329.63, a: 0.14 },
], { gain: 0.48, beat: 0.2, air: 0.06 }));

// Night ambience: airy high pad + breath.
writeWav('night-ambience.wav', drone(8, [
  { f: 196.0, a: 0.6, d: 0.2 },
  { f: 293.66, a: 0.4 },
  { f: 587.33, a: 0.12 },
], { gain: 0.4, beat: 0.18, air: 0.12 }));

// ---- Interaction one-shots ----
// Paper fold: soft band-limited noise swish.
let lp = 0;
writeWav('paper-fold.wav', gesture(0.5, (t, p) => {
  lp = lp * 0.7 + noise() * 0.3;
  const env = Math.sin(Math.PI * p) * Math.exp(-p * 1.5);
  return lp * env * 0.7;
}));

// Wax crack: a sharp snap + low thump.
writeWav('wax-crack.wav', gesture(0.35, (t, p) => {
  const crack = noise() * Math.exp(-p * 40) * 0.9;
  const thud = Math.sin(TAU * 90 * t) * Math.exp(-p * 12) * 0.5;
  return crack + thud;
}));

// Ribbon pull: a slow filtered swish (longer).
let lp2 = 0;
writeWav('ribbon-pull.wav', gesture(0.7, (t, p) => {
  lp2 = lp2 * 0.85 + noise() * 0.15;
  const env = Math.sin(Math.PI * p) ** 1.5;
  return lp2 * env * 0.6;
}));

// Lantern release: soft rising whoosh.
let lp3 = 0;
writeWav('lantern.wav', gesture(1.1, (t, p) => {
  lp3 = lp3 * 0.92 + noise() * 0.08;
  const tone = Math.sin(TAU * (160 + 120 * p) * t) * 0.15;
  const env = Math.sin(Math.PI * p);
  return (lp3 * 0.7 + tone) * env * 0.6;
}));

// Temple bell: struck bell with inharmonic partials + long decay.
writeWav('temple-bell.wav', gesture(2.6, (t, p) => {
  const ps = [
    [277.2, 1.0], [554.4, 0.5], [831.6, 0.28], [1108.8, 0.16], [1700, 0.1],
  ];
  let s = 0;
  for (const [f, a] of ps) s += a * Math.sin(TAU * f * t);
  return s * Math.exp(-p * 3.2) * 0.4;
}));

// Soft chime: gentle two-note glassy ping.
writeWav('soft-chime.wav', gesture(1.6, (t, p) => {
  const a = Math.sin(TAU * 880 * t) * Math.exp(-p * 4);
  const b = Math.sin(TAU * 1318.5 * t) * Math.exp(-Math.max(0, p - 0.15) * 5);
  return (a * 0.5 + b * 0.4) * 0.4;
}));

// Wind: looped airy noise bed (seamless via crossfaded tail).
{
  const loopSec = 6;
  const n = Math.floor(SR * loopSec);
  const xf = Math.floor(SR * 0.5);
  const raw = new Float32Array(n + xf);
  let s1 = 0, s2 = 0;
  for (let i = 0; i < raw.length; i++) {
    s1 = s1 * 0.96 + noise() * 0.04;
    s2 = s2 * 0.8 + noise() * 0.2;
    const t = i / SR;
    const gust = 0.6 + 0.4 * Math.sin(TAU * q(0.15, loopSec) * t);
    raw[i] = (s1 * 0.8 + s2 * 0.2) * gust;
  }
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    if (i < xf) {
      const k = i / xf;
      out[i] = raw[i] * k + raw[i + n] * (1 - k);
    } else out[i] = raw[i];
  }
  let peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(out[i]));
  const g = 0.35 / (peak || 1);
  for (let i = 0; i < n; i++) out[i] *= g;
  writeWav('wind.wav', out);
}

console.log('Done.');
