const { chromium } = require('playwright');
const path = require('path');
const URL_IN = (process.env.FORM_URL || path.join(__dirname, 'formulier-voorbeeld.html'));
const URL = URL_IN.startsWith('http') ? URL_IN : 'file://' + URL_IN;
const HOOK = process.env.HOOK || 'https://app.example.test/hooks/aanvraag';

async function vul(page) {
  await page.fill('#f-naam', 'Test Persoon');
  await page.fill('#f-telefoon', '0600000000');
  await page.fill('#f-bericht', 'Testbericht');
}

(async () => {
  const browser = await chromium.launch();
  const uit = [];
  const run = async (naam, fn) => {
    const page = await browser.newPage();
    const fouten = []; page.on('pageerror', (e) => fouten.push(e.message));
    try { const r = await fn(page); uit.push([naam, r && fouten.length === 0 ? 'GESLAAGD' : 'GEFAALD ' + fouten.join(';')]); }
    catch (e) { uit.push([naam, 'GEFAALD ' + e.message]); }
    await page.close();
  };

  await run('leeg', async (p) => {
    let calls = 0; await p.route(HOOK, (r) => { calls++; r.fulfill({ status: 200 }); });
    await p.goto(URL); await p.waitForTimeout(3100); await p.click('button[type=submit]');
    const s = await p.textContent('.status');
    return calls === 0 && /gemarkeerde/.test(s) && (await p.getAttribute('#f-naam', 'aria-invalid')) === 'true';
  });
  await run('te snel', async (p) => {
    let calls = 0; await p.route(HOOK, (r) => { calls++; r.fulfill({ status: 200 }); });
    await p.goto(URL); await vul(p); await p.click('button[type=submit]');
    return calls === 0 && /nogmaals/.test(await p.textContent('.status'));
  });
  await run('webhook onbereikbaar', async (p) => {
    await p.route(HOOK, (r) => r.abort('connectionrefused'));
    await p.goto(URL); await vul(p); await p.waitForTimeout(3100); await p.click('button[type=submit]');
    await p.waitForSelector('.status[data-soort=fout] a[href^="tel:"]');
    return (await p.inputValue('#f-bericht')) === 'Testbericht' && !(await p.isDisabled('button[type=submit]'));
  });
  await run('webhook 500', async (p) => {
    await p.route(HOOK, (r) => r.fulfill({ status: 500 }));
    await p.goto(URL); await vul(p); await p.waitForTimeout(3100); await p.click('button[type=submit]');
    await p.waitForSelector('.status[data-soort=fout] a[href^="tel:"]');
    return true;
  });
  await run('webhook goed', async (p) => {
    let body = null;
    await p.route(HOOK, (r) => { body = JSON.parse(r.request().postData()); r.fulfill({ status: 200, body: '{}' }); });
    await p.route('**/bedankt.html', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: 'bedankt' }));
    await p.goto(URL); await vul(p); await p.waitForTimeout(3100);
    await Promise.all([p.waitForURL('**/bedankt.html'), p.click('button[type=submit]')]);
    return body && body.schema === 'aanvraag.v1' && typeof body.site_id === 'string' && body.site_id.length > 0 && body.naam === 'Test Persoon' && 'postcode' in body;
  });
  await run('honeypot', async (p) => {
    let calls = 0; await p.route(HOOK, (r) => { calls++; r.fulfill({ status: 200 }); });
    await p.route('**/bedankt.html', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: 'bedankt' }));
    await p.goto(URL); await vul(p); await p.evaluate(() => { document.querySelector('#f-website').value = 'spam'; });
    await Promise.all([p.waitForURL('**/bedankt.html'), p.click('button[type=submit]')]);
    return calls === 0;
  });
  await browser.close();
  uit.forEach(([n, r]) => console.log(n.padEnd(22), r));
})();
