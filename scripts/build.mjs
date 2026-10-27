// Erzeugt alle festen SVGs des Profil-READMEs in assets/ (hell und dunkel in einer Datei).
// Die Statistik entsteht getrennt in stats.mjs, weil sie Daten von der GitHub-API braucht.
//
//   node scripts/build.mjs

import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { t, text, wrap, measure, panel, icon, dataUri, rng, doc, r } from './lib/svg.mjs';

const OUT = fileURLToPath(new URL('../assets/', import.meta.url));
const media = (f) => dataUri(fileURLToPath(new URL(`./media/${f}`, import.meta.url)));
mkdirSync(OUT, { recursive: true });

const write = (name, svg) => writeFileSync(`${OUT}${name}.svg`, svg);

/* ======================================================================
   Banner: Wortmarke wie im OG-Bild, Signaturbild als Panel, schwebende Partikel
   ====================================================================== */

function banner() {
  const W = 1200, H = 420, X = 2, Y = 2, PW = 1188, PH = 408, S = 8;
  const rand = rng(174);

  let particles = '';
  for (let i = 0; i < 70; i++) {
    const x = X + 16 + rand() * (PW - 32);
    const y = Y + 60 + rand() * (PH - 40);
    const behindText = x < 760;
    const o = (behindText ? 0.12 + rand() * 0.22 : 0.35 + rand() * 0.5).toFixed(2);
    const rad = (1.2 + rand() * 2.6).toFixed(1);
    const fill = t.particles[Math.floor(rand() * t.particles.length)];
    const dx = Math.round((rand() - 0.5) * 70);
    const dy = -Math.round(60 + rand() * 140);
    const d = (9 + rand() * 12).toFixed(1);
    const delay = (-rand() * d).toFixed(1);
    particles += `<circle class="p" cx="${r(x)}" cy="${r(y)}" r="${rad}" fill="${fill}" style="--o:${o};--dx:${dx}px;--dy:${dy}px;--d:${d}s;--delay:${delay}s"/>`;
  }

  // Textblock links, senkrecht mittig
  const tx = 72;
  const h1 = 82;
  const lead = wrap('Websites, eigene Softwareprojekte und Spielmodi – am liebsten interaktiv, zum direkt Ausprobieren.', 640, { size: 26 });
  const blockH = 30 + 96 + 24 + lead.length * 36 + 42;
  const top = Y + (PH - blockH) / 2;
  const eyebrowY = top + 18;
  const h1Y = eyebrowY + 96;
  const leadY = h1Y + 58;
  const urlY = leadY + (lead.length - 1) * 36 + 56;
  const preW = measure('Hi, ich bin ', { weight: 700, size: h1 });
  const awaW = measure('Awa.', { weight: 700, size: h1 });

  // Signaturbild rechts
  const ps = 300;
  const px = X + PW - ps - 70;
  const py = Y + (PH - ps) / 2 - 2;

  const style = `
.p{opacity:0;animation:float var(--d) linear var(--delay) infinite}
@keyframes float{0%{transform:translate(0,0);opacity:0}15%{opacity:var(--o)}80%{opacity:var(--o)}100%{transform:translate(var(--dx),var(--dy));opacity:0}}
.glow{transform-origin:${px + ps / 2}px ${py + ps / 2}px;animation:breathe 8s ease-in-out infinite alternate}
@keyframes breathe{from{opacity:.5;transform:scale(1)}to{opacity:.85;transform:scale(1.08)}}
@media (prefers-reduced-motion:reduce){.p{animation-duration:calc(var(--d) * 2.5)}.glow{animation-duration:16s}}`;

  const defs = `
<clipPath id="frame"><rect x="${X}" y="${Y}" width="${PW}" height="${PH}" rx="24"/></clipPath>
<clipPath id="portrait"><rect x="${px}" y="${py}" width="${ps}" height="${ps}" rx="20"/></clipPath>
<pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="1.4" fill="${t.dots}"/></pattern>
<linearGradient id="fadeIn" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".6" stop-color="#fff" stop-opacity="1"/></linearGradient>
<mask id="fade"><rect x="${X}" y="${Y}" width="${PW}" height="${PH}" fill="url(#fadeIn)"/></mask>
<radialGradient id="glow"><stop offset="0" stop-color="${t.hl}" stop-opacity=".9"/><stop offset="1" stop-color="${t.hl}" stop-opacity="0"/></radialGradient>`;

  const body = `
<rect x="${X + S}" y="${Y + S}" width="${PW}" height="${PH}" rx="24" fill="${t.frame}"/>
<rect x="${X}" y="${Y}" width="${PW}" height="${PH}" rx="24" fill="${t.bg}"/>
<g clip-path="url(#frame)">
  <rect x="${X}" y="${Y}" width="${PW}" height="${PH}" fill="url(#dots)" mask="url(#fade)"/>
  <ellipse class="glow" cx="${px + ps / 2}" cy="${py + ps / 2}" rx="340" ry="230" fill="url(#glow)"/>
  ${particles}
</g>
${text(tx, eyebrowY, 'Webentwicklung · Simulationen · Modding', { font: 'mono', size: 19, fill: t.label })}
<rect x="${r(tx + preW - 6)}" y="${r(h1Y - h1 * 0.4)}" width="${r(awaW + 12)}" height="${r(h1 * 0.5)}" fill="${t.mark}"/>
${text(tx, h1Y, 'Hi, ich bin', { weight: 700, size: h1, fill: t.text })}
${text(tx + preW, h1Y, 'Awa.', { weight: 700, size: h1, fill: t.text })}
${lead.map((line, i) => text(tx, leadY + i * 36, line, { size: 26, fill: t.soft })).join('\n')}
${text(tx, urlY, 'awa0174.github.io ↗', { font: 'mono', size: 19, fill: t.accent })}
<rect x="${px + S}" y="${py + S}" width="${ps}" height="${ps}" rx="20" fill="${t.frame}"/>
<image href="${media('awa-480.webp')}" x="${px}" y="${py}" width="${ps}" height="${ps}" preserveAspectRatio="xMidYMid slice" clip-path="url(#portrait)"/>
<rect x="${px}" y="${py}" width="${ps}" height="${ps}" rx="20" fill="none" stroke="${t.frame}" stroke-width="2"/>
<rect x="${X}" y="${Y}" width="${PW}" height="${PH}" rx="24" fill="none" stroke="${t.frame}" stroke-width="2"/>`;

  return doc(W, H, {
    title: 'Hi, ich bin Awa.',
    desc: 'Webentwicklung, Simulationen und Modding. Websites, eigene Softwareprojekte und Spielmodi – am liebsten interaktiv. awa0174.github.io',
    style, defs,
  }, body);
}

