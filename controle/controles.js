// Controles 1, 2, 3, 5 en screenshots voor 6. Gebruik (vanuit de hoofdmap van de repository):
//   python3 -m http.server 8765 -d site &
//   node controle/controles.js [screenshotmap]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');

const SITE = path.resolve(__dirname, '..');
const SHOTS = process.argv[2];
const BASE = process.env.BASE || 'http://localhost:8765/';
const intake = JSON.parse(fs.readFileSync(path.join(SITE, 'bron', 'intake.json'), 'utf8'));
const intakeTekst = JSON.stringify(intake);
const PAGINAS = fs.readdirSync(path.join(SITE, 'site')).filter((f) => f.endsWith('.html'));
const BREEDTES = [390, 1280];
// Getallen die uit de wet of de pagina-opbouw komen, niet uit de intake:
const TOEGESTAAN = new Set(['6', '1', '7', '404', '2026', '14']);

const res = { 1: [], 2: [], 3: [], 5: [], aanvullen: {} };
const fout = (k, m) => res[k].push(m);

(async () => {
  const browser = await chromium.launch();
  for (const p of PAGINAS) {
    for (const w of BREEDTES) {
      const page = await browser.newPage({ viewport: { width: w, height: 900 } });
      const console_ = [], extern = [];
      page.on('console', (m) => m.type() === 'error' && console_.push(m.text()));
      page.on('pageerror', (e) => console_.push(e.message));
      page.on('request', (r) => { if (!r.url().startsWith(BASE)) extern.push(r.url()); });
      const resp = await page.goto(BASE + p, { waitUntil: 'networkidle' });
      if (!resp.ok()) fout(2, `${p}: HTTP ${resp.status()}`);
      await page.evaluate(() => document.fonts.ready);

      const r = await page.evaluate(() => {
        const q = (s) => [...document.querySelectorAll(s)];
        const zichtbaar = (e) => e.offsetParent !== null || getComputedStyle(e).position === 'fixed';
        const out = {};
        out.hscroll = document.documentElement.scrollWidth > innerWidth;
        out.h1 = q('h1').length;
        out.desc = !!document.querySelector('meta[name=description]')?.content;
        out.title = document.title;
        out.canonical = !!document.querySelector('link[rel=canonical]');
        out.og = !!document.querySelector('meta[property="og:title"]');
        out.jsonld = !!document.querySelector('script[type="application/ld+json"]');
        out.zonderLabel = q('input,select,textarea').filter((e) => !(e.id && document.querySelector(`label[for="${e.id}"]`)) && !e.closest('label')).map((e) => e.name);
        out.links = q('a[href]').map((a) => a.getAttribute('href'));
        out.ids = q('[id]').map((e) => e.id);
        // knop over twee regels?
        out.tweeRegels = q('.knop,button').filter(zichtbaar).filter((b) => {
          const lh = parseFloat(getComputedStyle(b).lineHeight) || 16;
          const pad = parseFloat(getComputedStyle(b).paddingTop) + parseFloat(getComputedStyle(b).paddingBottom);
          return b.getBoundingClientRect().height - pad > lh * 1.6;
        }).map((b) => b.innerText.trim());
        // contrast: elk element met eigen tekst tegen eerste ondoorzichtige achtergrond
        const rgb = (s) => (s.match(/[\d.]+/g) || []).map(Number);
        const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
        const bgVan = (e) => { for (let n = e; n; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.backgroundImage !== 'none' && n !== e && n.classList.contains('foto')) return null; const c = rgb(cs.backgroundColor); if (c.length === 3 || (c[3] ?? 1) >= 0.99) return c.slice(0, 3); } return [255, 255, 255]; };
        out.contrast = [];
        q('body *').filter(zichtbaar).forEach((e) => {
          if (![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return;
          const bg = bgVan(e); if (!bg) return;
          const fg = rgb(getComputedStyle(e).color).slice(0, 3);
          const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
          const ratio = (a + 0.05) / (b + 0.05);
          out.contrast.push({ t: e.innerText.trim().slice(0, 40), ratio: +ratio.toFixed(2) });
        });
        const voet = document.querySelector('footer')?.innerText || '';
        out.voet = voet;
        out.tekst = document.body.innerText;
        out.aanvullen = q('.aanvullen').map((m) => m.innerText);
        out.cookies = document.cookie;
        return out;
      });

      const tag = `${p} @${w}`;
      if (r.hscroll) fout(2, `${tag}: horizontale scroll`);
      if (r.h1 !== 1) fout(2, `${tag}: ${r.h1}× h1`);
      if (!r.desc) fout(2, `${tag}: geen description`);
      if (r.zonderLabel.length) fout(2, `${tag}: velden zonder label: ${r.zonderLabel}`);
      if (r.tweeRegels.length) fout(2, `${tag}: knop over twee regels: ${r.tweeRegels}`);
      if (console_.length) fout(2, `${tag}: consolefouten: ${console_.join(' | ')}`);
      if (extern.length) fout(1, `${tag}: externe verzoeken (trackers/fonts?): ${extern.join(', ')}`);
      if (r.cookies) fout(1, `${tag}: cookies gezet`);
      for (const h of r.links) {
        if (/^(https?:|mailto:|tel:)/.test(h)) continue;
        const [bestand, anker] = h.split('#');
        const doel = bestand || p;
        if (!fs.existsSync(path.join(SITE, 'site', doel))) fout(2, `${tag}: dode link ${h}`);
        else if (anker) {
          const html = fs.readFileSync(path.join(SITE, 'site', doel), 'utf8');
          if (!html.includes(`id="${anker}"`)) fout(2, `${tag}: dood anker ${h}`);
        }
      }
      if (w === 1280) {
        // 1. wettelijke voet
        const b = intake.bedrijf, c = intake.contact;
        const moet = { handelsnaam: b.handelsnaam, rechtsvorm: b.rechtsvorm, adres: b.vestigingsadres, kvk: b.kvk, 'btw-id': b.btw_id || '[AANVULLEN: btw-id]', email: c.email, telefoon: c.telefoon, bereikbaarheid: c.bereikbaarheid };
        for (const [k, v] of Object.entries(moet)) if (!r.voet.toLowerCase().includes(String(v).toLowerCase())) fout(1, `${p}: voet mist ${k}`);
        if (!r.canonical || !r.og) fout(1, `${p}: canonical/og ontbreekt`);
        if (p === 'index.html' && !r.jsonld) fout(1, 'index.html: geen JSON-LD');
        if (/€/.test(r.tekst) && !/incl\. btw/.test(r.tekst)) fout(1, `${p}: prijs zonder "incl. btw"`);
        // 3. contrast
        r.contrast.filter((x) => x.ratio < 4.5 && !x.t.startsWith('[AANVULLEN')).forEach((x) => fout(3, `${p}: "${x.t}" ${x.ratio}:1`));
        res[3].push(`__min ${p}: ${Math.min(...r.contrast.map((x) => x.ratio))}`);
        // 5. getallen moeten in de intake staan
        const zonderAanv = r.tekst.replace(/\[AANVULLEN:[^\]]*\]/g, '');
        for (const n of new Set(zonderAanv.match(/\d[\d.,]*/g) || [])) {
          const kaal = n.replace(/[.,]$/, '');
          if (!TOEGESTAAN.has(kaal) && !intakeTekst.includes(kaal)) fout(5, `${p}: getal "${kaal}" niet in intake`);
        }
        if (r.aanvullen.length) res.aanvullen[p] = r.aanvullen;
      }
      if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `${p.replace('.html', '')}-${w}.png`), fullPage: true });
      await page.close();
    }
  }
  // 1. vaste bestanden en privacyverklaring
  for (const f of ['robots.txt', 'sitemap.xml', '404.html', 'bedankt.html', 'privacy.html']) if (!fs.existsSync(path.join(SITE, 'site', f))) fout(1, `ontbreekt: ${f}`);
  const priv = fs.readFileSync(path.join(SITE, 'site', 'privacy.html'), 'utf8');
  const privMoet = ['verantwoordelijk', 'artikel 6', 'bewaren', 'ontvangt', 'rechten', 'Autoriteit Persoonsgegevens', 'Versie', 'cookies'];
  if (intake.contact.whatsapp) privMoet.push('Meta');
  privMoet.forEach((w) => { if (!priv.includes(w)) fout(1, `privacy.html mist "${w}"`); });
  await browser.close();

  const min3 = res[3].filter((x) => x.startsWith('__min'));
  res[3] = res[3].filter((x) => !x.startsWith('__min'));
  for (const k of ['1', '2', '3', '5']) console.log(`Controle ${k}: ${res[k].length ? 'GEFAALD' : 'GESLAAGD'}${res[k].map((m) => '\n  - ' + m).join('')}`);
  console.log('Laagste contrast per pagina:\n  ' + min3.map((x) => x.slice(6)).join('\n  '));
  console.log('Open [AANVULLEN]:');
  for (const [p, l] of Object.entries(res.aanvullen)) console.log(`  ${p}: ${[...new Set(l)].join(' · ')}`);
  process.exit(['1', '2', '3', '5'].some((k) => res[k].length) ? 1 : 0);
})();
