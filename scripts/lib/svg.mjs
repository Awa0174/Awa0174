// Gemeinsame Bausteine für alle SVGs: Farbschemata, Textbreiten, Panels, Icons.
//
// Jedes SVG enthält beide Farbschemata: Farben stehen als CSS-Variablen im SVG und wechseln per
// prefers-color-scheme. So bleibt jede Grafik ein einzelnes <img>, das sich im README verlinken
// lässt – <a><picture> zerlegt GitHub beim Rendern.

import { readFileSync } from 'node:fs';

const metrics = JSON.parse(readFileSync(new URL('./metrics.json', import.meta.url), 'utf8'));
const icons = JSON.parse(readFileSync(new URL('./icons.json', import.meta.url), 'utf8'));

/* ---------- Farbschemata ----------
   Hell = „Fensterlicht“ der Website. Dunkel = dasselbe Manga-Panel invertiert:
   die Tintenlinien werden zu Leuchtgrün, die Markierung wird tiefgrün. */
const palettes = {
  light: {
    bg: '#f6fbec', card: '#fcffea', card2: '#e9f6da', line: '#c9dfb4',
    frame: '#0f170b', text: '#0f170b', soft: '#23331c', muted: '#3f5a33', label: '#4f7a3d',
    accent: '#2e5c1f', onAccent: '#fcffea', hl: '#bff2a6', onHl: '#0f170b', mark: '#bff2a6', dots: '#c9dfb4',
    btnShadow: '#0f170b', liveFill: '#bff2a6', liveText: '#0f170b', liveDot: '#2e5c1f', jamDot: '#bff2a6',
    p0: '#2e5c1f', p1: '#4f7a3d', p2: '#7fb35f', p3: '#bff2a6',
    s0: '#0f170b', s1: '#2e5c1f', s2: '#4f7a3d', s3: '#7fb35f', s4: '#bff2a6', s5: '#e9f6da',
  },
  dark: {
    bg: '#10160d', card: '#141c11', card2: '#1d2a18', line: '#2f4226',
    frame: '#bff2a6', text: '#f1f9e6', soft: '#d5e6c8', muted: '#a6c095', label: '#9fd88a',
    accent: '#bff2a6', onAccent: '#0f170b', hl: '#bff2a6', onHl: '#0f170b', mark: '#2e5c1f', dots: '#2a3a22',
    btnShadow: '#5f8f48', liveFill: '#2e5c1f', liveText: '#e3fdc9', liveDot: '#bff2a6', jamDot: '#141c11',
    p0: '#bff2a6', p1: '#9fd88a', p2: '#6f9f55', p3: '#e3fdc9',
    s0: '#e3fdc9', s1: '#bff2a6', s2: '#8fc874', s3: '#5f8f48', s4: '#3c6130', s5: '#22331c',
  },
};

/** Farb-Token als CSS-Variablen; die Werte setzt themeCss() je nach Farbschema. */
export const t = Object.fromEntries(Object.keys(palettes.light).map((k) => [k, `var(--${k})`]));
t.particles = [t.p0, t.p1, t.p2, t.p3];
t.scale = [t.s0, t.s1, t.s2, t.s3, t.s4, t.s5];

const vars = (p) => Object.entries(p).map(([k, v]) => `--${k}:${v}`).join(';');
const themeCss = `svg{${vars(palettes.light)}}@media (prefers-color-scheme:dark){svg{${vars(palettes.dark)}}}`;

/* ---------- Schrift ---------- */

export const FONT = {
  sans: "'Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif",
  mono: "'Cascadia Mono',Consolas,'SF Mono',Menlo,'DejaVu Sans Mono',monospace",
};