/* ======================================================================
   Tippzeile: SMIL statt CSS, damit sie auch in Safari läuft
   ====================================================================== */

const phrases = [
  'baut eine Partikel-Engine für den Browser',
  'schreibt Spielmodi in Lua für nanos world',
  'baut Addons für Garry’s Mod',
  'macht Medizintechnik zum Ausprobieren',
  'baut Websites ohne Framework',
];

function typing() {
  const W = 1200, H = 64, size = 28, y = 41;
  const typeStep = 0.06, delStep = 0.025, hold = 2.6, gap = 0.4;
  const slots = phrases.map((p) => [...p].length * (typeStep + delStep) + hold + gap);
  const T = slots.reduce((a, b) => a + b, 0);
  const k = (s) => (s / T).toFixed(5);

  let defs = '';
  let body = '';
  let t0 = 0;
  phrases.forEach((p, i) => {
    const n = [...p].length;
    const w = measure(p, { font: 'mono', size });
    const x0 = (W - w) / 2;
    const cw = w / n;
    const times = ['0'], widths = ['0'];
    for (let c = 1; c <= n; c++) { times.push(k(t0 + c * typeStep)); widths.push(r(c * cw)); }
    const holdEnd = t0 + n * typeStep + hold;
    for (let c = n - 1; c >= 0; c--) { times.push(k(holdEnd + (n - c) * delStep)); widths.push(r(c * cw)); }
    const end = holdEnd + n * delStep;
    const vis = i === 0 ? { times: `0;${k(end)}`, values: '1;0' } : { times: `0;${k(t0)};${k(end)}`, values: '0;1;0' };
    const anim = (attr, values) => `<animate attributeName="${attr}" values="${values}" keyTimes="${times.join(';')}" dur="${r(T)}s" repeatCount="indefinite" calcMode="discrete"/>`;

    defs += `<clipPath id="c${i}"><rect x="${r(x0)}" y="0" width="0" height="${H}">${anim('width', widths.join(';'))}</rect></clipPath>`;
    body += `<g clip-path="url(#c${i})">${text(x0, y, p, { font: 'mono', size, fill: t.accent })}</g>`;
    body += `<g opacity="0"><animate attributeName="opacity" values="${vis.values}" keyTimes="${vis.times}" dur="${r(T)}s" repeatCount="indefinite" calcMode="discrete"/>`
      + `<rect class="cursor" x="${r(x0)}" y="${y - size * 0.78}" width="3" height="${size * 0.95}" fill="${t.accent}">${anim('x', widths.map((v) => r(x0 + Number(v) + 2)).join(';'))}</rect></g>`;
    t0 += slots[i];
  });

  const style = '.cursor{animation:blink 1s steps(1) infinite}@keyframes blink{50%{opacity:0}}';
  return doc(W, H, { title: 'Awa …', desc: phrases.join(' · '), style, defs }, body);
}

