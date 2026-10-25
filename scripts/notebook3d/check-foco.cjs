// check-foco.cjs: com a página real na tela, o popup da galeria ainda fecha com Esc; e o mouse sobre a tela a deixa interativa
const puppeteer = require('/home/ubuntu/staging/folio-v2/pp/node_modules/puppeteer-core');
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/local/bin/google-chrome', headless: 'new', timeout: 150000, protocolTimeout: 900000,
    args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4'] });
  const p = await b.newPage();
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto((process.env.SITE || 'http://127.0.0.1:8098/') + '?lang=pt', { waitUntil: 'load', timeout: 180000 });
  await p.evaluate(() => document.getElementById('projects')?.scrollIntoView());
  await p.waitForSelector('.nb3d', { timeout: 180000 });
  await p.evaluate(() => document.querySelector('.nb3d').scrollIntoView({ block: 'center' }));
  console.log('página na tela:', await p.waitForSelector('.nb3d-live-win.is-loaded', { timeout: 240000 }).then(() => true, () => false));
  console.log('inerte sem o mouse:', await p.evaluate(() => document.querySelector('.nb3d-live-win').inert));
  const r = await p.evaluate(() => { const q = document.querySelector('.nb3d-live-win').getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; });
  await p.mouse.move(r.x - 5, r.y); await p.mouse.move(r.x, r.y);
  console.log('interativa com o mouse em cima:', await p.evaluate(() => !document.querySelector('.nb3d-live-win').inert));
  await p.mouse.move(5, 5);
  const card = await p.$('a.mp-card');
  await card.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await card.click();
  await p.waitForSelector('[role=dialog]', { timeout: 30000 });
  await new Promise((res) => setTimeout(res, 4000));
  await p.keyboard.press('Escape');
  await new Promise((res) => setTimeout(res, 1500));
  console.log('popup fechou com Esc:', (await p.$$('[role=dialog]')).length === 0);
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