/** Breite eines Textes in px, gemessen an Segoe UI bzw. Cascadia Mono. */
export function measure(str, { font = 'sans', weight = 400, size = 16 } = {}) {
  const fam = metrics[font];
  const table = fam[weight] ?? fam[400];
  let w = 0;
  for (const ch of str) w += table[ch] ?? table.n;
  return (w / 1000) * size;
}

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** <text> mit festem textLength, damit der Text überall gleich breit läuft. */
export function text(x, y, str, { size = 16, weight = 400, font = 'sans', fill, anchor, cls } = {}) {
  const width = measure(str, { font, weight, size });
  const attrs = [
    `x="${r(x)}"`, `y="${r(y)}"`,
    `font-family="${FONT[font]}"`, `font-size="${size}"`,
    weight !== 400 ? `font-weight="${weight}"` : '',
    fill ? `fill="${fill}"` : '',
    anchor ? `text-anchor="${anchor}"` : '',
    cls ? `class="${cls}"` : '',
    width > 0 ? `textLength="${r(width)}" lengthAdjust="spacing"` : '',
  ].filter(Boolean).join(' ');
  return `<text ${attrs}>${esc(str)}</text>`;
}

/** Bricht einen Text auf eine Breite um (gierig, an Leerzeichen). */
export function wrap(str, maxWidth, opts) {
  const lines = [];
  let line = '';
  for (const word of str.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next, opts) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/* ---------- Formen ---------- */

export const r = (n) => Math.round(n * 100) / 100;

/** Manga-Panel: Fläche mit Tintenrahmen und hartem, versetztem Schatten. */
export function panel(x, y, w, h, { radius = 16, shadow = 4, fill = t.card, stroke = 1.5 } = {}) {
  return [
    shadow ? `<rect x="${r(x + shadow)}" y="${r(y + shadow)}" width="${r(w)}" height="${r(h)}" rx="${radius}" fill="${t.frame}"/>` : '',
    `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" rx="${radius}" fill="${fill}" stroke="${t.frame}" stroke-width="${stroke}"/>`,
  ].join('');
}

/** Simple-Icons-Pfad (24×24) an Position x/y in Größe size. */
export function icon(slug, x, y, size, fill) {
  const ic = icons[slug];
  if (!ic) throw new Error(`Icon fehlt: ${slug}`);
  return `<path transform="translate(${r(x)} ${r(y)}) scale(${r(size / 24)})" d="${ic.d}" fill="${fill}"/>`;
}

export function dataUri(file) {
  const type = file.endsWith('.webp') ? 'image/webp' : file.endsWith('.png') ? 'image/png' : 'image/jpeg';
  return `data:${type};base64,${readFileSync(file).toString('base64')}`;
}

/** Deterministischer Zufall (mulberry32) – derselbe Seed ergibt immer dasselbe Bild. */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** Präsentationsattribute können keine CSS-Variablen – fill/stroke/stop-color mit var() wandern ins style-Attribut. */
function varsToStyle(markup) {
  return markup.replace(/<([a-zA-Z]+)(\s[^<>]*?)?(\/?)>/g, (tag, name, attrs = '', close) => {
    const moved = [];
    let rest = attrs.replace(/\s(fill|stroke|stop-color)="(var\(--[\w-]+\))"/g, (_, prop, value) => {
      moved.push(`${prop}:${value}`);
      return '';
    });
    if (!moved.length) return tag;
    if (/\sstyle="/.test(rest)) rest = rest.replace(/\sstyle="([^"]*)"/, (_, s) => ` style="${s};${moved.join(';')}"`);
    else rest += ` style="${moved.join(';')}"`;
    return `<${name}${rest}${close}>`;
  });
}

/** Rahmen eines SVG-Dokuments mit Titel und Beschreibung für Screenreader. */
export function doc(w, h, { title, desc = '', style = '', defs = '' }, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="t d">
<title id="t">${esc(title)}</title>
<desc id="d">${esc(desc)}</desc>
<style>${themeCss}${style}</style>
${defs ? varsToStyle(`<defs>${defs}</defs>`) : ''}
${varsToStyle(body)}
</svg>
`;
}