/* ======================================================================
   Schaltflächen wie auf der Website (Pille mit hartem Schatten)
   ====================================================================== */

const buttons = {
  portfolio: { label: 'Portfolio ansehen', arrow: true, primary: true },
  demo: { label: 'Live-Demo starten', arrow: true },
  discord: { label: 'Discord', icon: 'discord' },
  steam: { label: 'Steam', icon: 'steam' },
  github: { label: 'Code', icon: 'github' },
  feedback: { label: 'Feedback geben', arrow: true },
};

function button({ label, icon: ic, arrow, primary }) {
  const size = 17, weight = 600, h = 44, padX = 22, icSize = 18, gap = 10, S = 3;
  const str = arrow ? `${label} ↗` : label;
  const tw = measure(str, { size, weight });
  const w = padX * 2 + tw + (ic ? icSize + gap : 0);
  const fill = primary ? t.accent : t.card;
  const color = primary ? t.onAccent : t.text;
  const shadow = primary ? t.btnShadow : t.frame;
  const x = 1.5, y = 1.5;
  const body = `
<rect x="${x + S}" y="${y + S}" width="${r(w)}" height="${h}" rx="${h / 2}" fill="${shadow}"/>
<rect x="${x}" y="${y}" width="${r(w)}" height="${h}" rx="${h / 2}" fill="${fill}" stroke="${primary ? t.accent : t.frame}" stroke-width="1.5"/>
${ic ? icon(ic, x + padX, y + (h - icSize) / 2, icSize, color) : ''}
${text(x + padX + (ic ? icSize + gap : 0), y + h / 2 + 6, str, { size, weight, fill: color })}`;
  return doc(Math.ceil(w + S + 4), h + S + 4, { title: str }, body);
}

/* ======================================================================
   Projektkarten (Manga-Panels mit Screenshot oder Beispiel)
   ====================================================================== */

