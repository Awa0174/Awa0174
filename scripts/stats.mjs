// Holt öffentliche Kennzahlen über die GitHub-API und zeichnet assets/stats.svg.
// Läuft täglich als GitHub Action; das SVG ändert sich nur, wenn sich die Daten ändern.
//
//   GITHUB_TOKEN=… node scripts/stats.mjs     (ohne Token gilt das niedrige API-Limit)

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { t, text, measure, panel, doc, r } from './lib/svg.mjs';

const USER = 'Awa0174';
const OUT = fileURLToPath(new URL('../assets/', import.meta.url));
const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': `${USER}-profile-stats`,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (res.status === 409) return { res, body: [] }; // leeres Repo
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return { res, body: await res.json() };
}

async function commitCount(repo) {
  const { res, body } = await gh(`/repos/${USER}/${repo}/commits?per_page=1`);
  const last = res.headers.get('link')?.match(/[?&]page=(\d+)>; rel="last"/);
  return last ? Number(last[1]) : body.length;
}

// Eigene öffentliche Repos ohne Forks und ohne dieses Profil-Repo
const { body: all } = await gh(`/users/${USER}/repos?per_page=100&type=owner`);
const repos = all.filter((repo) => !repo.fork && !repo.private && repo.name !== USER);

const bytes = {};
let commits = 0;
for (const repo of repos) {
  const { body: langs } = await gh(`/repos/${USER}/${repo.name}/languages`);
  for (const [lang, n] of Object.entries(langs)) bytes[lang] = (bytes[lang] ?? 0) + n;
  commits += await commitCount(repo.name);
}
const latest = repos.reduce((a, b) => (new Date(b.pushed_at) > new Date(a.pushed_at) ? b : a));

const total = Object.values(bytes).reduce((a, b) => a + b, 0);
const sorted = Object.entries(bytes).sort((a, b) => b[1] - a[1]);
const top = sorted.slice(0, 5).map(([name, n]) => ({ name, share: n / total }));
const rest = 1 - top.reduce((a, l) => a + l.share, 0);
if (rest > 0.0005) top.push({ name: 'Sonstige', share: rest });

const date = new Date(latest.pushed_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Berlin' });
const pct = (s) => `${(s * 100).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;

function stats() {
  const W = 1200, X = 2, Y = 2, PW = 1188, S = 8, pad = 36;
  const tileH = 118, tileGap = 20;
  const tileW = (PW - pad * 2 - tileGap * 2) / 3;
  const barY = Y + pad + tileH + 64;
  const legendY = barY + 22 + 40;
  const legendRows = Math.ceil(top.length / 3);
  const PH = legendY - Y + (legendRows - 1) * 34 + pad;

  let body = panel(X, Y, PW, PH, { radius: 18, shadow: S, stroke: 2 });

  const tiles = [
    { value: String(repos.length), label: 'eigene öffentliche Repos' },
    { value: commits.toLocaleString('de-DE'), label: 'Commits in diesen Repos' },
    { value: latest.name, label: `zuletzt aktiv · ${date}`, small: true },
  ];
  tiles.forEach((tile, i) => {
    const x = X + pad + i * (tileW + tileGap), y = Y + pad;
    body += `<rect x="${r(x)}" y="${y}" width="${r(tileW)}" height="${tileH}" rx="12" fill="${t.card2}" stroke="${t.frame}" stroke-width="1.5"/>`;
    let size = tile.small ? 30 : 46;
    while (measure(tile.value, { weight: 700, size }) > tileW - 44) size -= 1;
    body += text(x + 22, y + 62, tile.value, { weight: 700, size, fill: t.text })
      + text(x + 22, y + 94, tile.label, { font: 'mono', size: 14, fill: t.muted });
  });

  body += text(X + pad, barY - 18, 'Sprachen in meinen öffentlichen Repos', { font: 'mono', size: 15, fill: t.label });
  const barW = PW - pad * 2;
  let bx = X + pad;
  body += `<clipPath id="bar"><rect x="${X + pad}" y="${barY}" width="${barW}" height="22" rx="11"/></clipPath><g clip-path="url(#bar)">`;
  top.forEach((l, i) => {
    const w = l.share * barW;
    body += `<rect x="${r(bx)}" y="${barY}" width="${r(w + 0.5)}" height="22" fill="${t.scale[i]}"/>`;
    if (i > 0) body += `<line x1="${r(bx)}" x2="${r(bx)}" y1="${barY}" y2="${barY + 22}" stroke="${t.frame}" stroke-width="1.5"/>`;
    bx += w;
  });
  body += `</g><rect x="${X + pad}" y="${barY}" width="${barW}" height="22" rx="11" fill="none" stroke="${t.frame}" stroke-width="1.5"/>`;

  const colW = barW / 3;
  top.forEach((l, i) => {
    const x = X + pad + (i % 3) * colW, y = legendY + Math.floor(i / 3) * 34;
    body += `<rect x="${r(x)}" y="${y - 14}" width="16" height="16" rx="4" fill="${t.scale[i]}" stroke="${t.frame}" stroke-width="1.5"/>`
      + text(x + 28, y, l.name, { weight: 600, size: 18, fill: t.text })
      + text(x + 28 + measure(l.name, { weight: 600, size: 18 }) + 10, y, pct(l.share), { font: 'mono', size: 15, fill: t.muted });
  });

  return doc(W, PH + S + 4, {
    title: 'Auf GitHub',
    desc: `${repos.length} eigene öffentliche Repos, ${commits} Commits, zuletzt aktiv in ${latest.name} am ${date}. Sprachen: ${top.map((l) => `${l.name} ${pct(l.share)}`).join(', ')}.`,
  }, body);
}

writeFileSync(`${OUT}stats.svg`, stats());
console.log(`stats: ${repos.length} Repos, ${commits} Commits, zuletzt ${latest.name} (${date}); ${top.map((l) => `${l.name} ${pct(l.share)}`).join(', ')}`);
