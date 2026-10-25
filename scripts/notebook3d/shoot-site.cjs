// shoot-site.cjs <saida.png> <largura> <altura> [hue] [luz]: print da seção do notebook no site real (build local)
const puppeteer = require('/home/ubuntu/staging/folio-v2/pp/node_modules/puppeteer-core');
(async () => {
  const [out, w, h, hue = 'green', luz = '2', tema = 'light'] = process.argv.slice(2);
  const b = await puppeteer.launch({ executablePath: '/usr/local/bin/google-chrome', headless: 'new', timeout: 150000, protocolTimeout: 600000,
    args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage();
  await p.setViewport({ width: +w, height: +h, deviceScaleFactor: 1 });
  await p.evaluateOnNewDocument((hue, luz, tema) => { localStorage.setItem('hue', hue); localStorage.setItem('nb.luz', luz); localStorage.setItem('lang.picked', 'pt'); localStorage.setItem('theme', tema); }, hue, luz, tema);
  p.on('pageerror', (e) => console.log('pageerror:', e.message));
  await p.goto('http://127.0.0.1:8098/?lang=pt', { waitUntil: 'load', timeout: 180000 });
  await p.waitForSelector('.nb3d', { timeout: 180000 }).catch(async () => {
    // a galeria é carregada sob demanda: rola até os projetos
    await p.evaluate(() => document.getElementById('projects')?.scrollIntoView());
    await p.waitForSelector('.nb3d', { timeout: 180000 });
  });
  await p.evaluate(() => document.querySelector('.mp-t').scrollIntoView({ block: 'start' }));
  await p.waitForSelector('.nb3d-stage.is-live', { timeout: 420000 });
  await new Promise((r) => setTimeout(r, 1500));
  const top = await p.evaluate(() => document.querySelector('.mp').getBoundingClientRect().top + window.scrollY);
  const alt = await p.evaluate(() => document.querySelector('.nb3d').getBoundingClientRect().bottom - document.querySelector('.mp').getBoundingClientRect().top);
  await p.screenshot({ path: out, clip: { x: 0, y: top - 16, width: +w, height: alt + 40 }, captureBeyondViewport: true });
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