const cards = {
  particle: {
    status: ['live', 'Live-Demo'], meta: 'Web-App · v1.0', title: 'Particle Playground',
    lead: 'Ein Editor im Browser, mit dem man Partikeleffekte wie Galaxien, Feuerwerk oder Polarlichter baut, animiert und als Video exportiert – am PC und am Handy.',
    tags: ['TypeScript', 'WebGL2', 'React', 'GLSL'], img: 'particle-northern-1200.webp',
    alt: 'Editor mit einem grünen Polarlicht aus Partikeln',
    cta: 'Live-Demo öffnen ↗',
  },
  medlab: {
    status: ['wip', 'In Entwicklung'], meta: 'Lernplattform · 3 Labore', title: 'MedLab Studio',
    lead: 'Medizintechnik zum Ausprobieren: ein künstliches EKG stören und wieder sauber filtern, Reaktionszeit messen oder zwei Gerätebedienungen vergleichen.',
    tags: ['TypeScript', 'Python', 'FastAPI'], img: 'medlab-ecg-640.webp', cta: 'Code ansehen →',
  },
  jarvis: {
    status: ['fork', 'Fork'], meta: 'Sprachassistent · 26 Commits', title: 'Jarvis',
    lead: 'Ein Sprachassistent von Aditya Dewaskar, den ich zu einem deutschsprachigen Helfer für den Windows-Alltag ausbaue – mit lokaler Spracherkennung und Bestätigung vor jeder Änderung.',
    tags: ['TypeScript', 'Node.js', 'whisper.cpp'], img: 'jarvis-boot-640.webp', cta: 'Meine Änderungen ↗',
  },
  jack: {
    status: ['jam', 'Game Jam'], meta: 'nanos world · v0.13', title: 'Jack’s Last Show',
    lead: 'Ein Party-Spielmodus für bis zu 12 Leute: Alle sitzen im Zirkuszelt um Jack in der Box, Events und Karten entscheiden, wer übrig bleibt.',
    tags: ['Lua', 'nanos world', 'WebUI'], img: 'jacks-last-show-640.webp', cta: 'Code ansehen →',
  },
  timetales: {
    status: ['private', 'Privat'], meta: 'Garry’s Mod · 3 Addons', title: 'TimeTales',
    lead: 'Für den Harry-Potter-Rollenspielserver TimeTales habe ich drei Addons gebaut. Ein Beispiel: Die Schülersprecher-Wahl startet jeden Monat von selbst.',
    tags: ['Lua', 'Garry’s Mod', 'MySQL'], cta: 'Details auf der Website ↗',
    example: {
      kicker: 'Beispiel: mein Addon', code: 'tt_schuelersprecher', title: 'Wahl der Schülersprecher',
      steps: [
        ['−14 Tage', 'Kandidatur und Wahlkampf starten'],
        ['−3 Tage', 'Kandidaturschluss, Briefwahl beginnt'],
        ['Wahlabend', 'Zeremonie in der Großen Halle'],
        ['Zeremonie', 'Auszählung, ggf. Stichwahl, Ernennung'],
      ],
    },
  },
};

/** Status-Pille: die Arten unterscheiden sich in der Form, nicht nur in der Farbe. */
function status(kind, label, x, y) {
  const size = 14, h = 26, padL = 10, dot = 9, gap = 8, padR = 12;
  const w = padL + dot + gap + measure(label, { font: 'mono', size }) + padR;
  let fill = t.card, color = t.text, dash = '', dotFill = 'none', dotStroke = t.text;
  if (kind === 'live') {
    fill = t.liveFill; color = t.liveText; dotFill = dotStroke = t.liveDot;
  } else if (kind === 'jam') {
    fill = t.frame; color = t.card; dotFill = dotStroke = t.jamDot;
  } else if (kind === 'fork') {
    dash = ' stroke-dasharray="5 3"';
  } else if (kind === 'private') {
    dash = ' stroke-dasharray="0.1 4" stroke-linecap="round"';
  }
  const cx = x + padL + dot / 2, cy = y + h / 2;
  let dotSvg = `<circle cx="${r(cx)}" cy="${r(cy)}" r="${dot / 2 - 0.75}" fill="${dotFill}" stroke="${dotStroke}" stroke-width="1.5"/>`;
  if (kind === 'wip') {
    const rr = dot / 2 - 0.75;
    dotSvg += `<path d="M${r(cx)} ${r(cy - rr)} A${rr} ${rr} 0 0 0 ${r(cx)} ${r(cy + rr)} Z" fill="${dotStroke}"/>`;
  }
  return {
    w,
    svg: `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${h}" rx="${h / 2}" fill="${fill}" stroke="${t.frame}" stroke-width="1.5"${dash}/>${dotSvg}`
      + text(x + padL + dot + gap, y + h / 2 + 5, label, { font: 'mono', size, fill: color }),
  };
}

function tagRow(list, x, y) {
  const size = 14, h = 28, pad = 10, gap = 8;
  let cx = x, svg = '';
  for (const tag of list) {
    const w = measure(tag, { font: 'mono', size }) + pad * 2;
    svg += `<rect x="${r(cx)}" y="${r(y)}" width="${r(w)}" height="${h}" rx="6" fill="${t.card2}" stroke="${t.line}"/>`
      + text(cx + pad, y + h / 2 + 5, tag, { font: 'mono', size, fill: t.text });
    cx += w + gap;
  }
  return svg;
}

