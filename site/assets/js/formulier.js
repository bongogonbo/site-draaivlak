/* Bouwsteen: aanvraagformulier v1. Vaste code: niet per site aanpassen. */
(() => {
  const MIN_MS = 3000;      // sneller ingevuld = vrijwel zeker een bot
  const TIMEOUT_MS = 10000; // daarna geldt de webhook als onbereikbaar
  const VELDEN = ['naam', 'telefoon', 'email', 'postcode', 'onderwerp', 'bericht'];

  document.querySelectorAll('form.aanvraag').forEach((form) => {
    const t0 = Date.now();
    const status = form.querySelector('.status');
    const knop = form.querySelector('button[type="submit"]');
    const tel = form.dataset.telefoon || '';

    const toon = (tekst, soort, metTelefoon) => {
      status.textContent = tekst;
      status.dataset.soort = soort;
      if (metTelefoon && tel) {
        const a = document.createElement('a');
        a.href = 'tel:' + tel.replace(/[^+\d]/g, '');
        a.textContent = tel;
        status.append(' Bel direct: ', a, '.');
      }
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);

      if (fd.get('website')) { location.href = form.dataset.bedankt || 'bedankt.html'; return; } // honeypot

      let eerste = null;
      form.querySelectorAll('[required]').forEach((veld) => {
        const ok = veld.value.trim() !== '' && veld.checkValidity();
        veld.setAttribute('aria-invalid', ok ? 'false' : 'true');
        if (!ok && !eerste) eerste = veld;
      });
      if (eerste) { toon('Vul de gemarkeerde velden in.', 'fout'); eerste.focus(); return; }

      if (Date.now() - t0 < MIN_MS) {
        toon('Controleer uw gegevens en klik nogmaals op versturen.', 'fout');
        return;
      }

      const data = {
        schema: 'aanvraag.v1',
        site_id: form.dataset.siteId,
        pagina: location.pathname,
        verzonden_op: new Date().toISOString(),
      };
      VELDEN.forEach((v) => { data[v] = String(fd.get(v) || '').trim(); });

      knop.disabled = true;
      toon('Bezig met versturen…', 'bezig');

      try {
        if (form.dataset.webhook === 'demo:') {           // alleen in de voorbeeldversie
          await new Promise((r) => setTimeout(r, 400));
          toon('Voorbeeldversie: uw aanvraag zou nu zijn verstuurd.', 'ok');
          knop.disabled = false;
          return;
        }
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
        const res = await fetch(form.dataset.webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          signal: ctrl.signal,
        });
        clearTimeout(timer);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        location.href = form.dataset.bedankt || 'bedankt.html';
      } catch (err) {
        knop.disabled = false;
        toon('Versturen lukt nu niet. Uw bericht staat nog in het formulier.', 'fout', true);
      }
    });
  });
})();
