// shoot-live.cjs <pasta>: no site (build local), a página real na tela, a tampa fechando e abrindo
const puppeteer = require('/home/ubuntu/staging/folio-v2/pp/node_modules/puppeteer-core');
(async () => {
  const [pasta] = process.argv.slice(2);
  const b = await puppeteer.launch({ executablePath: '/usr/local/bin/google-chrome', headless: 'new', timeout: 150000, protocolTimeout: 900000,
    args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4'] });
  const p = await b.newPage();
  await p.setViewport({ width: 1440, height: 900 });
  p.on('pageerror', (e) => console.log('pageerror:', e.message));
  await p.evaluateOnNewDocument(() => { localStorage.setItem('hue', 'purple'); localStorage.setItem('theme', 'dark'); localStorage.setItem('nb.luz', '1'); localStorage.setItem('lang.picked', 'pt'); });
  await p.goto((process.env.SITE || 'http://127.0.0.1:8098/') + '?lang=pt', { waitUntil: 'load', timeout: 180000 });
  await p.evaluate(() => document.getElementById('projects')?.scrollIntoView());
  await p.waitForSelector('.nb3d', { timeout: 180000 });
  await p.evaluate(() => document.querySelector('.nb3d').scrollIntoView({ block: 'center' }));
  await p.waitForSelector('.nb3d-stage.is-live', { timeout: 420000 });
  console.log('canLive:', await p.evaluate(() => matchMedia('(pointer: fine)').matches));
  const loaded = await p.waitForSelector('.nb3d-live-win.is-loaded', { timeout: 120000 }).then(() => true, () => false);
  console.log('página carregada na tela:', loaded);
  await new Promise((r) => setTimeout(r, 2500));
  const shot = async (nome) => { const el = await p.$('.nb3d'); await el.screenshot({ path: `${pasta}/${nome}.png` }); console.log('ok', nome); };
  await shot('vivo_1');
  await p.click('button[aria-label="Próximo projeto"]');
  await p.waitForFunction(() => !document.querySelector('.nb3d-live-win.is-loaded'), { timeout: 20000 }).catch(() => {});
  await p.waitForSelector('.nb3d-live-win.is-loaded', { timeout: 120000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 2500));
  await shot('vivo_2');
  // teclas: digita no palco (a tecla afunda e faz som; aqui só confere que não quebra)
  await p.focus('.nb3d-stage');
  for (const k of ['KeyO', 'KeyL', 'KeyA']) await p.keyboard.press(k.replace('Key', '').toLowerCase());
  const [fechar] = await p.$$('xpath/.//button[contains(., "Fechar a tampa")]');
  await fechar.click();
  await new Promise((r) => setTimeout(r, 2200));
  await shot('tampa_fechada');
  const [abrir] = await p.$$('xpath/.//button[contains(., "Abrir a tampa")]');
  await abrir.click();
  await new Promise((r) => setTimeout(r, 600));
  await shot('tampa_abrindo');
  await new Promise((r) => setTimeout(r, 2000));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