/** Text des Kartenkörpers; gibt SVG und benötigte Höhe zurück. */
function cardBody(c, x, y, width, { titleSize = 34, leadSize = 21 } = {}) {
  let svg = '';
  const st = status(c.status[0], c.status[1], x, y);
  svg += st.svg + text(x + st.w + 12, y + 19, c.meta, { size: 16, fill: t.muted });
  let size = titleSize;
  while (measure(c.title, { weight: 700, size }) > width) size -= 1;
  const titleY = y + 26 + 20 + size * 0.9;
  svg += text(x, titleY, c.title, { weight: 700, size, fill: t.text });
  const lh = Math.round(leadSize * 1.45);
  const lines = wrap(c.lead, width, { size: leadSize });
  const leadY = titleY + 16 + leadSize * 1.1;
  svg += lines.map((l, i) => text(x, leadY + i * lh, l, { size: leadSize, fill: t.soft })).join('');
  const tagsY = leadY + (lines.length - 1) * lh + 22;
  svg += tagRow(c.tags, x, tagsY);
  const ctaY = tagsY + 28 + 40;
  svg += text(x, ctaY, c.cta, { weight: 600, size: 18, fill: t.accent });
  return { svg, height: ctaY - y + 6 };
}

function exampleBox(ex, x, y, w, h) {
  const bw = Math.min(440, w - 64);
  const bh = 236;
  const bx = x + (w - bw) / 2, by = y + (h - bh) / 2 - 2;
  let svg = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${t.card2}"/>`;
  svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#dots)"/>`;
  svg += panel(bx, by, bw, bh, { radius: 12, shadow: 4 });
  const kx = bx + 18;
  const kickW = measure(`${ex.kicker} `, { size: 13 });
  svg += text(kx, by + 28, ex.kicker, { size: 13, fill: t.muted });
  const codeW = measure(ex.code, { font: 'mono', size: 12 }) + 12;
  svg += `<rect x="${r(kx + kickW)}" y="${by + 14}" width="${r(codeW)}" height="20" rx="5" fill="${t.card2}" stroke="${t.line}"/>`
    + text(kx + kickW + 6, by + 28, ex.code, { font: 'mono', size: 12, fill: t.text });
  svg += text(kx, by + 58, ex.title, { weight: 700, size: 20, fill: t.text });
  ex.steps.forEach(([when, what], i) => {
    const sy = by + 78 + i * 38;
    svg += `<line x1="${kx}" x2="${bx + bw - 18}" y1="${sy}" y2="${sy}" stroke="${t.line}"/>`;
    const cw = measure(when, { font: 'mono', size: 12 }) + 14;
    svg += `<rect x="${kx}" y="${sy + 9}" width="${r(cw)}" height="20" rx="10" fill="${i === 3 ? t.hl : t.card}" stroke="${t.frame}"/>`
      + text(kx + 7, sy + 23, when, { font: 'mono', size: 12, fill: i === 3 ? t.onHl : t.text });
    svg += text(kx + 100, sy + 24, what, { size: 15, fill: t.soft });
  });
  return svg;
}

const dotsPattern = `<pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1.2" fill="${t.dots}"/></pattern>`;

/** Kleine Karte für das 2er-Raster; height = gemeinsame Höhe der Reihe. */
function smallCard(c, height) {
  const W = 600, X = 2, Y = 2, CW = 588, S = 6, MH = 294, pad = 30;
  const b = cardBody(c, X + pad, Y + MH + 28, CW - pad * 2);
  const CH = height ?? MH + 28 + b.height + 26;
  const mediaSvg = c.img
    ? `<image href="${media(c.img)}" x="${X}" y="${Y}" width="${CW}" height="${MH}" preserveAspectRatio="xMidYMid slice"/>`
    : exampleBox(c.example, X, Y, CW, MH);
  const body = `
<rect x="${X + S}" y="${Y + S}" width="${CW}" height="${CH}" rx="16" fill="${t.frame}"/>
<rect x="${X}" y="${Y}" width="${CW}" height="${CH}" rx="16" fill="${t.card}"/>
<g clip-path="url(#card)">${mediaSvg}</g>
<line x1="${X}" x2="${X + CW}" y1="${Y + MH}" y2="${Y + MH}" stroke="${t.frame}" stroke-width="1.5"/>
${b.svg}
<rect x="${X}" y="${Y}" width="${CW}" height="${CH}" rx="16" fill="none" stroke="${t.frame}" stroke-width="1.5"/>`;
  const defs = `<clipPath id="card"><rect x="${X}" y="${Y}" width="${CW}" height="${CH}" rx="16"/></clipPath>${dotsPattern}`;
  return { height: CH, svg: doc(W, CH + S + 4, { title: c.title, desc: `${c.status[1]} · ${c.meta}. ${c.lead}`, defs }, body) };
}

function featuredCard(c) {
  const W = 1200, X = 2, Y = 2, CW = 1188, S = 8, MW = 640, CH = 400;
  const bx = X + MW + 46, bw = CW - MW - 46 * 2;
  // Körper zuerst messen, dann senkrecht mittig setzen
  const probe = cardBody(c, bx, 0, bw, { titleSize: 44, leadSize: 21 });
  const by = Y + (CH - probe.height) / 2;
  const b = cardBody(c, bx, by, bw, { titleSize: 44, leadSize: 21 });
  const body = `
<rect x="${X + S}" y="${Y + S}" width="${CW}" height="${CH}" rx="18" fill="${t.frame}"/>
<rect x="${X}" y="${Y}" width="${CW}" height="${CH}" rx="18" fill="${t.card}"/>
<g clip-path="url(#card)"><image href="${media(c.img)}" x="${X}" y="${Y}" width="${MW}" height="${CH}" preserveAspectRatio="xMidYMid slice"/></g>
<line x1="${X + MW}" x2="${X + MW}" y1="${Y}" y2="${Y + CH}" stroke="${t.frame}" stroke-width="1.5"/>
${b.svg}
<rect x="${X}" y="${Y}" width="${CW}" height="${CH}" rx="18" fill="none" stroke="${t.frame}" stroke-width="2"/>`;
  const defs = `<clipPath id="card"><rect x="${X}" y="${Y}" width="${CW}" height="${CH}" rx="18"/></clipPath>`;
  return doc(W, CH + S + 4, { title: c.title, desc: `${c.status[1]} · ${c.meta}. ${c.lead}`, defs }, body);
}

/* ======================================================================
   Stack: Werkzeug und wo es steckt – statt einer Icon-Wand
   ====================================================================== */

const stack = [
  { icons: ['typescript', 'react'], name: 'TypeScript & React', use: 'Particle Playground, MedLab Studio, Jarvis' },
  { icons: ['lua'], name: 'Lua', use: 'Jack’s Last Show, TimeTales' },
  { icons: ['webgl'], name: 'WebGL2 & GLSL', use: 'Grafik und Simulation in Particle Playground' },
  { icons: ['python', 'fastapi'], name: 'Python & FastAPI', use: 'Backend von MedLab Studio' },
  { icons: ['nodedotjs'], name: 'Node.js', use: 'Bridge von Jarvis' },
  { icons: ['vitest', 'pytest'], name: 'Vitest, pytest, Playwright', use: 'Tests in Particle Playground und MedLab Studio' },
  { icons: ['vite', 'tailwindcss'], name: 'Vite & Tailwind CSS', use: 'Vite in beiden Web-Apps, Tailwind in MedLab Studio' },
  { icons: ['html5', 'css'], name: 'HTML & CSS', use: 'meine Website – ohne Framework' },
];

function stackPanel() {
  const W = 1200, X = 2, Y = 2, PW = 1188, S = 8, pad = 36, rowH = 86, colGap = 44;
  const rows = Math.ceil(stack.length / 2);
  const PH = pad * 2 + rows * rowH - 14;
  const colW = (PW - pad * 2 - colGap) / 2;
  let body = panel(X, Y, PW, PH, { radius: 18, shadow: S, stroke: 2 });
  stack.forEach((s, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = X + pad + col * (colW + colGap);
    const y = Y + pad + row * rowH;
    if (row > 0) body += `<line x1="${r(x)}" x2="${r(x + colW)}" y1="${y - 16}" y2="${y - 16}" stroke="${t.line}"/>`;
    s.icons.forEach((ic, j) => {
      const cx = x + j * 54;
      body += `<rect x="${r(cx)}" y="${y}" width="46" height="46" rx="10" fill="${t.card2}" stroke="${t.frame}" stroke-width="1.5"/>`
        + icon(ic, cx + 11, y + 11, 24, t.text);
    });
    const tx = x + 2 * 54 + 14;
    const maxW = colW - (tx - x);
    let us = 16;
    while (measure(s.use, { size: us }) > maxW) us -= 0.5;
    body += text(tx, y + 19, s.name, { weight: 700, size: 19, fill: t.text })
      + text(tx, y + 44, s.use, { size: us, fill: t.muted });
  });
  return doc(W, PH + S + 4, {
    title: 'Womit ich arbeite',
    desc: stack.map((s) => `${s.name}: ${s.use}`).join('. '),
  }, body);
}

/* ======================================================================
   Kontakt: Sprechblase neben dem Signaturbild
   ====================================================================== */

function contact() {
  const W = 1200, S = 6;
  const av = 136, ax = 2, bx = 196, bw = W - bx - 12, pad = 36;
  const lines = wrap('Fragen zum Code, Ideen für einen Spielmodus, eine Runde zusammen oder Lust, an etwas mitzubauen – am schnellsten erreichst du mich auf Discord. Fehler und Vorschläge zu einem Projekt kannst du direkt als Issue melden.', bw - pad * 2, { size: 20 });
  const bh = pad + 26 + 44 + lines.length * 30 + pad - 8;
  const H = bh + S + 6;
  const by = 2;
  const ay = by + (bh - av) / 2;
  const mid = ay + av / 2;
  const tail = (dx, dy) => `${bx + 1 + dx},${mid - 16 + dy} ${bx - 24 + dx},${mid + dy} ${bx + 1 + dx},${mid + 16 + dy}`;
  const body = `
<rect x="${ax + S}" y="${ay + S}" width="${av}" height="${av}" rx="18" fill="${t.frame}"/>
<image href="${media('awa-480.webp')}" x="${ax}" y="${ay}" width="${av}" height="${av}" clip-path="url(#av)" preserveAspectRatio="xMidYMid slice"/>
<rect x="${ax}" y="${ay}" width="${av}" height="${av}" rx="18" fill="none" stroke="${t.frame}" stroke-width="2"/>
<polygon points="${tail(S, S)}" fill="${t.frame}"/>
${panel(bx, by, bw, bh, { radius: 20, shadow: S, stroke: 2 })}
<polygon points="${tail(0, 0)}" fill="${t.card}"/>
<polyline points="${tail(0, 0)}" fill="none" stroke="${t.frame}" stroke-width="2" stroke-linejoin="round"/>
${text(bx + pad, by + pad + 14, 'Discord · Steam · GitHub-Issues', { font: 'mono', size: 15, fill: t.label })}
${text(bx + pad, by + pad + 60, 'Lust auf Austausch?', { weight: 700, size: 34, fill: t.text })}
${lines.map((l, i) => text(bx + pad, by + pad + 100 + i * 30, l, { size: 20, fill: t.soft })).join('')}`;
  const defs = `<clipPath id="av"><rect x="${ax}" y="${ay}" width="${av}" height="${av}" rx="18"/></clipPath>`;
  return doc(W, H, { title: 'Lust auf Austausch?', desc: lines.join(' '), defs }, body);
}

/* ====================================================================== */

write('banner', banner());
write('typing', typing());
for (const [id, spec] of Object.entries(buttons)) write(`btn-${id}`, button(spec));
write('card-particle', featuredCard(cards.particle));
for (const row of [['medlab', 'jarvis'], ['jack', 'timetales']]) {
  const height = Math.max(...row.map((id) => smallCard(cards[id]).height));
  for (const id of row) write(`card-${id}`, smallCard(cards[id], height).svg);
}
write('stack', stackPanel());
write('contact', contact());
console.log('SVGs geschrieben nach assets/');
